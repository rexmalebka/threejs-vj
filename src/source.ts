import { defineComponent } from "vue";
import Vue from 'vue'
import * as THREE from 'three'
import create_pane from './pane'

export default defineComponent({
	name: "source_component",
	props: ['id','active','scene','name','pane', 'videos'],
	data(){
		const mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(1,1,100,100),
			new THREE.MeshPhongMaterial({
				transparent: true,
				color: 0xffffff,
				displacementMap: new THREE.Texture(),
				side: THREE.DoubleSide,
			})
		)

		mesh.name = `source-${this.$props.id}`

		mesh.userData = {
			id: this.$props.id,
			name: this.$props.name,
			playbackRate: 1,
			start: 0,
			duration: 1,
			scale_fun:"",
			rotation_fun:"",
			position_fun:"",
			geometry: 'plane',
			videos: this.$props.videos,
			texture: '',
		}

		mesh.material.userData.color = {
			r:mesh.material.color.r,
			g:mesh.material.color.g,
			b:mesh.material.color.b
		}

		const source_pane = this.$props.pane.addFolder({
			title: this.$props.id
		})
		return {
			mesh: mesh,
			source_pane: source_pane,
		}
	},
	watch:{
		'mesh.userData.videos': {
			handler(videos:any){
				this.source_pane.children[3].children[0].dispose()
				const app = this

				this.source_pane.children[3].addInput(this.mesh.userData, 'texture',{
					index:0,
					label: "map",
					options: {
						...Object.fromEntries(Object.entries(app.$props.videos).map((x:[string, any]) => [x[1].name as string, x[0]] )),
							none: ''
					}
				})
			},
			deep:true
		},
		'mesh.userData.texture': function(id:string){
			this.mesh.material.map = this.$props.videos[id].texture
			this.mesh.material.displacementMap = this.$props.videos[id].texture

		},
		'mesh.userData.visible': function(value:boolean){
			this.mesh.visible = value
		},
		'mesh.userData.name': function(value:string){
			this.source_pane.title= value
			this.$emit('rename_source', this.$props.id, value)
		},
		'mesh.userData.src': function(value:any){
			if(typeof value == 'string'){
				if(this.mesh.userData.video.srcObject){
					(<MediaStream>this.mesh.userData.video.srcObject).getTracks().forEach(stream=>stream.stop());
				}
				this.mesh.userData.video.srcObject = null
				this.mesh.userData.video.src = value
			}else{
				this.mesh.userData.video.src = ""
				this.mesh.userData.video.srcObject = value
			}
		},
		'mesh.userData.start': function(start:number){
			const duration:number = this.mesh.userData.video.duration
			this.mesh.userData.video.currentTime  = duration * start
		},
		'mesh.userData.duration': function(start:number){
			const duration:number = this.mesh.userData.video.duration
			this.mesh.userData.video.currentTime  = duration * start
		},
		'mesh.userData.geometry': function(geom:any){
			this.mesh.geometry = geom
		},
		'mesh.material.userData.color':{
			handler(color:any){

				this.mesh.material.color.r = color.r/255
				this.mesh.material.color.g = color.g/255
				this.mesh.material.color.b = color.b/255

			},
			deep:true
		}
	},
	methods:{
		loop_video(){
			/*
			const start:number = this.mesh.userData.video.duration * this.mesh.userData.start
			const delta:number = this.mesh.userData.video.currentTime - start
			const dur:number  = this.mesh.userData.duration

			if(!isNaN(this.mesh.userData.video.currentTime)){
				if(delta < 0 ){
					this.mesh.userData.video.currentTime = start
				}else if(delta > dur){
					this.mesh.userData.video.currentTime = start
				}
			}
		       */
			if(this.mesh.userData.scale_fun.trim().length > 0){

				try{
					const data = {
						t:Date.now(), 
						...this.mesh.scale
					}

					let func = `({t,x,y,z})=>{
						return ${this.mesh.userData.scale_fun}
					}
					`

					let value:number|Function|number[]|{x:number, y:number,z:number} = eval(func)
					if(typeof value == 'function'){
						value = value(data)
					}
					if(typeof value == 'number'){
						this.mesh.scale.x = Number(value)
						this.mesh.scale.y = Number(value)
						this.mesh.scale.z = Number(value)
					}else if(Array.isArray(value)){
						this.mesh.scale.x = isNaN(value[0]) ? this.mesh.scale.x : Number(value[0])
						this.mesh.scale.y = isNaN(value[1]) ? this.mesh.scale.y : Number(value[1])
						this.mesh.scale.z = isNaN(value[2]) ? this.mesh.scale.z : Number(value[2])
					}else if(typeof value == 'object'){
						this.mesh.scale.x = isNaN(value.x) ? this.mesh.scale.x : Number(value.x)
						this.mesh.scale.y = isNaN(value.y) ? this.mesh.scale.y : Number(value.y)
						this.mesh.scale.z = isNaN(value.z) ? this.mesh.scale.z : Number(value.z)
					}	
				}catch(err){
					console.error("error:",err)
				}
			}
			if(this.mesh.userData.rotation_fun.trim().length > 0){
				try{
					const data = {
						t:Date.now(), 
						x: this.mesh.rotation.x, 
						y: this.mesh.rotation.y, 
						z: this.mesh.rotation.z, 
					}

					let func = `({t,x,y,z})=>{
						return ${this.mesh.userData.rotation_fun}
					}
					`

					let value:number|Function|number[]|{x:number, y:number,z:number} = eval(func)
					if(typeof value == 'function'){
						value = value(data)
					}
					if(typeof value == 'number'){
						this.mesh.rotation.x = Number(value)
						this.mesh.rotation.y = Number(value)
						this.mesh.rotation.z = Number(value)
					}else if(Array.isArray(value)){
						this.mesh.rotation.x = isNaN(value[0]) ? this.mesh.rotation.x : Number(value[0])
						this.mesh.rotation.y = isNaN(value[1]) ? this.mesh.rotation.y : Number(value[1])
						this.mesh.rotation.z = isNaN(value[2]) ? this.mesh.rotation.z : Number(value[2])
					}else if(typeof value == 'object'){
						this.mesh.rotation.x = isNaN(value.x) ? this.mesh.rotation.x : Number(value.x)
						this.mesh.rotation.x = isNaN(value.y) ? this.mesh.rotation.y : Number(value.y)
						this.mesh.rotation.x = isNaN(value.z) ? this.mesh.rotation.z : Number(value.z)
					}	
				}catch(err){
					console.error("error:",err)
				}
			}
			if(this.mesh.userData.position_fun.trim().length > 0){

				try{
					const data = {
						t:Date.now(), 
						...this.mesh.position
					}

					let func = `({t,x,y,z})=>{
						return ${this.mesh.userData.position_fun}
					}
					`

					let value:number|Function|number[]|{x:number, y:number,z:number} = eval(func)
					if(typeof value == 'function'){
						value = value(data)
					}
					if(typeof value == 'number'){
						this.mesh.position.x = Number(value)
						this.mesh.position.y = Number(value)
						this.mesh.position.z = Number(value)
					}else if(Array.isArray(value)){
						this.mesh.position.x = isNaN(value[0]) ? this.mesh.position.x : Number(value[0])
						this.mesh.position.y = isNaN(value[1]) ? this.mesh.position.y : Number(value[1])
						this.mesh.position.z = isNaN(value[2]) ? this.mesh.position.z : Number(value[2])
					}else if(typeof value == 'object'){
						this.mesh.position.x = isNaN(value.x) ? this.mesh.position.x : Number(value.x)
						this.mesh.position.y = isNaN(value.y) ? this.mesh.position.y : Number(value.y)
						this.mesh.position.z = isNaN(value.z) ? this.mesh.position.z : Number(value.z)
					}	
				}catch(err){
					console.error("error:",err)
				}
			}
			requestAnimationFrame(this.loop_video)
		},
	},
	mounted(){
		console.debug("component", this, this.$el)

		const app = this;

		this.$props.scene.add(this.mesh)
		const pane = create_pane(this.mesh, this.source_pane);

		this.$watch('mesh.userData.name',function(value:string){
			app.$emit('rename_source',app.$props.id, value)
		})

		requestAnimationFrame(this.loop_video)
	},
	unmounted(){
		console.debug("deleted")
	}
})
