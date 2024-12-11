---
title: "Kreiranje fonta"
summary: "RG - Vježbe 1: kreiranje fonta"
topic: "računalna grafika"
lang: hr
tags:
  - Fonts
---

Kao editor vektorske grafike sam koristio Inkscape. Njega oduvijek koristim za
vektorsku grafiku i lako se snalazim u njemu.

Za slaganje slova sam krenuo s ispisivanjem abecede u nekom postojećem fontu
kojeg sam potom unakazio.

Umjesto komercijalne stranice `calligraphr.com`, koristio sam `fontforge`
program, koji, iako ružniji, ima puno veći broj značajki za izradu fontova te je
FOSS. Pratio sam [tutorial na
inkscape-manuals](https://inkscape-manuals.readthedocs.io/en/latest/creating-custom-fonts.html)
prilikom izrade.

Na `fontforge` nisam naviknut i teško mi je bilo snalaziti se u njemu, jer nema
najbolji UX dizajn. No za svrhu ovih vježbi nije bilo potrebna značajna razina
poznavnja tog programa.

<style>
@font-face {
  font-family: 'TinSvagelj';
  src: url('https://caellian.github.io/blog/2024/rg_font/tinsvagelj.ttf');
}
</style>

Ovako izgleda moj TrueType font:

<div class="font-display with-font">
<span>A</span>
<span>B</span>
<span>C</span>
<span>Č</span>
<span>Ć</span>
<span>D</span>
<span>Đ</span>
<span>Dž</span>
<span>E</span>
<span>F</span>
<span>G</span>
<span>H</span>
<span>I</span>
<span>J</span>
<span>K</span>
<span>L</span>
<span>Lj</span>
<span>M</span>
<span>N</span>
<span>Nj</span>
<span>O</span>
<span>P</span>
<span>R</span>
<span>S</span>
<span>Š</span>
<span>T</span>
<span>U</span>
<span>V</span>
<span>Z</span>
<span>Ž</span>
</div>

Baseline mi je ispao dosta visoko. Obično se nalazi na 20% visine (odozdo). To
je dosta vidljivo u sljedećim paragrafima kod slova engleske abecede koja
nedostaju:

<style>
.font-display {
  display: flex;
  flex-wrap: wrap;
  background: var(--bg-accent);
  gap: 0.4rem;
  justify-content: center;
  padding: 0.7rem;
  border-radius: 0.2rem;

  &>span {
    position: relative;
    background: #111;
    font-size: 4rem;
    text-align: center;
    width: 5rem;
    height: 5rem;
    border-radius: 0.5rem;

    &:before {
      display: block;
      content: "";
      width: 100%;
      height: 2px;
      background-color: #E008;
      position: absolute;
      top: calc(0.2 * 5rem);
    }
    &:after {
      display: block;
      content: "";
      width: 100%;
      height: 2px;
      background-color: #00E8;
      position: absolute;
      bottom: calc(0.3 * 5rem);
    }
  }
}
</style>

Evo lorem ipsum:

<div class="with-font">

Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla tempor donec facilisi
felis auctor. Cursus potenti augue proin bibendum pretium dapibus ante? Integer
finibus amet laoreet luctus blandit dis ex pharetra vel. Aliquet ex vitae donec
litora magnis. Hendrerit sit ornare faucibus in commodo ligula. Eleifend iaculis
praesent ligula malesuada netus. Eleifend proin quisque viverra pretium ultrices
litora nisi. Pulvinar interdum efficitur purus cras ultrices mus congue augue
aptent.

Dapibus a suscipit rutrum porttitor molestie luctus malesuada. Per elementum non
ante bibendum netus rhoncus integer maecenas! Mattis finibus primis aliquam
adipiscing; habitant ex odio gravida? Porttitor quis blandit class; eget cubilia
etiam. Dignissim maximus mattis id non nam ipsum consequat. Cras mus rutrum
ullamcorper hendrerit, ac diam per. Class senectus erat class nulla ad
scelerisque cursus duis dapibus. Cubilia libero leo ridiculus habitant dictum;
ad laoreet sit.

Vestibulum imperdiet curae euismod diam nostra placerat hac. Dapibus orci ornare
lacinia duis; neque nascetur fringilla vehicula? Nisi imperdiet tempor amet
finibus pharetra risus. Sollicitudin nisl adipiscing consequat eleifend nibh.
Enim vehicula rutrum ultrices volutpat metus. Est scelerisque primis, phasellus
facilisi justo lacus lobortis. Enim commodo habitasse mattis lorem neque fusce
malesuada nascetur. Blandit finibus consectetur aptent inceptos; cras rhoncus.
Efficitur bibendum ut nostra dolor nascetur pulvinar lectus habitasse.

Varius aptent et arcu habitant scelerisque at eget parturient. Lobortis dolor
tempor non eu leo tincidunt scelerisque. Fringilla pretium primis velit
condimentum ad iaculis netus dui. Ligula sociosqu mattis erat massa; ad vehicula
pretium. Tellus sagittis dictumst at elementum ante blandit, integer vestibulum
tincidunt. Sollicitudin purus morbi ultrices netus suspendisse rutrum tortor
nulla. Massa vitae fusce ex conubia inceptos. Hendrerit aptent montes aliquam
justo diam torquent cubilia. Sociosqu nulla sagittis risus primis adipiscing
vehicula fermentum non. Sodales laoreet suspendisse ultricies quisque lacinia
morbi tellus.

Ultrices tempor orci ipsum sociosqu condimentum inceptos gravida auctor. Nibh
accumsan turpis ullamcorper amet dui consectetur vel consectetur. Feugiat etiam
dictum eleifend vestibulum varius eget ante enim. Inceptos tempus nisi convallis
porttitor arcu convallis luctus. Feugiat aliquam felis aliquam vulputate
ullamcorper scelerisque. Nulla est neque suscipit sociosqu pellentesque,
vehicula ipsum egestas. Nunc laoreet odio lectus sociosqu magnis habitasse.
Felis integer dui bibendum erat porttitor ac.

</div>

I evo primjera slike:
![primjer u obliku slike](https://caellian.github.io/blog/2024/rg_font/primjer_slika.png)

<style>
.with-font * {
  font-family: TinSvagelj;
}
</style>

Popratne datoteke je moguće preuzeti [ovdje](https://caellian.github.io/blog/2024/rg_font/tinsvagelj_font.zip).
