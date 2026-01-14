---
title: "3D Animacija"
summary: "RA - DZ2: 3D Animacija"
topic: "računalna animacija"
lang: hr
tags:
  - Blender
---

# Druga domaća zadaća

U sklopu ove zadaće je bilo potrebno izraditi i animirati 3D figuru.

## Izrada modela

Za izradu lika je korišten [MakeHuman](http://www.makehumancommunity.org/)
program koji dozvoljava interaktivno uređivanje likova korištenjem slidera te
generiranje modela u Collada (`.dae`) formatu.

Nakon uključivanja, model je odmah spreman za uporabu. Bilo je potrebno samo u
Shader editoru urediti način prikaza geometrije koja sadrži transparentnost da
povlači alpha vrijednost is sukladne teksture.

MakeHuman može generirati i kostur za animaciju, no zadaća je bodovala taj dio
procesa animacije lika pa sam kostur ručno izradio.

Konačan model je bio iznimno kvalitetan i pogodan za animaciju, no ličnost se
nije poklapala s referentnim materijalima pa sam naknadno doradio geometriju
modela u Blenderu.

## Izrada kostura

Nisam do sada nikada slagao kostur koji koristi inverznom kinematikom (engl.
_inverse kinematics_, IK) u Blenderu, iako sam se već susreo s uporabom IKa u
kontekstu izrade igrica.

Standardni nazivi za kosti ne postoje, pa sam koristio Blenderovu konvenciju
imenovanja (npr. `Leg.Down.L`). Prednost kod imena koja završavaju s `.L`/`.R`
je to što prilikom simetrizacije (engl. _simetrization_) kostiju Blender sam
preimenuje kosti ispravno.

Blender dozvoljava puno mogućnosti za postavljanje ograničenja, pa sam pratio
iznimno kratke, ali detaljne video upute na YouTube platformi:
- [Royal Skies - Blender 2.8 Inverse Kinematics in 2 Minutes](https://www.youtube.com/watch?v=Pt3-mHBCoQk)
- [Royal Skies - Blender 2.8 Inverse Kinematics Shortcuts](https://www.youtube.com/watch?v=Cu5TozPfsD4)

## Automatska dodjela težina i polje utjecaja

Automatska dodjela težina (engl. _automatic weights_) u Blenderu je bolja za
animacije složenije geometrije (u ovom slučaju osobe). Zadavanje vrhova grupama
s poljem utjecaja (engl. _envelope weights_) bolje paše za jednostavnije
predmete koji se mogu elastično deformirati.

U mom slučaju automatsko zadavanje vrhova grupama s poljem utjecaja nije
ispravno dodao težinu svim vrhovima pa nije bio direktno upotrebljiv. Zbog toga
niti nisam imao drugi izbor (zbog vremenskog ograničenja) doli koristiti
automatsku dodjelu težina, no srećom, kao što sam već rekao, u ovom slučaju ona
inaće daje rezultate koji izgledaju bolje.

![slika prikazuje značajne distorzije vidljive prilikom pomicanja udova kada je
korišten "envelope weights", i "automatic weights" rezutat za
usporedbu](./automatic_weights.png)

Automatska dodjela težina također nije savršeno radila, te je za produkcijsko
okruženje definitivno potrebno naknadno uređivanje. Jer su defekti bili skoro
nevidljivi za razinu uporabe u ovoj domaćoj zadaći, nisam išao prepravljati
težinske vrijednosti utjecaja kostiju na deformaciju geometrije.

## Animacija

Kako bi se postigla animacija koja izgleda realistično, korišteno je snimanje pokreta
(engl. _motion capture_).

Kod snimanja pokreta je iznimno bitno znati karakteristike kamere koja snima scenu jer
fizičke karakteristike kamere, kao i postavke prilikom snimanja, značajno utječu na
distorzije u snimljenom prostoru. Ja sam koristio 0.5x uvečanje prilikom snimanja, te je
zbog toga mobitel koristio širokokutnu kameru (engl. _wide angle camera_). S obzirom da
nisam uspio pronaći karakteristike kamere bio sam prisiljen odokativno ih procjeniti te
je to uzrokovalo trapezoidnu deformaciju praćenih točaka kada su bile projicirane u 3D
prostor u Blenderu.

Druga pogreška koju sam napravio je bila pozadina - idealno je da postoji što je veći
mogući kontrast između pozadine i snimanog predmeta/osobe. Ovaj dio sam uspio dovoljno
korigirati u Kdenlive programu kako bih izbjegao ponovno snimanje.

Konačno, bilo je potrebno korigirati neke praćene točke. Na primjer, korijenska točka
(engl. _root_) u modelu je postavljena na tlu, a pratio sam sliku na majici za poziciju
tijela; zbog toga je prilikom primjene ograničenja cijeli model bio translatiran
vertikalno za vektor razlike pozicija te dvije točke. Zbog prethodno navedene deformacije
sam također morao dodati i ograničenje za minimalnu vertikalnu poziciju tijela kako ono
ne bi prodiralo kroz pod.

Iako Blender podržava automatsko praćenje točaka, zbog zamućenja pokreta
(engl. _motion blur_) i okluzije koljena dlanovima, ono nije davalo zadovoljavajuće
rezultate pa sam morao ručno pozicionirati prateće točke za svaki okvir (engl. _frame_)
snimke.

## Rezultat

Rezultat izgleda dobro jer geometrija modela koja je usmjerena prema kameri skriva
distorzije na leđima. Jedina vidljiva mana je udaljenost dlanova od tijela koja je
uzrokovana deformacijom širokokutne kamere - na žalost nisam imao dovoljno veliki prostor
za ponovno snimanje s normalnom kamerom.

<video width="320" height="240" controls>
    <source src="https://caellian.github.io/blog/2026/rg_blender_motion_tracking/render.webm" type="video/webm">
    <source src="https://caellian.github.io/blog/2026/rg_blender_motion_tracking/render.mp4" type="video/mp4">
</video>

## Datoteke

Materijali korišteni za izradu se mogu preuzeti u obliku ZIP arhive
[ovdje](./files.zip).
