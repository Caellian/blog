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

Za animiranje kretanja sam koristio dva različita pristupa:
- iz poze u pozu (engl. _pose-to-pose_), i
- linearno (engl. _straight ahead_).

Početni dio s hodom je bio animiran iz poze u pozu i rezultat je neprirodno
pomicanje lika po površini. Drugi dio (hod uz stubište) je bio animiran
linearno, i dok je sadržavao više ključnih okvira, animacija izgleda puno bolje.

![ciklus hodanja koji se sastoji od 4 ključna okvira](./walk_cycle.jpg)

Hod se sastoji od 4 ključna okvira koji se ponavljaju.
- **Kontakt** (engl. _contact_) - početna faza hoda je stanje između koraka gdje su stražnji prsti savinuti, a razmak između noga najrašireniji.
- **Dolje** (engl. _down_) - stražnja noga napušta podlogu, a teret se prebacuje na prednju. Lik je obično nešto niži u ovoj fazi.
- **Prolazak** (engl. _passing_) - prednja noga je poravnata s tlom, a stražnja ju prelazi. Lik je u ovoj fazi nešto viši nego u početnoj.
- **Gore** (engl. _up_) - stražnja noga je sada nova prednja. Prethodna prednja
  zaostaje iza lika s blago savinutim prstima. Lik je nešto viši jer ga podiže
  ispruženo stopalo. Stopalo nove prednje noge je ravno.
- Tome slijedi ponovo kontakt, samo zrcaljen. Ponavlja se isti ciklus sa
  zamijenjenom prednjom i stražnjom nogom.

Zbog manjka iskustva i mana izrađenog modela, animacija je na kraju sadržavala
nešto veći broj ključnih okvira nego je bilo potrebno.

Problem s kojim sam se susreo je bilo pomicanje koljena prema van prilikom hoda,
iako su kontrolne kosti bile ispravno smještene. Vjerujem da je uzrok bio što
točka prijelaza kostiju nogu (u koljenu) nije bila dovoljno pomaknuta prema
naprijed.

## Rezultat

Konačan rezultat izgleda iznimno loše, no premašio je moja očekivanja. Vjerujem
da bih mogao mnoge mane koje su proizašle iz sitnih pogrešaka u procesu izrade
sada ispraviti.

<video width="320" height="240" controls>
    <source src="https://caellian.github.io/blog/2025/ra_blender_motion_graphics/render.webm" type="video/webm">
    <source src="https://caellian.github.io/blog/2025/ra_blender_motion_graphics/render.mp4" type="video/mp4">
</video>

## Datoteke

Materijali korišteni za izradu se mogu preuzeti u obliku ZIP arhive
[ovdje](./files.zip).
