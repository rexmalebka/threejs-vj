import {createApp} from 'vue'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import init_scene from './scene'

import {WebMidi} from "webmidi";
import Peer from 'peerjs'

import source_component from './source'
import texture_component from './texture'

import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import * as TweakpaneRotationInputPlugin from '@0b5vr/tweakpane-plugin-rotation'
import type {TabApi, TabPageApi} from 'tweakpane'

import { io, Socket } from "socket.io-client";
import { m } from './global_vars'

import add_raycasting_pane from './rcasting'
import load_model from './models'

const url = new URL(location.href)

if(!url.searchParams.get('sketch')) location.search = `sketch=sketch-${Math.random().toString(16).substr(2,10)}`

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

interface audio{
	context: AudioContext
	analyser: AnalyserNode
	mediaSource?: MediaStreamAudioSourceNode
	amp_data: Uint8Array
	fft_data: Uint8Array
	connect: (stream:MediaStream)=> void
}

declare global {
	interface Window{
		on: Function
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
		t: number | null
		a: audio
		m: m
		THREE: typeof THREE
	}
}

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
window.t = 0
window.m  = m
window.THREE = THREE

const context = new AudioContext()
const analyser = context.createAnalyser()
analyser.fftSize = 2048;

const fft_data:  Uint8Array & {[Symbol.toPrimitive]? : Function} =  Object.assign(
	new Uint8Array(analyser.frequencyBinCount),{
		[Symbol.toPrimitive]: function(hint:string){
			const data = fft_data
			return data.reduce((a,b)=> a+b) / data.length
		}
	}
)
const amp_data:  Uint8Array & {[Symbol.toPrimitive]? : Function} =  Object.assign(
	new Uint8Array(analyser.frequencyBinCount),{
		[Symbol.toPrimitive]: function(hint:string){
			const data = amp_data
			return data.reduce((a,b)=> a+b) / data.length
		}
	}
)



interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
	hello: () => void;
}

let socket_listener:any = {}



window.on = new Proxy(function(){}, {
	get:  function(target, name){
		return socket_listener[name]
	},
	apply: function(target, thisArg, name){
		return socket_listener[name[0]]
	},
})

const target:audio = {
	context: context,
	analyser: analyser,
	fft_data:  fft_data,
	amp_data:  amp_data,
	connect: function(stream:MediaStream ){
		if(this.mediaSource){ this.mediaSource.disconnect() }

		const mediaSource = context.createMediaStreamSource(stream)
		this.mediaSource = mediaSource
		mediaSource.connect(analyser)
		context.resume()
		console.debug(" connect audio ", this)
	},
}

window.a = new Proxy(target, {
	get: function(target, name){
		if(name == "connect"){
			return target.connect
		}else if(name== Symbol.toPrimitive){
			target.analyser.getByteFrequencyData(target.fft_data)
			return function(hint:string){
				return +target.fft_data
			}
		}else if(!isNaN(Number(name))){
			if(target.mediaSource){
				target.analyser.getByteFrequencyData(target.fft_data)
				return target.fft_data[Number(name)]
			}else{
				return 0
			}
		}else if(name == "fft"){
			target.analyser.getByteFrequencyData(target.fft_data)
			return target.fft_data
		}else if(name == "amp"){
			target.analyser.getByteTimeDomainData(target.amp_data)
			return target.amp_data
		}
	},
})



