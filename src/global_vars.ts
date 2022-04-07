import { Clock } from 'three'
import Window from './app'


declare global {
	interface Window{
		t: number
		m: m
		on: {
			[name:string] : any
		}
                ch1: chan
                ch2: chan
                ch3: chan
                ch4: chan
                ch5: chan
                ch6: chan
                ch7: chan
                ch8: chan
                ch9: chan
                ch10: chan
                ch11: chan
                ch12: chan
                ch13: chan
                ch14: chan
                ch15: chan
                ch16: chan
	}
}


//  chan stuff

interface chan{
	raw: number
	value: number
	note: number
	on: boolean
}

class chan implements chan{
        constructor(){
                this.raw = 0.0
                this.value = 0.0
                this.on = false
                this.note = 0
        }

        [Symbol.toPrimitive](hint:string){
                return this.raw
        }
}

// Mouse stuff

interface m{
	x: number
	y: number
	down: boolean
}

const m : m = {
	x:0,
	y:0,
	down: false
}

function init_mouse(){
	document.body.addEventListener('mousemove', function(e: MouseEvent){
		window.m.x = e.clientX
		window.m.y = e.clientY
	})

	document.body.addEventListener('mousedown', function(e: MouseEvent){
		window.m.down = true
	})
	
	document.body.addEventListener('mouseup', function(e: MouseEvent){
		window.m.down = false
	})
}

// time stuff

const clock = new Clock()
clock.start()



function loop_t(){
	window.t  = clock.getElapsedTime()
	requestAnimationFrame(loop_t)
}


export function init_globals(){
	window.t = 0
	window.m = {
		x:0,
		y:0,
		down: false
	}

	window.on = {}

	window.ch1 = new chan()
	window.ch2 = new chan()
	window.ch3 = new chan()
	window.ch4 = new chan()
	window.ch5 = new chan()
	window.ch6 = new chan()
	window.ch7 = new chan()
	window.ch8 = new chan()
	window.ch9 = new chan()
	window.ch10 = new chan()
	window.ch11 = new chan()
	window.ch12 = new chan()
	window.ch13 = new chan()
	window.ch14 = new chan()
	window.ch15 = new chan()
	window.ch16 = new chan()

	init_mouse()
	requestAnimationFrame(loop_t)
}
