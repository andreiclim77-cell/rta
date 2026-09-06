"""Chromium module integration tests. Synthetic labelled data on localhost only."""
import asyncio
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get('TOP20_QA_OUT', ROOT / 'qa-top20'))
HARNESS = '''<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:16px;background:#0e1116;color:#eee;font-family:Arial,sans-serif}*{box-sizing:border-box}#market2026Root{max-width:1200px;margin:auto}</style></head><body><p>TEST AUTOMAT — date sintetice, nu clasament real</p><div id="market2026Root"><div class="market-hero"><div class="market-hero-top"><span>06:00</span></div></div><section id="marketManagementCockpit"><p class="mgmt-kicker">Analysis</p><h2>Analiza</h2></section><section id="marketHypeRadar"><h2>Hype</h2></section><section id="marketSourceInfo"><h2>Info surse</h2></section><div id="market2026Body">Technical</div><div class="market-toolbar">Toolbar</div></div><script src="/assets/market-view-switcher.js"></script></body></html>'''

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/__top20_test__'):
            data=HARNESS.encode()
            self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8')
            self.end_headers(); self.wfile.write(data)
        else: super().do_GET()
    def log_message(self,*args): pass

async def main():
    OUT.mkdir(exist_ok=True, parents=True)
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    fixture=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./tools/top20/fixtures.js').fixture()))"],cwd=ROOT))
    report=[]
    try:
        async with async_playwright() as p:
            browser=await p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None)
            for width in (390,1366):
                page=await browser.new_page(viewport={'width':width,'height':900})
                errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                state={'mode':'disconnected','delay':0,'fixture':json.loads(json.dumps(fixture))}
                # Test-browser only. Production continues to reject test_fixture.
                await page.add_init_script("""Object.defineProperty(window,'RTATop20Core',{configurable:true,get(){return this.__qaCore},set(value){const original=value.build;value.build=(b,o)=>original(b,Object.assign({},o,{allowTest:true,now:'2026-09-06T14:00:00.000Z'}));this.__qaCore=value}})""")
                def payload():
                    raw=json.dumps(state['fixture'],ensure_ascii=False,separators=(',',':'))
                    digest=hashlib.sha256(raw.encode()).hexdigest()
                    return raw,dict(schema_version=2,status='ready',evidence_path='/data/google-pod-evidence/'+digest+'.json',evidence_sha256=digest)
                async def manifest(route):
                    if state['delay']: await asyncio.sleep(state['delay'])
                    if state['mode']=='http-error': await route.fulfill(status=503,body='Unavailable');return
                    if state['mode']=='disconnected': data={'schema_version':2,'status':'source_not_connected'}
                    else: data=payload()[1]
                    await route.fulfill(json=data)
                async def evidence(route):
                    raw=payload()[0]
                    if state['mode']=='bad-hash':raw+=' '
                    await route.fulfill(content_type='application/json',body=raw)
                await page.route('**/data/google-pod-top20-2026.json',manifest)
                await page.route('**/data/google-pod-evidence/*.json',evidence)
                await page.goto(base+'/__top20_test__',wait_until='domcontentloaded')
                buttons=page.locator('#marketViewSwitcher [data-primary]')
                assert await buttons.count()==4
                await page.locator('[data-primary="top20"]').click()
                panel=page.locator('#marketTop20Pod')
                await panel.locator('text=Sursa Google nu este conectată').wait_for()
                assert await panel.locator('tbody tr').count()==0
                assert await page.locator('#marketManagementCockpit').is_hidden()
                await page.screenshot(path=str(OUT/f'disconnected-{width}.png'),full_page=True)
                report.append(f'{width}: disconnected state has no fabricated rows')
                state['mode']='ready'
                await panel.locator('[data-top20-refresh]').click()
                await panel.locator('tbody tr').first.wait_for()
                assert await panel.locator('tbody tr').count()==20
                assert 'Model 24' in await panel.locator('tbody tr').first.inner_text()
                assert await panel.locator('tbody tr').first.locator('td').nth(1).inner_text() in ('2.610','2,610')
                assert await page.locator('[data-primary="top20"]').get_attribute('aria-pressed')=='true'
                report.append(f'{width}: valid fixture renders 20 measured rows and computed values')
                await panel.locator('[data-top20-month]').select_option('2025-09')
                assert await panel.locator('tbody tr').first.locator('td').nth(2).inner_text()=='—'
                await panel.locator('[data-top20-month]').select_option('2026-08')
                report.append(f'{width}: month selector and missing prior-month baseline')
                async with page.expect_download() as d:
                    await panel.locator('[data-top20-csv]').click()
                download=await d.value
                assert download.suggested_filename=='google-pod-top20-RO-2026-08.csv'
                await download.save_as(OUT/f'test-only-export-{width}.csv')
                report.append(f'{width}: CSV export works')
                state['mode']='bad-hash'
                await panel.locator('[data-top20-refresh]').click()
                await panel.locator('[role="alert"]').wait_for()
                assert await panel.locator('tbody tr').count()==20
                report.append(f'{width}: corrupt evidence retains dated prior snapshot with warning')
                state['mode']='ready';state['delay']=0.5
                await panel.locator('[data-top20-refresh]').click()
                await page.locator('[data-primary="hype"]').click()
                await page.wait_for_timeout(750)
                assert await panel.is_hidden()
                assert await page.locator('#marketHypeRadar').is_visible()
                await page.locator('[data-primary="sources"]').click()
                assert await page.locator('#marketSourceInfo').is_visible()
                assert await page.locator('#market2026Body').is_visible()
                await page.locator('[data-primary="analysis"]').click()
                assert await panel.is_hidden()
                assert await page.locator('#market2026Body').is_hidden()
                report.append(f'{width}: asynchronous reload does not steal active tab; all four views isolated')
                await page.locator('[data-primary="top20"]').click()
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                assert not errors,errors
                await page.screenshot(path=str(OUT/f'fixture-only-{width}.png'),full_page=True)
                report.append(f'{width}: no horizontal page overflow and no JavaScript errors')
                await page.close()
            await browser.close()
    finally: server.shutdown()
    (OUT/'browser-results.json').write_text(json.dumps({'passed':len(report),'failed':0,'scope':'Chromium module integration on localhost; synthetic labelled fixtures, not a live Google API test','checks':report},ensure_ascii=False,indent=2))
    print('\n'.join(report))

if __name__=='__main__': asyncio.run(main())
