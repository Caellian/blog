---
title: "Pokretna Grafika"
summary: "RA - DZ1: Pokretna Grafika"
topic: "računalna animacija"
lang: hr
tags:
  - Blender
---

# Prva domaća zadaća

U sklopu ove zadaće je bilo potrebno složiti pokretnu grafiku s dvije scene:
- prva, uvodna, koja sadrži ime i naziv dijagrama s animacijom otkrivanja teksta, i
- druga koja sadrži animirani stupićasti dijagram proizvoljnih podataka.

Prikazao sam podatke koje sam prikupljao za drugi kolegij, a radi se o stopi
fluktuacije zaposlenih osoba (engl. _employee turnover rate_) u SAD-u koje
prikuplja Američki Zavod za Statistiku Rada. Te statistike su dostupne putem
[službene stranice](https://www.bls.gov/opub/mlr/2014/article/examination-of-state-level-labor-turnover-survey-data.htm),
pod nazivom "Examination of State Level Labor Turnover Survey Data" gdje su
objavljene 2014. godine u digitalnom obliku, iako su bile prikupljane ranije.

## Proces izrade

Za prvi dio animacije sam se držao više uputa. Stavio sam da se ploha iza imena
uvećava i translatira kako bi dobio efekt koji je prikazan u rezultatu. Sama
translacija kose plohe mi se činila atraktivnijom, no zadatak je zahtijevao da se
uvećava tako da radi oboje, iako je uvećanje redundantno.

Dodao sam i drugačiju animaciju za naslov. Želio sam inicijalno stvoriti efekt
punjenja s vodom, no ta ideja bi oduzela previše vremena za prvi dio zadatka. I
srećom sam odustao jer rasterizacija drugog dijela traje već preko sat vremena,
iako sam stavio nisku kvalitetu rasterizacije.

Kasnije, dok sam proučavao kompozitor u Blenderu sam primijetio da se putem njega
mogu postignuti mnogi efekti koje bih prethodno išao slagati u modelu scene. Do
sada sam izbjegavao uređivanje videozapisa u Blenderu, no nakon ove domaće
zadaće sam se dosta uhodao u proces upravljanja velikim brojem složenih scena i
različitih `.blend` datoteka kao i sigurnim načinom rada s operacijama nisu
lagane za vratiti (barem kako sam očekivao, sve izmjene od skripte su grupirane
u zajedničku povratnu radnju (engl. _undo_)).

Na drugom dijelu sam izgubio sat/dva na izradu SVGa manjeg obujma podataka
prije nego li sam skužio da mi unaprijed izrađen mesh ne pomaže puno. Nakon
razmatranja situacije sam odlučio koristiti Python za automatsko generiranje
ključnih kadrova kako bih uštedio vrijeme koje bi mi oduzelo ručno namještanje
linearnih transformacija. To mi je dopustilo da u nekoj mjeri i animiram
vrijednosti stupaca u stupićastom dijagramu jer je bio spreman izračun svega
potrebnog za njihovo ponovno stvaranje.

Konačno, za format za pohranu je odabran WebM jer je taj format stvoren za
prikaz putem interneta (na ePortoliu), a video je kodiran s VP9 koderom jer je
on uobičajen za WebM format. Moguće ga je otvoriti sa svim modernim
preglednicima pa se lagano i pregledava.

<video width="320" height="240" controls>
    <source src="https://caellian.github.io/blog/2025/ra_blender_motion_graphics/render.webm" type="video/webm">
    <source src="https://caellian.github.io/blog/2025/ra_blender_motion_graphics/render.mp4" type="video/mp4">
</video>

## Python kod

Sjetio sam se koristiti Python jer je jedan od kolega imao seminarski rad na
temu kreativnog programiranja. Za krajnji rezultat je pojednostavio postupak
izrade, iako je prvotni cilj bio znatno jednostavniji (manje redova podataka).

Koristio sam ChatGPT za generiranje inicijalne skripte jer ona nije bodovan
element ove zadaće (uključena kopija u predanim datotekama). No naravno, ta
skripta nije radila skoro uopće, i prepravljanje je bilo teže nego složiti novu
od početka. Ono što je zapravo nadomješteno u procesu izrade je kopanje po
dokumentaciji i forumima te mi je tako LLM uštedio vrijeme koje bi inače bilo
potrebno za izradu.

## Zaključak

Iako sam relativno zadovoljan omjerom dobivene kvalitete i uloženog truda.
Postoje brojne stvari koje bih mogao doraditi u procesu prikaza.

Za početak, za relativno kratku animaciju, scena sadrži glomaznu količinu
generiranih komponenata - sama veličina `.blend` datoteke zbog toga poraste za
~26MB. Veći problem od veličine datoteke je to što je iznimno teško upravljati
sadržajem scene nakon što su animirane komponente stvorene.

Korištenjem geometrijskih čvorova (engl. _geometry nodes_) se taj problem može
potpuno ukloniti za ovu vrstu primjene. No oni bi mi oduzeli više vremena pa sam
se odlučio za ovu opciju.

Drugi nedostatak, koji ja jako vidljiv u krajnjem rezultatu jest to što tekst
nije pravilno pozicioniran iznad stupaca prilikom njihovog horizontalnog
pomicanja jer je u kodu zasebno interpoliran, a krajnje točke te interpolacije
se ne poklapaju s vrijednostima interpolacije stupca (nekoliko _ease-in-out_ !=
jedna _ease-in-out_ tranzicija). Da je tekst stvoren pomoću geometrijskih
čvorova, uvijek bi bio ispravno pozicioniran i ne bi ga bilo potrebno zasebno
animirati.

Osim toga, skriptu je moguće značajno poboljšati i učiniti ju lakšom za
ponovnu uporabu. U slučaju da napravim jedan od YT kanala gdje stavljam slične
animacije se svakako mogu vratiti i doraditi skriptu.

## Datoteke

Kako bi smanjio veličinu prenesenih datoteka, složio sam `.blend` datoteku koja
nema generirane komponente pa ih je samo potrebno generirati prije
rasterizacije.

U svrhu potpunosti sam uključio i prikupljene podatke u `.ods` formatu.

Materijali korišteni za izradu se mogu preuzeti u obliku ZIP arhive
[ovdje](./materials.zip).
