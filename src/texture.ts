import { defineComponent } from 'vue'
import type {TabPageApi, FolderApi} from 'tweakpane'

import * as THREE from 'three'


export default defineComponent({
	name: 'texture_component',
	props:['id', 'name', 'active_texture', 'pane', 'scene'],
	data(){
		const video = document.createElement('video')
		video.muted = true
		video.loop = true
		video.autoplay = true;
		(video as any).ontimeupdate = this.loop_video
		video.id = this.id

		document.body.prepend(video) 

		const texture = new THREE.VideoTexture(video)

		texture.userData = {
			id: this.$props.id,
			name: this.$props.name,
			src: '',
			video_range:{
				interval:{
					min: 0,
					max: 0.1,
				},
				script: false,
				func: '',
			},
			repeat:{
				script: false,
				func: ''
			},
			offset:{
				script: false,
				func: ''
			},
			playbackrate:{
				value: 1,
				script: false,
				func: '',
			},
		}

		return{
			name: this.$props.name,
			map: texture,
			video: video,
		}
	},
	watch:{
		'$props.active_texture': function(id:string){
			if(id == this.id) this.add_texture_pane()
		},
	},
	methods:{
		loop_video(event:GlobalEventHandlers){
			const video:HTMLVideoElement = ((event as any).target as HTMLVideoElement)

			let start = this.map.userData.video_range.interval.min
			let end = this.map.userData.video_range.interval.max

			if( start == end){
				end += 0.1
			}

			if( end > video.duration){
				start -= 0.1
				end -= 0.1
			}

			if(video.currentTime < start) { video.currentTime = start }
			if(video.currentTime >= end) { video.currentTime = start }
		},
		toggle_offset_pane(){
			const index = 4
			const app = this

			if(!this.map.userData.offset.script){
				const offset_pane = this.pane.addInput(this.map,'offset',{
					index: index
				})

				offset_pane.controller_.view.labelElement.classList.add('hand')
				offset_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.offset.script = true
					offset_pane.dispose()
					app.toggle_offset_pane()
				}
			}else{
				const offset_pane = this.pane.addInput(this.map.userData.offset,'func',{
					label: 'offset function',
					index: index
				})

				offset_pane.controller_.view.labelElement.classList.add('hand')

				offset_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.offset.script = false
					offset_pane.dispose()
					app.toggle_offset_pane()
				}
			}
		},
		toggle_repeat_pane(){
			const index = 3
			const app = this

			if(!this.map.userData.repeat.script){
				const repeat_pane = this.pane.addInput(this.map,'repeat',{
					index: index
				})


				repeat_pane.controller_.view.labelElement.classList.add('hand')
				repeat_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.repeat.script = true
					repeat_pane.dispose()
					app.toggle_repeat_pane()
				}
			}else{
				const repeat_pane = this.pane.addInput(this.map.userData.repeat,'func',{
					label: 'repeat function',
					index: index
				})

				repeat_pane.controller_.view.labelElement.classList.add('hand')

				repeat_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.repeat.script = false
					repeat_pane.dispose()
					app.toggle_repeat_pane()
				}
			}
		},
		add_texture_pane(){
			const app = this

			this.pane.on('change', this.save)

			this.pane.children.map( (x:any) => x.dispose())

			this.pane.title = this.$data.name
			this.pane.hidden = false

			this.pane.addInput(this.$data, 'name').on('change',function(name:any){
				app.$emit('rename_texture', app.id, name.value)	
				app.pane.title = name.value
			})

			this.pane.addInput(this.map,'wrapS',{
				options:{
					repeat: THREE.RepeatWrapping,
					clamp: THREE.ClampToEdgeWrapping,
					mirror: THREE.MirroredRepeatWrapping
				}
			})

			this.pane.addInput(this.map,'wrapT',{
				options:{
					repeat: THREE.RepeatWrapping,
					clamp: THREE.ClampToEdgeWrapping,
					mirror: THREE.MirroredRepeatWrapping
				}
			})


			this.toggle_repeat_pane()
			this.toggle_offset_pane()


			const values_tab = this.pane.addTab({
				pages:[
					{title: 'video url'},
					{title: 'share'},
					{title: 'webcam'},
				]
			})

			this.add_url_tab(values_tab.pages[0])
			this.add_share_tab(values_tab.pages[1])
			this.add_webcam_tab(values_tab.pages[2])
		},
		toggle_interval_pane(page:TabPageApi, video:HTMLVideoElement){
			const app = this
			const index = 1

			if(!this.map.userData.video_range.script){
				const interval_pane = page.addInput(app.$data.map.userData.video_range, 'interval',{
					index: index,
					min: 0,
					max: isNaN(video.duration) ? 1 : video.duration ,
					step: 0.1,
				})


				interval_pane.on('change', function(){
					video.currentTime = app.$data.map.userData.video_range.interval.min

				})

				interval_pane.controller_.view.labelElement.classList.add('hand')
				interval_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.video_range.script = true
					interval_pane.dispose()
					app.toggle_interval_pane(page, video)
				}
			}else{
				const interval_pane = page.addInput(this.map.userData.video_range,'func',{
					label: 'interval function',
					index: index
				})

				interval_pane.controller_.view.labelElement.classList.add('hand')

				interval_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.video_range.script = false
					interval_pane.dispose()
					app.toggle_interval_pane(page, video)
				}
			}
		},
		toggle_playbackrate_pane(page:TabPageApi, video:HTMLVideoElement){
			const app = this
			const index = 2

			if(!this.map.userData.playbackrate.script){
				const rate_pane = page.addInput(this.video, 'playbackRate',{
					min: 0.1,
					max: 10,
					step: 0.1,
				})

				rate_pane.on('change', function(){
					app.map.userData.playbackrate.value = app.video.playbackRate 
				})

				rate_pane.controller_.view.labelElement.classList.add('hand')
				rate_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.playbackrate.script = true
					rate_pane.dispose()
					app.toggle_playbackrate_pane(page, video)
				}
			}else{
				const rate_pane = page.addInput(this.map.userData.video_range,'func',{
					label: 'rate function',
					index: index
				})

				rate_pane.controller_.view.labelElement.classList.add('hand')

				rate_pane.controller_.view.labelElement.onclick = function(){
					app.map.userData.playbackrate.script = false
					rate_pane.dispose()
					app.toggle_playbackrate_pane(page, video)
				}
			}
		},
		add_webcam_tab(page:TabPageApi){
			const app = this

			const button = page.addButton({
				title: 'select'
			})

			button.on('click', async function(){

				let video = app.video

				if(video.srcObject){
					(<MediaStream>video.srcObject).getTracks().forEach(track => track.stop())
					video.srcObject = null
				}

				app.map.userData.src = ""

				video.src = ''
				video.srcObject = await navigator.mediaDevices.getUserMedia({video:true, audio:false})

				video.onloadedmetadata = function(){

					const r = video.videoWidth / video.videoHeight
					if(video.videoWidth > video.videoHeight){
						video.width = 720
						video.height = 720 * r 
					}else{
						video.height = 720
						video.width = 720 * (1/r) 
					}
				}
			})
		},
		add_url_tab(page:TabPageApi){
			const app = this

			page.addInput(this.$data.map.userData, 'src', {
				label: 'url'
			}).on('change', function(src:any){
				let video = app.video

				if(video.srcObject){
					(<MediaStream>video.srcObject).getTracks().forEach(track => track.stop())
					video.srcObject = null
				}
				video.src = src.value
				video.onloadedmetadata = function(){

					const r = video.videoWidth / video.videoHeight
					if(video.videoWidth > video.videoHeight){
						video.width = 720
						video.height = 720 * r 
					}else{
						video.height = 720
						video.width = 720 * (1/r) 
					}

					page.children.slice(1).map((c:any)=> c.dispose())

					app.toggle_interval_pane(page, video)

					page.addInput(video, 'playbackRate',{
						min: 0.1,
						max: 10,
						step: 0.1,
					})
				}
			})

			this.toggle_interval_pane(page, this.video)
			this.toggle_playbackrate_pane(page, this.video)
		},
		add_share_tab(page:TabPageApi){
			const app = this

			const button = page.addButton({
				title: 'select'
			})

			button.on('click', async function(){

				let video = app.video


				if(video.srcObject){
					(<MediaStream>video.srcObject).getTracks().forEach(track => track.stop())
					video.srcObject = null
				}
				video.src = ''
				video.srcObject = await navigator.mediaDevices.getDisplayMedia({video:true, audio:false})

				video.onloadedmetadata = function(){

					app.map.userData.src = ""
					const r = video.videoWidth / video.videoHeight
					if(video.videoWidth > video.videoHeight){
						video.width = 720
						video.height = 720 * r 
					}else{
						video.height = 720
						video.width = 720 * (1/r) 
					}
				}
			})
		},
		import(){
			const app = this

			let texture = JSON.parse(localStorage.getItem(this.id) || "null")
			console.debug("texture ", texture, this.map)
			if(texture != null){

				this.map.wrapS = texture.wrap[0]
				this.map.wrapT = texture.wrap[1]
				this.map.name = texture.name

				this.map.repeat.x = texture.repeat[0]
				this.map.repeat.y = texture.repeat[1]

				this.map.offset.x = texture.offset[0]
				this.map.offset.y = texture.offset[1]


				this.map.userData = texture.userData

				if(texture.userData.src.length > 0){
					const video = this.video 
					video.src = texture.userData.src
					video.onloadedmetadata = function(){

						const r = video.videoWidth / video.videoHeight
						if(video.videoWidth > video.videoHeight){
							video.width = 720
							video.height = 720 * r 
						}else{
							video.height = 720
							video.width = 720 * (1/r) 
						}

						video.playbackRate = texture.userData.playbackrate.value
						app.add_texture_pane()
					}

				}


			}

		},
		save(){
			const data = JSON.stringify(this.toJSON())
			localStorage.setItem(this.id, data)
		},
		toJSON(){
			return this.map.toJSON(undefined)
		}
	},
	unmounted(){
		console.debug("component destroyedestroyedd", this)
		localStorage.removeItem(this.id)
	},
	created(){
		console.debug("component txt", this)
		this.import()
		this.add_texture_pane()
		this.$emit('add_texture', this.id, this.map)
	}
})
