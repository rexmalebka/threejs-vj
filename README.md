 vj system

threejs system that allows to interact and create visuals from 3D meshes, using textures and geometry / material properties in a 3D spacce
![image](https://user-images.githubusercontent.com/17996715/154858972-c5a08bfd-0861-40d7-a9d4-2e2c8f942d65.png)

try on here: https://www.rexmalebka.piranhalab.cc/threejsvj

- **Source**: a 3D Mesh made from a geometry + Material
- **Geometry**: shape or skeleton of an object
- **Material**: skin of the Mesh object that holds a texture
- **Texture**: a Video Texture made from video sharing

Menu
---
![image](https://user-images.githubusercontent.com/17996715/154859162-b75c0ce8-92ad-47e3-8845-e28dc594cab0.png)

- **Scene**: the canvas of the visuals, this holds the image of the sources
- **Sources**: Source menu, that holds information of mesh properties, position, rotation, scale, geometry options and material options
- **Textures**: Textures menu, that holds information about video player, playback rate, and origin of source
- **interface**: Interfaces menu, that holds options to interface with audio, midi and live streaming
- **infos**: todo: instructions


one line script Options
---

Some options support one line script, just click on the label to toggle the script input
![image](https://user-images.githubusercontent.com/17996715/154859409-f0655333-5035-4295-972b-9d65cc7e05a9.png)

you can use math functions to generate dynamics on the mesh

| return value                   | example       | function                                                                                                                         |
|--------------------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------|
| number                         | x             | all the options get the same value, e.g. position x, y and z holds the same value                                                |
| number[]                       | [x,y,z]       | the options get the value from the list, e.g. position x, y and z holds the value value[0], value[1], value[2]                   |
| {x:number, y:number, z:number} | {x:1,y:2,z:3} | the options get the value from the specific object attribute, e.g. position x, y and z holds the value value.x, value.y, value.z |
| other                          | ""            | the options get the value from the last functional values                                                                        |


|  variable name |                                                                description                                                               |
|:--------------:|:----------------------------------------------------------------------------------------------------------------------------------------:|
|      **t**     | time counter since the page loaded                                                                                                       |
|      **a**     | audio analyser, a[0] to a[1024] to get fft data                                                                                          |
| **ch1 - ch16** | midi channel, use as a number get raw velocity 0-127                                                                                     |
|   **ch1.on**   | true if note On was sent, false if note off was sent throught midi                                                                       |
|    **x,y,z**   | x,y,z current position x,y,z current rotation, x,y,z current scale, opacity, displacementScale, displaccementBias use x as current value |
|    **r,g,b**   | r,g,b current value in color script input                                                                                                |



Audio interface
---
after selecting the audio device, you can use audio object to manipulate source/texture options

| value                | description                                                    |
|----------------------|----------------------------------------------------------------|
| +a                   | used "a" as a number, holds the mean value of the fft bins     |
| a[0]-a[1024]         | holds the value of the fft bin in  x position                  |
| a.amp                | used "a.amp" as a number, holds the mean value of the amp bins |
| a.amp[0]-a.amp[1024] | holds the value of the amp bin in x position                   |


Midi interface 
---

after selecting midi device,  you can use channels object to manipulate source/texture options
| value        | description                                                                |
|--------------|----------------------------------------------------------------------------|
| ch1 - ch16   | midi channel object                                                        |
| +ch1 - +ch16 | midi channel  object used as a number, holds the velocity value from 0-127 |
| ch1.raw      | holds the value of velocity from 0 to 127                                  |
| ch1.value    | holds the value of velocity from 0 to 1                                    |
| ch1.on       | if noteOn or noteOff                                                       |
| ch1.note     | note value sent                                                            |



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

