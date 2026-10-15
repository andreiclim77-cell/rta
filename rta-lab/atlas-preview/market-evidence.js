/* Editorial source records, kept apart from the protected 620-liquid catalog. */
(function(){
'use strict';
const accessed='2026-10-14';
const sources={
 bn:{title:'Black Note E-Liquid Review – Remarkable Range of E Juices',publisher:'Ecigclick',authors:'Dan W; Concerto/Quartet update: Neil H',url:'https://www.ecigclick.co.uk/black-note-e-liquid-review/',date:'2022-11-25',dateKind:'Data afișată a paginii actualizate; textul inițial este mai vechi',bias:'Linkuri comerciale / cod afiliat; proveniența mostrelor nu este explicită',accessed},
 ltBurley:{title:'Burley (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'NonoVape',url:'https://levapelier.com/en/burley-single-line-range-by-the-tobacconist/',date:'2025-03-25',bias:'Material furnizat de LCA',accessed},
 ltLatakia:{title:'Latakia (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'Selene',url:'https://levapelier.com/en/latakia-single-line-range-by-the-tobacconist/',date:'2025-04-30',bias:'Achiziție din fonduri proprii declarată',accessed},
 ltKentucky:{title:'Kentucky (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'Selene',url:'https://www.levapelier.com/kentucky-gamme-single-line-par-la-tabaccheria/',date:'2025-04-23',bias:'Achiziție din fonduri proprii declarată',accessed},
 ltCavendish:{title:'Cavendish (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'NonoVape',url:'https://www.levapelier.com/cavendish-gamme-single-line-par-la-tabaccheria/',date:'2025-04-05',bias:'Material furnizat de LCA',accessed},
 special:{title:'Black Note Special Blend NET E-liquid',publisher:'Planet of the Vapes',authors:'Michelle (Purplefowler)',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/black-note-special-blend-net-e-liquid.html',date:null,bias:'Produse trimise de Black Note',accessed},
 prime:{title:'Prime 15 (Shake “N” Vap) – Halo',publisher:'Le Vapelier',authors:'papagallo',url:'https://www.levapelier.com/prime-15-gamme-shake-n-vap-par-halo/',date:'2021-07-29',bias:'Material furnizat de Nicovip',accessed},
 tribeca:{title:'Tribeca (Shake “N” Vap) – Halo',publisher:'Le Vapelier',authors:'papagallo',url:'https://www.levapelier.com/tribeca-gamme-shake-n-vap-par-halo/',date:'2021-07-20',bias:'Material furnizat de Nicovip',accessed},
 manabush:{title:'The Big Manabush Review – Part 1',publisher:'Planet of the Vapes',authors:'Toby Kilroy',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/occultscientist_the-big-manabush-review-part-1.html',date:null,bias:'Gama trimisă de Manabush',accessed},
 omusa:{title:'Omusa by Manabush',publisher:'Planet of the Vapes',authors:'VapeMaster; MrTeaTime; dw1986',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/vapemaster_omusa-by-manabush.html',date:'2015-08-03',bias:'Mostre trimise de Manabush; trei opinii în același articol, nu trei surse independente',accessed},
 deadwood:{title:'Deadwood Blends by Manabush',publisher:'Planet of the Vapes',authors:'Michelle (Purplefowler)',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/deadwood-blends-by-manabush.html',date:null,bias:'Gama trimisă de Manabush',accessed}
};
const rows=[];
function add(id,brand,name,category,version,profile,why,sourceId,matchName=null,line=null,caveat=''){
 rows.push({id,brand,name,category,version,profile,why,sourceIds:[sourceId],match:matchName?{brand,name:matchName,line,category}:null,caveat,confidence:'Review singular',consensus:false});
}
const bnLine='Traditional Tobacco',bnVersion='E-liquid original / nume muzical evaluat; edițiile actuale pot diferi';
[
 ['prelude','Virginia / Prelude','Virginia delicată, ușor dulce.','Preferat pentru finețe în review.','Virginia (Prelude)'],
 ['forte','Burley / Forte','Corp plin, caracter de Burley.','Review-ul apreciază echilibrul și textura.','Burley (Forte)'],
 ['legato','Kentucky / Legato','Lemn, pământ, nuanță de nucă.','Evaluare favorabilă pentru corp și finețe.','Kentucky (Legato)'],
 ['sonata','Cavendish / Sonata','Dulceață de tutun, senzație cremoasă.','Review favorabil profilului rotund.','Cavendish (Sonata)'],
 ['quartet','Latakia / Quartet','Uscat, fum, final piperat.','Neil H apreciază caracterul pronunțat.','Latakia (Quartet)'],
 ['concerto','Cigar / Concerto','Țigară de foi, condimente, fum discret.','Neil H apreciază intensitatea și textura.','Cigar (Concerto)']
].forEach(([id,name,profile,why,match])=>add('bn-'+id,'Black Note',name,'NET simplu',bnVersion,profile,why,'bn',match,bnLine,'Potrivire la reperul comercial din catalog, nu certificare de lot sau formulă actuală.'));
[
 ['burley','Burley','Uscat, lemnos, prăjit.','Distincția Top Vapelier în review.','ltBurley'],
 ['latakia','Latakia','Fum, tămâie, condimente, piele.','Distincția Top Vapelier în review.','ltLatakia'],
 ['kentucky','Kentucky','Fum de lemn, piele, intens și uscat.','Distincția Top Vapelier în review.','ltKentucky'],
 ['cavendish','Cavendish','Corp blond, miere și nuanțe de fond.','Distincția Top Vapelier în review.','ltCavendish']
].forEach(([id,name,profile,why,source])=>add('lt-single-'+id,'La Tabaccheria',name,'NET simplu','Extra Dry 4Pod / Single Line / longfill 40 ml',profile,why,source,null,null,'Versiune distinctă de extrasele clasice din catalog. Single Line este clasificarea comercială.'+(id==='cavendish'?' Cavendish descrie o preparare și nu dovedește o singură specie botanică.':'')));
add('bn-special','Black Note','Special Blend','NET complex','Special Blend evaluat în review','Virginia, Burley și Oriental; lemn discret.','Review favorabil amestecului echilibrat.','special','Special Blend','Natural Tobacco','Catalogul nu identifică lotul/formula; review-ul nu confirmă edițiile ulterioare.');
add('bn-special-3','Black Note','Special Blend 3.0','NET complex','Special Blend 3.0 evaluat separat','Mai întunecat, dens și condimentat.','Reviewerul îl diferențiază de versiunea originală.','special',null,null,'Nu se confundă cu Special Blend fără versiune din catalog.');
add('bn-special-menthol','Black Note','Special Blend Menthol','NET complex','Blend cu mentol, evaluat separat','Tutun American Blend și mentă.','Review favorabil versiunii mentolate.','special',null,null,'Nu se confundă cu Special Blend ori Solo.');
add('bn-solo','Black Note','Solo','NET complex','E-liquid Solo evaluat în gama originală','Virginia delicată și mentol.','Review favorabil echilibrului mentolat.','bn',null,null,'NET aromatizat: frunza este completată de mentol.');
add('halo-prime','Halo','Prime 15','Tutun simplu','Shake “N” Vap / 50 ml, review 2021','Tutun uscat, lemn, nuanță de cacao.','Distincția Top Jus în review.','prime',null,null,'Tutun dominant; cacao este o notă percepută, nu dovadă de ingredient adăugat. Originea NET nu este documentată în review; clasificare editorială aromatizată. Catalogul are numele Prime15 fără această versiune.');
add('halo-tribeca','Halo','Tribeca','Tutun complex','Shake “N” Vap / 50 ml, review 2021','Tutun blond, vanilie, caramel, nuci.','Distincția Top Jus în review.','tribeca',null,null,'Catalogul nu separă această versiune de concentrat ori alte ediții. Clasificarea este editorială, fără dovadă NET.');
[
 ['powwow','Powwow Sauce','Tutun dulce, cremă și nuanțe de custard.','Unul dintre preferatele reviewerului.'],
 ['ixcacao','IxCaCao','Tutun, ciocolată, nuanțe de nucă.','Unul dintre preferatele reviewerului.'],
 ['waxahachie','Waxahachie','Tutun și turtă dulce cu ghimbir.','Evaluare favorabilă combinației.'],
 ['nanabozho','Nanabozho','Tutun, banană și nuanțe de cremă.','Evaluare favorabilă profilului stratificat.']
].forEach(([id,name,profile,why])=>add('manabush-'+id,'Manabush',name,'Tutun complex','Nokomis / gama originală evaluată',profile,why,'manabush',name,'Nokomis / FireWater / Extended','Reper asociat gamei originale; nu transferăm review-ul către variante Extended sau reformulări. Clasificare editorială aromatizată, fără dovadă NET.'));
add('manabush-omusa','Manabush','Omusa','Tutun complex','Omusa original / e-liquid 10 ml evaluat în 2015','Tutun, rom, vanilie și toffee.','Trei opinii favorabile în articolul de review.','omusa','Omusa','Nokomis / FireWater / Extended','Același articol și același lot furnizat: nu afirmăm consens independent.');
[
 ['prairie','Prairie Dawn','Tutun, patiserie și cremă de vanilie.','Reviewerul apreciază finalul cremos.'],
 ['wildbil','Wild Bil','Tutun, whisky și cremă.','Reviewerul apreciază diferențierea profilului.'],
 ['calamity','Calamity AM','Migdale, vanilie, smochină și tutun.','Reviewerul apreciază combinația distinctă.']
].forEach(([id,name,profile,why])=>add('deadwood-'+id,'Manabush',name,'Tutun complex','Deadwood Blends / shortfill evaluat',profile,why,'deadwood',name,'Deadwood Blends','Reper comercial asociat; nu certifică versiunea, lotul sau disponibilitatea actuală.'));
rows.find(e=>e.id==='bn-prelude').photo={src:'./media/black-note-virginia-current.webp',ref:'https://www.blacknote.com/e-juice/virginia-tobacco-e-liquid/',credit:'Black Note',edition:'Ambalaj actual Virginia 60 ml; review-ul privește Prelude original'};
for(const entry of rows){const text=entry.name+' '+entry.profile;entry.modelTags=[];for(const tag of ['latakia','kentucky','perique','oriental','cigar'])if(new RegExp(tag,'i').test(text))entry.modelTags.push(tag);if(/nuc|migdale/i.test(text))entry.modelTags.push('nuts');if(/dulc|miere|vanili|caramel|toffee/i.test(text))entry.modelTags.push('sweet');if(entry.category.includes('complex'))entry.modelTags.push('layers');}
window.RTA_MARKET_EVIDENCE={version:1,revised:accessed,categories:['NET simplu','NET complex','Tutun simplu','Tutun complex'],sources,rows};
})();
