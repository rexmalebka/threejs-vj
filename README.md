 vj system

try on here: https://www.rexmalebka.piranhalab.cc/vj/

Installation:
---
> git clone https://github.com/rexmalebka/threejs-vj.git
> 
> npm install

Usage:
---

> npm run dev

Buid:
---
> npm run build

one line script Syntax
---

Some options support one line script, just click on the label to toggle it
|  variable name |                                                                description                                                               |
|:--------------:|:----------------------------------------------------------------------------------------------------------------------------------------:|
|      **t**     | time counter since the page loaded                                                                                                       |
|      **a**     | audio analyser, a[0] to a[1024] to get fft data                                                                                          |
| **ch1 - ch16** | midi channel, use as a number get raw velocity 0-127                                                                                     |
|   **ch1.on**   | true if note On was sent, false if note off was sent throught midi                                                                       |
|    **x,y,z**   | x,y,z current position x,y,z current rotation, x,y,z current scale, opacity, displacementScale, displaccementBias use x as current value |
|    **r,g,b**   | r,g,b current value in color script input                                                                                                |


To-Do:
---
- improve UI, make it less giant
- improve three js performance
- implement autosave and export/import
- implement Web midi messages
- implement Webcam support
- improv script eval


references:
---
- https://cocopon.github.io/tweakpane/
- https://threejs.org/docs/

