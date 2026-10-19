"""Build the browser article from the supplied illustrated Word document."""

from html import escape
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "articole" / "fumat-sau-vapat.docx"
DESTINATION = ROOT / "articole" / "fumat-sau-vapat" / "index.html"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def document_paragraphs():
    with ZipFile(SOURCE) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
        relationships = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
    media = {item.get("Id"): item.get("Target") for item in relationships}
    body = document.find(f"{W}body")
    result = []
    for paragraph in body.findall(f"{W}p"):
        content = "".join(item.text or "" for item in paragraph.iter(f"{W}t"))
        properties = paragraph.find(f"{W}pPr")
        style = properties.find(f"{W}pStyle") if properties is not None else None
        images = []
        for image in paragraph.iter(f"{A}blip"):
            target = media.get(image.get(f"{R}embed"), "")
            if target.startswith("media/image"):
                number = target.split("image", 1)[1].split(".", 1)[0]
                images.append(int(number))
        result.append((content.strip(), style.get(f"{W}val") if style is not None else "", images))
    return result


def build():
    paragraphs = document_paragraphs()
    if paragraphs[1][0] != "Fumat sau vapat?" or paragraphs[67][0] != "Surse":
        raise ValueError("The Word document structure changed; inspect it before rebuilding.")

    image_alts = {
        1: "Mod cu atomizor RTA pe fundal deschis",
        2: "Mod rosu cu atomizor RTA",
        3: "Adult care lucreaza la un dispozitiv de vapat",
    }
    content = []
    for index, (text, style, images) in enumerate(paragraphs[3:67], start=3):
        if text:
            if style == "Heading2":
                content.append(f'<h2 id="sectiunea-{index}">{escape(text)}</h2>')
            else:
                emphasis = ' class="fs-standout"' if index in (11, 29, 60) else ""
                content.append(f"<p{emphasis}>{escape(text)}</p>")
        for number in images:
            content.append(
                '<figure><img src="/assets/fumat-sau-vapat/ilustratie-{}.jpg" '
                'alt="{}" loading="{}" decoding="async"></figure>'.format(
                    number, escape(image_alts[number]), "eager" if number == 1 else "lazy"
                )
            )

    source_lines = [text for text, _, _ in paragraphs[68:] if text]
    if len(source_lines) % 3:
        raise ValueError("The source list is not made of title, explanation, and URL triples.")
    sources = []
    for index in range(0, len(source_lines), 3):
        title, explanation, url = source_lines[index:index + 3]
        if not url.startswith("https://"):
            raise ValueError(f"Unexpected source URL: {url}")
        sources.append(
            '<li><a href="{}" target="_blank" rel="noopener noreferrer">{}</a>'
            '<p>{}</p></li>'.format(escape(url, quote=True), escape(title), escape(explanation))
        )

    html = f'''<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fumat sau vapat? | Ghid RTA MTL</title>
<meta name="description" content="Articol ilustrat pentru fumatorii adulti: diferentele dintre fumat si vapat, dovezile disponibile, limitele si riscurile.">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://ghid-rta.ro/articole/fumat-sau-vapat/">
<meta property="og:type" content="article">
<meta property="og:title" content="Fumat sau vapat?">
<meta property="og:description" content="Un articol ilustrat pentru fumatorii adulti despre diferente, dovezi si limite.">
<meta property="og:url" content="https://ghid-rta.ro/articole/fumat-sau-vapat/">
<meta property="og:image" content="https://ghid-rta.ro/assets/fumat-sau-vapat/ilustratie-1.jpg">
<link rel="icon" href="/assets/favicon-192.png">
<link rel="stylesheet" href="/assets/fumat-sau-vapat/style.css?v=1">
</head>
<body class="fs-article-page">
<header class="fs-topbar"><div class="fs-topbar__inner"><a href="/#home">&larr; Ghid RTA MTL</a><span>18+ &middot; Material informativ</span></div></header>
<main class="fs-article" id="continut">
<div class="fs-intro"><p class="fs-eyebrow">{escape(paragraphs[0][0])}</p><h1>{escape(paragraphs[1][0])}</h1><p class="fs-deck">{escape(paragraphs[2][0])}</p></div>
<article class="fs-article__body">
{'\n'.join(content)}
<section class="fs-sources" aria-labelledby="surse-title"><h2 id="surse-title">Surse</h2><ol>{''.join(sources)}</ol></section>
<a class="fs-docx-link" href="/articole/fumat-sau-vapat.docx" download>Descarca documentul original (.docx)</a>
</article>
</main>
<footer class="fs-footer">Ghid RTA MTL &middot; Pentru adulti care fumeaza deja. Vapatul nu este lipsit de riscuri.</footer>
</body>
</html>
'''
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    DESTINATION.write_text(html, encoding="utf-8")
    print(f"Built {DESTINATION} from {len(paragraphs)} paragraphs and {len(sources)} sources")


if __name__ == "__main__":
    build()
