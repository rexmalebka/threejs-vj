import {createApp} from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import source_component from './source'
import init_scene from './scene'

export default createApp({
	emits:['rename_source'],
	watch:{
		'scene.userData.fog_color':{
			handler(color:{r:number, g:number, b:number}){
				this.scene.fog.color.r = color.r/255;
				this.scene.fog.color.g = color.g/255;
				this.scene.fog.color.b = color.b/255;
			},
			deep:true
		},
		'active_video': function(id:string){
			console.debug("videoid",id)
			this.pane.children[1].children[2].dispose()
			const video_pane = this.pane.children[1].addFolder({title: this.videos[id].name })

			const app = this
			video_pane.addInput(this.videos[id], 'name').on('change', function(name:any){
				video_pane.title = name.value
			}).on('change',function(){
				app.update_video_options()
			})

			const tabs = video_pane.addTab({
				pages:[
					{title: 'from url'},
					{title: 'from share'},
					{title: 'from webcam'},
				]
			})

			const mock_data = {src: ''}
			tabs.pages[0].addInput(mock_data, 'src', {label: 'url'}).on('change', function(video:any){
				if(app.videos[id].video.srcObject){
					(<MediaStream>app.videos[id].video.srcObject).getTracks().forEach(stream=>stream.stop());
				}
				app.videos[id].video.src = video.value
			})

			tabs.pages[0].addInput(this.videos[id].video, 'playbackRate',{
				min:0.1,
				max:14,
				step:0.1
			})

			tabs.pages[0].addInput(this.videos[id].texture.repeat, 'x',{
				label: 'repeat x',
				min: 0.001,
				step: 0.001,
			})

			tabs.pages[0].addInput(this.videos[id].texture.repeat, 'y',{
				label: 'repeat y',
				min: 0.001,
				step: 0.001,
			})

			tabs.pages[0].addInput(this.videos[id].texture.offset, 'x',{
				label: 'offset x',
				min: 0,
				max: 1,
				step: 0.001,
			})

			tabs.pages[0].addInput(this.videos[id].texture.offset, 'y',{
				label: 'offset y',
				min: 0,
				max: 1,
				step: 0.001,
			})


			tabs.pages[0].addInput(this.videos[id], 'start',{
				min: 0.1,
				max: 1,
				step: 0.2
			}).on('change', function(dur:any){
				const duration = app.videos[app.active_video].video.duration
				app.videos[app.active_video].video.currentTime = duration * app.videos[app.active_video].start
			})

			tabs.pages[0].addInput(this.videos[id], 'duration',{
				min: 0.1,
				step: 0.2,
			}).on('change', function(dur:any){
				const duration = app.videos[app.active_video].video.duration
				app.videos[app.active_video].video.currentTime = duration * app.videos[app.active_video].start
			})

			tabs.pages[1].addButton({title: 'select window'}).on('click', async function(){
				console.debug('  async', app.videos[id])
				app.videos[id].src = ''
				app.videos[id].video.srcObject = await navigator.mediaDevices.getDisplayMedia({video:true, audio:false})
			})
		}
	},
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

		console.debug("FOV FAR",fov, far, near)
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

		// camera initial pos
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

		function animate(){
			//renderer.render(scene, camera)
			composer.render()
			requestAnimationFrame(animate)
		}
		requestAnimationFrame(animate)


		const pane = new Pane({title: 'menu'})
		return {
			visible: true,
			scene: scene, 
			camera: camera,
			renderer: renderer,
			composer: composer,
			controls: controls,
			active_source: '',
			sources: {},
			videos:{},
			active_video: '',
			pane:pane,
			fps: 0,
		}
	},

	methods:{
		get_fps(){
			let prevTime = Date.now(),
				frames = 0;

			const app = this
			requestAnimationFrame(function loop() {
				const time = Date.now();
				frames++;
				if (time > prevTime + 1000) {
					let fps = Math.round( ( frames * 1000 ) / ( time - prevTime ) );
					prevTime = time;
					frames = 0;

					app.fps = fps
				}
				requestAnimationFrame(loop);
			});
		},
		add_source(){
			const name = `source-${Math.random().toString(16).substr(2,10)}`
			this.sources[name] = name
		},
		rename_source(id:string, name:string){
			if(this.sources[id] != undefined){
				this.sources[id] = name
			}
		},
		delete_source(name:string){
			delete this.sources[name]

		},
		add_video(){
			const video = document.createElement('video')
			video.muted = true
			video.loop = true
			video.autoplay = true;

			video.style.position = 'fixed'
			video.style.zIndex = "-1"

			document.body.prepend(video)

			const id = `video-${Math.random().toString(16).substr(2,10)}`
			this.videos[id] = {
				name: id,
				video:video,
				texture: new THREE.VideoTexture(video),
				start: 0,
				duration: 1,
			}

			this.videos[id].texture.wrapS = this.videos[id].texture.wrapT = THREE.RepeatWrapping
			const app = this
			video.ontimeupdate = function(){
				const start = app.videos[id].start * video.duration
				const delta = app.videos[id].video.currentTime - start
				const dur = app.videos[id].duration

				if(!isNaN(video.currentTime)){
					if(delta < 0 ){
						video.currentTime = start
					}else if(delta > dur){
						video.currentTime = start
					}
				}
			}

			this.active_video = id

			this.update_video_options()

		},
		create_pane(){
			const app = this

			this.pane.addButton({
				title: 'create source',
			}).on('click', ()=> this.add_source())

			const video_pane = this.pane.addFolder({title: 'Video', expanded:false})

			video_pane.addInput(this.$data, 'active_video',{
				label: 'active video',
				options: Object.fromEntries(Object.entries(this.videos).map((x:[string, any])=>[x[1].name as string,x[0]]))
			})

			video_pane.addButton({
				title: 'create video',
			}).on('click', ()=> this.add_video())

			video_pane.addSeparator()

			const scene_pane = this.pane.addFolder({title: 'Scene', expanded:false})

			scene_pane.addInput(this.scene.children[0],'visible',{
				label: 'axes visible'
			})


			scene_pane.addInput(this.scene.fog,'near',{
				label: 'fog near',
				step:0.01
			})

			scene_pane.addInput(this.scene.fog,'far',{
				label: 'fog far',
				step:0.01
			})

			const renderer_pane = this.pane.addFolder({title: 'renderer', expanded:false})

			renderer_pane.addInput(this.renderer, 'toneMappingExposure',{
				label: 'exposure',
				min:0,
				step:0.001,
			})


			renderer_pane.addInput(this.composer.passes[1], 'enabled',{label:'bloom enabled'})

			renderer_pane.addInput(this.composer.passes[1], 'strength',{
				min:0,
				step: 0.1
			})

			renderer_pane.addInput(this.composer.passes[1], 'radius',{
				min:0,
				step: 0.1
			})

			const pr = {
				pixelRatio: window.devicePixelRatio
			}
			renderer_pane.addInput(pr, 'pixelRatio',{
				label: 'pixel ratio',
				min:0,
				max:1,
				step:0.01,
			}).on('change', function(ratio:any){
				app.renderer.setPixelRatio( window.devicePixelRatio * ratio.value );
			})

			renderer_pane.addMonitor(this.$data, 'fps',{
				view: 'graph',
				min: 0,
				max: 200
			})

			this.pane.addSeparator()
		},
		update_video_options(){	
			this.pane.children[1].children[0].dispose()
			this.pane.children[1].addInput(this.$data, 'active_video',{
				index: 0,
				label: 'active video',
				options: Object.fromEntries(Object.entries(this.videos).map((x:[string, any])=>[x[1].name as string,x[0]]))
			})
		},
	},

	mounted(){
		this.$el.appendChild(this.renderer.domElement)
		init_scene(this.scene)
		this.create_pane()
		this.add_source()
		this.get_fps()
	}
})
.component('source_component', source_component)
.mount("#app")