export default createApp({
	emits:['add_texture', 'rename_texture', 'rename_source', 'send_socket'],
	data(){
		const scene:THREE.Scene = new THREE.Scene()

		// https://attackingpixels.com/tips-tricks-optimizing-three-js-performance/
		let fov;
		let far;
		let near = 0.40;

		if(window.innerWidth <= 768){
			fov = 50
			far = 1200
		}else if(window.innerWidth >= 769 && window.innerHeight <= 1080){
			fov = 50
			far = 1475		
		}else{
			fov = 40
			far = 1800
		}

		const camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far)


		const renderer:THREE.WebGLRenderer = new THREE.WebGLRenderer({
			antialias: false,
			powerPreference: "high-performance",
		})

		const composer = new EffectComposer( renderer );
		const renderScene = new RenderPass( scene, camera );
		const bloomPass = new UnrealBloomPass(  new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85)

		composer.addPass(renderScene)
		composer.addPass(bloomPass)

		composer.setSize( window.innerWidth, window.innerHeight );
		composer.setPixelRatio( window.devicePixelRatio );

		const controls: OrbitControls = new OrbitControls(camera, renderer.domElement)

		// CAmera initial pos
		camera.position.set(0, 0, 5)


		// mount renderer
		renderer.setSize( window.innerWidth, window.innerHeight )
		renderer.setPixelRatio( window.devicePixelRatio )
		renderer.toneMapping = THREE.ReinhardToneMapping

		window.addEventListener('resize',function(){
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
			composer.setSize( window.innerWidth, window.innerHeight );
			composer.setPixelRatio( window.devicePixelRatio );
		})

		const clock = new THREE.Clock()
		clock.start()

		function animate(){
			//renderer.render(scene, camera)
			composer.render()
			window.t = clock.getElapsedTime()
			requestAnimationFrame(animate)
		}
		requestAnimationFrame(animate)


		const container = document.createElement('div')
		container.id = "menu"
		document.body.appendChild(container)

		const pane = new Pane({
			container: container,
			title: 'menu'
		})
		pane.registerPlugin(EssentialsPlugin);
		pane.registerPlugin(TweakpaneRotationInputPlugin)

		const app = this
		pane.on('change', function(){
			app.save()
		})
		// webmidi stuff


		const url = new URL(location.href)



		let socket: null|Socket<ServerToClientEvents, ClientToServerEvents> = null

		return {
			name: url.searchParams.get('sketch'),
			scene: scene, 
			camera: camera,
			renderer: renderer,
			composer: composer,
			controls: controls,

			sources: {},
			active_source: '',

			textures:{},
			active_texture: '',

			models: {},

			pane: pane,

			clock:clock,

			midi_input: -1,
			peer_id: '',
			audio_device: '',

			socket_url: '',
			socket: socket,

			logs: "",

			mediaStream: new MediaStream()
		}
	},
	watch:{
		'sources': {
			handler(){
				this.save()
			},
			deep:true
		},
		'textures': {
			handler(){
				this.save()
			},
			deep:true
		},
		'midi_input': function(new_midi, old){
			console.debug("old new", old, new_midi)					
			if(old != -1){
				for(let i=1; i<WebMidi.inputs[old].channels.length; i++){
					WebMidi.inputs[old].channels[i].removeListener()
				}
			}
			if(new_midi != -1){
				const listener = function(event:any){
					console.debug("noteOn ", event)
					const channel:number = event.message.channel
					const raw:number = Number(event.rawValue)
					const value:number = Number(event.value)
					const note:number = event.note.number;

					let ch;
					if(channel == 1) { ch = window.ch1 }
					if(channel == 2) { ch = window.ch2 }
					if(channel == 3) { ch = window.ch3 }
					if(channel == 4) { ch = window.ch4 }
					if(channel == 5) { ch = window.ch5 }
					if(channel == 6) { ch = window.ch6 }
					if(channel == 7) { ch = window.ch7 }
					if(channel == 8) { ch = window.ch8 }
					if(channel == 9) { ch = window.ch9 }
					if(channel == 10) { ch = window.ch10 }
					if(channel == 11) { ch = window.ch11 }
					if(channel == 12) { ch = window.ch12 }
					if(channel == 13) { ch = window.ch13 }
					if(channel == 14) { ch = window.ch14 }
					if(channel == 15) { ch = window.ch15 }
					if(channel == 16) { ch = window.ch16 }

					if(ch != undefined){
						ch.value = value
						ch.raw = raw
						ch.note = note
						ch.on = event.type == 'noteon' ? true : false
					}

				}

				WebMidi.inputs[new_midi].addListener('noteon', listener)
				WebMidi.inputs[new_midi].addListener('noteoff', listener)
			}
		},
		'audio_device': function(new_dev, old){
			if(new_dev != 'none'){


				navigator.mediaDevices.getUserMedia({
					audio:{
						deviceId: new_dev
					},
					video: false
				}).then( (stream) =>{
					window.a.connect(stream)
				})


			}

		},
		'socket_url': function(new_url, old){
			if(this.socket ==  null){
				this.socket = io(new_url, {
					query: {
						sketch: this.name
					}
				})

			}else{
				this.socket.removeAllListeners();
				this.socket.disconnect()

				this.socket = io(new_url)
			}		

			this.socket.on('connect_error', function(){
				console.debug("socket io connect error");
				(document.querySelector('.socket_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
			})

			this.socket.on('disconnect', function(){
				console.debug("socket io disconnected");
				(document.querySelector('.socket_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 255 0 / 30%)'
			})

			this.socket.on('connect', function(){
				console.debug("socket io connected");
				(document.querySelector('.socket_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(0 255 0 / 30%)'
			})

			this.socket.on('threevjs', function(data:any){
				//  crear borrar editar


				console.debug("data", data)	
			})

			this.socket.onAny(function(name:string, value:any){
				socket_listener[name] = value					
			})


		},
	},
	methods:{
		export_file(event:any){
			const text:string = JSON.stringify(localStorage)

			const a = document.createElement("a")
			a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
			a.setAttribute('download', `${this.name}.json`);

			a.style.display = "none"
			document.body.appendChild(a)

			a.click()
			document.body.removeChild(a)

		},
		add_texture(id:string, texture:THREE.Texture){
			if(this.textures[id]) { this.textures[id].texture = texture }
		},
	rename_texture(id:string, name:string){
		if(this.textures[id]){ this.textures[id].name = name }
		this.gen_textures_menu(this.pane.children[0].pages[2])		
	},
	rename_source(id:string, name:string){
		if(this.sources[id]) { this.sources[id] = name }
		this.gen_sources_menu(this.pane.children[0].pages[1])		
	},
	add_textures_tab(page: TabPageApi){
		const app = this

		this.gen_textures_menu(page)

		page.addButton({title: 'create'}).on('click',function(){
			const name = `texture-${Math.random().toString(16).substr(2,10)}`
			app.textures[name] = {
				name:name
			}
			app.active_texture = name
			app.gen_textures_menu(page)
		})
		page.addButton({title: 'delete'}).on('click',function(){
			const name = app.active_texture
			delete app.textures[name]

			app.active_texture = Object.keys(app.sources)[0]  ? Object.keys(app.sources)[0] :  ''

			if(app.active_texture == '')  page.children[4].hidden = true

				app.gen_textures_menu(page)
		})
		page.addSeparator()
		page.addFolder({title:'', hidden: true})
	},
	send_socket(event:string, data:any){
		if(this.socket.connected){
			this.socket.emit(event, data)
		}
	},
	gen_textures_menu(page: TabPageApi){
		if(page.children[0]) page.children[0].dispose()

			const textures = Object.fromEntries(
				Object.entries(this.textures).map(function(texture_entry:[string, any]){
					return [texture_entry[1].name, texture_entry[0]]				
				})
			)

			if(Object.keys(textures).length == 0){
				textures.none = ''
			}

			page.addInput(this.$data, 'active_texture', {
				index: 0,
				label: 'active texture',
				options: textures
			})
	},
	add_sources_tab(page: TabPageApi){
		const app = this

		this.gen_sources_menu(page)

		page.addButton({title: 'create'}).on('click',function(){
			const name = `source-${Math.random().toString(16).substr(2,10)}`
			app.sources[name] = name
			app.active_source = name
			app.gen_sources_menu(page)
		})
		page.addButton({title: 'import model'}).on('click',function(){
			load_model().then(function(obj:any){
				const name = `source-model-${Math.random().toString(16).substr(2,10)}`
				app.models[name] = obj
				app.sources[name] = name
				app.active_source = name
				app.gen_sources_menu(page)
			
			}).catch( (err:ErrorEvent)=>{
				console.debug("error",err)			
			})
			//gen_model_menu(app, page)
		})
		page.addButton({title: 'delete'}).on('click',function(){
			const name = app.active_source
			delete app.sources[name]

			app.active_source = Object.keys(app.sources)[0]  ? Object.keys(app.sources)[0] :  ''

			if(app.active_source == '')  page.children[5].hidden = true

				app.gen_sources_menu(page)
		})

		page.addSeparator()
		page.addFolder({title:'', hidden: true})
	},
	gen_sources_menu(page: TabPageApi){
		if(page.children[0]) page.children[0].dispose()

			const sources = Object.fromEntries(
				Object.entries(this.sources).map(function(source_entry:[string, any]){
					return [source_entry[1], source_entry[0]]				
				})
			)

			if(Object.keys(sources).length == 0){
				sources.none = ''
			}

			page.addInput(this.$data, 'active_source', {
				index:0,
				label: 'active source',
				options: sources
			})
	},
	add_monitor_tab(page:TabPageApi){
		const fpsGraph:any = page.addBlade({
			view: 'fpsgraph',
			lineCount: 2,
			label: 'fps',
		});  

		function render_fps() {
			fpsGraph.begin();

			fpsGraph.end();
			requestAnimationFrame(render_fps);
		}
		requestAnimationFrame(render_fps);
	},
	add_scene_tab(page:TabPageApi){
		const app = this

		let pixelRatio = {
			'pixelRatio':this.renderer.getPixelRatio()
		}
		page.addInput(pixelRatio, 'pixelRatio', {min: 0, step:0.01, max:1}).on('change', function(pr:any){
			app.renderer.setPixelRatio(pr.value)			
		});

		page.addInput(app.renderer, 'toneMappingExposure', {label: 'exposure', min: 0, step:0.01})


		page.addInput(this.scene.getObjectByName('axes'), 'visible', {label: "axes"});

		let fog = {'fog':this.scene.fog != null }

		let fog_color = {
			color:this.scene.fog==null?{ r:255, g:255, b:255}: {
				r:this.scene.fog.color.r * 255,
				g:this.scene.fog.color.g * 255,
				b:this.scene.fog.color.b * 255,
			}
		}

		page.addInput(fog, 'fog').on('change',function(){
			if(fog.fog){
				app.scene.fog = new THREE.Fog(
					new THREE.Color(
						fog_color.color.r/255,
						fog_color.color.g/255,
						fog_color.color.b/255,
					),
					0.1,20)
			}else{
				app.scene.fog = null
			}
		})


		page.addInput(fog_color, 'color').on('change', function(col){
			if(!app.scene.fog) return
				app.scene.fog.color.r = col.value.r/255
			app.scene.fog.color.g = col.value.g/255
			app.scene.fog.color.b = col.value.b/255
		})

		const bloom_pane = page.addFolder({title: 'bloom post processing'})
		bloom_pane.addInput(this.composer.passes[1],'enabled')
		bloom_pane.addInput(this.composer.passes[1],'strength')
		bloom_pane.addInput(this.composer.passes[1],'radius')

	},
	onconnect(peer:any,conn:any){
		if(conn.label != "threejs"){
			conn.close()
			return
		}
		console.debug("connection made with: ",conn, conn.peer)
		peer.call(conn.peer, this.mediaStream)
	},
	add_interfaces_tab(page:TabPageApi){
		const app = this
		function midi_folder(){
			if(WebMidi.inputs.length >= 1){
				const midi_folder = page.addFolder({title: 'midi', index:0})	
				const inputs = Object.fromEntries(
					WebMidi.inputs.map((dev, index) => [dev.name,index])
				)
				console.debug("midi inpts", inputs, WebMidi)
				inputs['none'] = -1

				midi_folder.addInput(app, 'midi_input', {
					options: inputs
				})

			}
		}

		WebMidi.enable()
		.then(midi_folder).catch(err => console.error(err))

		const stream = page.addFolder({title: 'webrtc stream'})
		const stream_but = stream.addButton({title: 'go live'})

		stream_but.on('click', function(){
			if(app.peer_id.length  == 0){
				let a = new Uint32Array(3);
				window.crypto.getRandomValues(a);

				const id = (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");
				const peer = new Peer(
					id,
					{
						host: "peerjs.piranhalab.cc",
						secure:true,
						config:{
							iceServers: [
								{ 
									urls: 'stun:stun.piranhalab.cc:5349' 
								},
								{ 
									urls: 'turn:turn.piranhalab.cc:3478',
									username: 'guest', 
									credential:"somepassword" 
								}        
							],
						},debug:3
					})
					app.peer_id = id

					peer.on('open', function(id){
						console.debug("peerjs connection happened")

						app.peer_id = id
						app.mediaStream = app.renderer.domElement.captureStream(25)

						peer.on('connection', function(conn:any){ app.onconnect(peer, conn)})

						const url_div = document.createElement('div')
						url_div.id = "live_url"
						url_div.innerHTML =`${location.origin}${location.pathname}?live=${id}`


						stream.controller_.view.containerElement.appendChild(url_div)
					})

			}

		})

		navigator.mediaDevices.enumerateDevices().then(function(devices){
			const audio = page.addFolder({title: 'Audio'})

			let devs:{[key:string]:string} = {
				'none': 'none'
			}

			devices.forEach((device)=>{
				if(device.kind === 'audioinput'){
					const name = `[input] ${device.label}`
					devs[name] = device.deviceId
				}else if(device.kind === 'audiooutput'){
					const name = `[output] ${device.label}`
					devs[name] = device.deviceId
				}
			})

			const audio_menu = audio.addInput(app, 'audio_device',{
				options: devs
			})
		})

		//audio.add
		const Sockets = page.addFolder({title: 'Socket.io'})
		const url_obj = {url: this.socket_url}

		const socket_input = Sockets.addInput(url_obj, 'url', {label: 'url'}).on('change', function(){
			app.socket_url = url_obj.url
		})

		socket_input.controller_.view.valueElement.classList.add('socket_status')

		// ray castng
		const ray_casting = page.addFolder({title: 'Ray Casting'})
		add_raycasting_pane(this, ray_casting)

	},
	create_pane(){
		const menu_tabs = this.pane.addTab({
			pages:[
				{title: 'scene/renderer'},
				{title: 'sources'},
				{title: 'textures'},
				{title: 'interface'},
				//{title: 'infos'},
			]
		})

		this.add_scene_tab(menu_tabs.pages[0])
		this.add_sources_tab(menu_tabs.pages[1])
		this.add_textures_tab(menu_tabs.pages[2])
		this.add_interfaces_tab(menu_tabs.pages[3])
	},
	log(from:string, text:string){
		this.logs += `\n[${from}]: '${text}'`
	},
	import_file(event:DragEvent){
		console.debug("event", event)

		if(event.dataTransfer == null) { return }

		if(event.dataTransfer.files[0]){
			const file = event.dataTransfer.files[0]

			console.debug("fi le", file)
			if(!file.name.endsWith("json")) { return }
			const reader = new FileReader()

			reader.onloadend = function(evt) {
				console.debug("result", reader.result)
				try{
					const content = JSON.parse(reader.result as string)
					for(let key in content){
						localStorage.setItem(key, content[key])
					}

					location.search = `sketch=${file.name.replace(/\.[^/.]+$/, "")}`

				}catch(err){
					return
				}
			}
			reader.readAsText(file)
		}
		event.preventDefault()
	},
	import(){
		try{
			let data = JSON.parse(localStorage.getItem(this.name) || "")
			this.scene.getObjectByName('axes').visible = data.scene.axes

			if(data.scene.fog != null){
				this.scene.fog = new THREE.Fog(
					new THREE.Color(
						data.scene.fog.color.r,
						data.scene.fog.color.g,
						data.scene.fog.color.b
					), 0.1, 20)
			}else{
				this.scene.fog = null
			}


			this.renderer.setPixelRatio(data.renderer.pixelRatio)
			this.renderer.toneMappingExposure = data.renderer.exposure
			this.composer.passes[1].enabled = data.composer.bloom.enabled
			this.composer.passes[1].strength = data.composer.bloom.strength
			this.composer.passes[1].radius = data.composer.bloom.radius

			this.sources = data.sources
			for(let s of Object.keys(data.textures)){
				this.textures[s] = {
					name: data.textures[s]
				}
			}

		}catch(err){
			this.save()	
		}

	},
	save(){
		const data = JSON.stringify(this.toJSON())
		localStorage.setItem(this.name, data)
	},
	toJSON(){

		let data:{[name:string]:unknown} = {}

		for(let a of Object.keys(this.$data)){
			data[a] = this.$data[a]
		}

		data.scene = {
			axes: this.scene.getObjectByName('axes').visible,
			fog: this.scene.fog == null ? null : {
				color: {
					r:this.scene.fog.color.r,
					g:this.scene.fog.color.g,
					b:this.scene.fog.color.b
				}
			}
		}

		data.renderer = {
			pixelRatio: this.renderer.getPixelRatio(),
			exposure: this.renderer.toneMappingExposure,
		}
		data.composer = {
			bloom: {
				enabled: this.composer.passes[1].enabled,
				strength: this.composer.passes[1].strength,
				radius: this.composer.passes[1].radius,
			}
		}

		let sources:{[name:string]:unknown} = {}
		for(let s of Object.keys(this.sources)){
			sources[s] = this.sources[s]
		}

		let textures:{[name:string]:unknown} = {}
		for(let s of Object.keys(this.textures)){
			textures[s] = this.textures[s].name
		}

		data.sources = sources
		data.textures = textures


		delete data.camera
		delete data.controls
		delete data.pane
		delete data.clock

		return data
	},
	autosave(){
		const query = new URL(window.location.href)
		const params = query.searchParams

		let data;
		if(params.get('sketch')){
			this.name = params.get('sketch')

		}else{
			window.location.search = `sketch=${this.name}`
		}

		if(window.localStorage.getItem(this.name)){
			try{
				data = JSON.parse(window.localStorage.getItem(this.name) || '')
			}catch(err){
				data = this.toJSON()
			}
		}else {
			data = this.toJSON()
		}

	},
	update_move_m(e:MouseEvent){
		window.m.x = e.clientX
		window.m.y = e.clientY
	},
	update_down_m(e:MouseEvent){
		window.m.down = true
	},
	update_up_m(e:MouseEvent){
		window.m.down = false
	}
	},
	mounted(){
		console.debug("app",this)
		this.$el.appendChild(this.renderer.domElement)

		//this.autosave()
		this.log('app', 'generating THREE js scene')
		init_scene(this.scene)
		this.log('app', 'creating menu')
		this.import()
		this.log('app', 'importing saved from memory')
		this.create_pane()


	}
})
.component('texture_component', texture_component)
.component('source_component', source_component)
.mount("#app")
