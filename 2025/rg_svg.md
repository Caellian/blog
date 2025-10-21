---
title: "Vektorska grafika"
summary: "RG - Vježbe 2: SVG"
topic: "računalna grafika"
lang: hr
tags:
  - SVG
---

Cilj ovih vježbi je bio kratki pregled sposobnosti SVG formata. SVG format je
format za pohranu vektorske grafike. Bilo mi je malo teško prisiliti se odraditi
ovu vježbu jer sam proveo dvije godine života buljeći u SVG i njegovu
specifikaciju, proučavanje [pathfindera](https://github.com/servo/pathfinder) i
njegove implementacije, radu na komercijalnom editoru koji koristi taj stog za
prikaz sučelja (poput figme), experimentiranju s [generiranjem
modela](https://github.com/Caellian/structuredvg) na osnovu teksta specifikacije
(bez LLMa zbog resursa),
[raspravama](https://github.com/linebender/resvg/issues/841) o postojećim
renderima, ...

Prvi dublji kontakt sa SVG formatom sam imao kada je ShaRose prestao ažurirati
[GuiAPI](https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/minecraft-mods/1276886-1-5-2-guiapi-an-advanced-gui-toolkit);
imao sam (nerealistično velike) ambicije napisati rasterizer koji koristi SVG
umjesto tekstura za dinamička grafička sučelja - nešto poput
[ksvg](https://github.com/KDE/ksvg) biblioteke od KDE projekta.

Iako sam manje zainteresiran za SVG ovih dana, dobro san upoznat s njim jer je
bitan za web razvoj (time i financijske sigurnosti), a ujedno je i jedini
otvoreni format za pohranu vektorske grafike što je bitno za stiliziranje
skalabilnih grafičkih sučelja.

U ovim vježbama me iznenadila uporaba `CDATA` za CSS jer nije potrebnoa u
preglednicima koji koriste poseban parser za `<style>`, ali je za `.svg`
datoteke. SVG specifikacija je toliko komplicirana da ju jedino preglednici
podržavaju (ni oni u potpunosti). Zbog toga se "u divljini" vrlo rijetko viđa
CSS koji uključuje znakove poput `<` ili `&` u samim `style` blokovima, jer
takav kod zbuni gotovo sve alate/programe (neovisno o `CDATA`).

Podrška SVG formata nije nikad potpuna i zahtjeva kompromise, što je ujedno i
razlog zašto koristim ovaj format rijeđe nego što bih volio. Na primjer:
- [skriptiranje i interaktivnost](https://www.w3.org/TR/SVG2/interact.html) su rijetko podržani,
    - Safari ima katastrofalno spor renderer za SVG što ograničava uporabu [vrlo
      interaktivnih prikaza](https://azgaar.github.io/Fantasy-Map-Generator/) u
      komercijalnim primjenama.
- editori ne dozvoljavaju uređivanje [značajki
  pristupačnosti](https://www.w3.org/TR/SVG2/access.html#AccessibilityAndSVG)
  ili je podrška vrlo ograničena,
- [foreignObject](https://www.w3.org/TR/SVG2/embedded.html#ForeignObjectElement) sam vidio da se koristi samo sa HTMLom, i to rijetko,
- [metadata](https://www.w3.org/TR/SVG2/struct.html#MetadataElement) se iznimno rijetko koristi za očuvanje izvornih podataka koji su stvorili SVG. To su lakši problemi...

U teže probleme spada kompozicija efekata poput blura koja je točna ili točan
prikaz stiliziranih krivulja blizu stvarnog vremena (dash array). Tu sam naveo
samo probleme s kojima sam se osobno susreo, vjerujem da postoji još mnogo
drugih.

Kroz ovu vježbu nisam naučio ništa novo, no dobro je napisana. Trebao sam
otvoriti MDN za stvari poput efekata jer ih nikad manualno ne pišem nego
koristim Inkscape.

Moje konačno rješenje izgleda ovako:

<div style="background:white">
<object data="https://caellian.github.io/blog/2025/rg_svg/tinsvagelj.svg" width="500" height="500" type="image/svg+xml"></object>
</div>

Popratne datoteke je moguće preuzeti
[ovdje](https://caellian.github.io/blog/2025/rg_svg/tinsvagelj_svg.zip).
