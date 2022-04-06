import { defineComponent } from 'vue'
import type { TabPageApi, FolderApi } from 'tweakpane'

import * as THREE from 'three'

import add_geometry_pane from './geometry'
import add_material_pane from './material'


export default defineComponent({
	name: 'source_component',
	props: ['id', 'is_model', 'name', 'active_source', 'pane', 'scene', 'textures', 'models'],
	watch:{
		'$props.active_source': function(id:string){
			if(id == this.id) this.add_source_pane()
		},
	'$props.textures':{
		handler(){
			this.pane.children[5].children.map( (c:any) => c.dispose())
			add_material_pane( this, this.pane.children[5] )
		},
		deep: true
	},
	'$props.name': {
		handler(){
			this.mesh.name = this.$props.name
			this.mesh.userData.name = this.$props.name
		}
	}
	},
	methods:{
		loop_color(){
			if(this.mesh.userData.color.script){
				const old_color = [
					this.mesh.material.color.r,
					this.mesh.material.color.g,
					this.mesh.material.color.b
				]

				try{
					const color_func = this.mesh.userData.color.callback

					let value:number|{r:number, g:number,b:number}|number[] = color_func(
						...old_color
					)

					if(typeof value == 'number') value = new THREE.Color(value);

						this.mesh.material.color.r = Number((value as any).r) || Number((value as number[])[0]) || this.mesh.material.color.r
						this.mesh.material.color.g = Number((value as any).g) || Number((value as number[])[1]) || this.mesh.material.color.g
						this.mesh.material.color.b = Number((value as any).b) || Number((value as number[])[2]) || this.mesh.material.color.b;
					(document.querySelector('.color_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					(document.querySelector('.color_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}
			requestAnimationFrame(this.loop_color)
		},
		loop_opacity(){
			if(this.mesh.userData.opacity.script){
				try{
					const opacity_func = this.mesh.userData.opacity.callback

					const value:number = opacity_func(
						this.mesh.material.opacity
					)

					this.mesh.material.opacity = isNaN(Number(value)) ? this.mesh.material.opacity : Number(value);
					(document.querySelector('.opacity_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					(document.querySelector('.opacity_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}
			requestAnimationFrame(this.loop_opacity)
		},
		loop_displacementScale(){
			if(this.mesh.userData.displacementScale.script){
				try{
					const displacementScale_func = this.mesh.userData.displacementScale.callback

					const value:number = displacementScale_func(
						this.mesh.material.displacementScale
					)

					this.mesh.material.displacementScale = Number(value) || this.mesh.material.displacementScale;
					(document.querySelector('.dscale_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					console.debug("error", err);
					(document.querySelector('.dscale_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
				}
			}
			requestAnimationFrame(this.loop_displacementScale)	
		},
		loop_displacementBias(){
			if(this.mesh.userData.displacementBias.script){
				try{
					const displacementBias_func = this.mesh.userData.displacementBias.callback

					const value:number = displacementBias_func(
						this.mesh.material.displacementBias
					);

					(document.querySelector('.dbias_status') as HTMLElement).style.boxShadow = ''
					this.mesh.material.displacementBias = Number(value) || this.mesh.material.displacementBias
				}catch(err){
					(document.querySelector('.dbias_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}
			requestAnimationFrame(this.loop_displacementBias)
		
		},
		loop_scale(){
			if(this.mesh.userData.scale.script){
				try{
					const scale_func = this.mesh.userData.scale.callback

					const value:number|{r:number, g:number,b:number}|number[] = scale_func(
						this.mesh.scale.x,
						this.mesh.scale.y,
						this.mesh.scale.z
					)

					this.mesh.scale.x = Number((value as any).x) || Number((value as number[])[0]) || Number(value) || this.mesh.scale.x
					this.mesh.scale.y = Number((value as any).y) || Number((value as number[])[1]) || Number(value) || this.mesh.scale.y
					this.mesh.scale.z = Number((value as any).z) || Number((value as number[])[2]) || Number(value) || this.mesh.scale.z;
					(document.querySelector('.scale_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					
					(document.querySelector('.scale_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}
			requestAnimationFrame(this.loop_scale)
		
		},
		loop_position(){
			if(this.mesh.userData.position.script){
				try{
					const position_func = this.mesh.userData.position.callback

					const value:number|{r:number, g:number,b:number}|number[] = position_func(
						this.mesh.position.x,
						this.mesh.position.y,
						this.mesh.position.z
					)

					this.mesh.position.x = Number((value as any).x) || Number((value as number[])[0]) || Number(value) || this.mesh.position.x
					this.mesh.position.y = Number((value as any).y) || Number((value as number[])[1]) || Number(value) || this.mesh.position.y
					this.mesh.position.z = Number((value as any).z) || Number((value as number[])[2]) || Number(value) || this.mesh.position.z;
					(document.querySelector('.position_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					(document.querySelector('.position_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}
		
			requestAnimationFrame(this.loop_position)
		},
		loop_rotation(){
			if(this.mesh.userData.rotation.script){
				try{
					const rotation_func = this.mesh.userData.rotation.callback

					const value:number|{r:number, g:number,b:number}|number[] = rotation_func(
						this.mesh.rotation.x,
						this.mesh.rotation.y,
						this.mesh.rotation.z
					)

					this.mesh.rotation.x = Number((value as any).x) || Number((value as number[])[0]) || Number(value) || this.mesh.rotation.x
					this.mesh.rotation.y = Number((value as any).y) || Number((value as number[])[1]) || Number(value) || this.mesh.rotation.y
					this.mesh.rotation.z = Number((value as any).z) || Number((value as number[])[2]) || Number(value) || this.mesh.rotation.z;
					(document.querySelector('.rotation_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					(document.querySelector('.rotation_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}

			requestAnimationFrame(this.loop_rotation)
		
		},
		loop_vertex(){
			if(this.mesh.userData.vertex.script){
				try{
					const vertex_func = this.mesh.userData.vertex.callback
					const vertex_pos = this.mesh.geometry.getAttribute('position').array
					const new_vertex = new Float32Array(vertex_pos.length)

					this.mesh.geometry.computeBoundingBox()
					this.mesh.geometry.computeBoundingSphere()

					for(let i=0;i<vertex_pos.length; i+=3){
						const x = vertex_pos[i];
						const y = vertex_pos[i+1];
						const z = vertex_pos[i+2];

						const value:number|{r:number, g:number,b:number}|number[] = vertex_func(x,y,z,i)

						const x_ = Number((value as any).x) || Number((value as number[])[0]) || Number(value) || x
						const y_ = Number((value as any).y) || Number((value as number[])[1]) || Number(value) || y
						const z_ = Number((value as any).z) || Number((value as number[])[2]) || Number(value) || z

						new_vertex[i] = x_
						new_vertex[i+1] = y_
						new_vertex[i+2] = z_
						
					}
					this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute( new_vertex, 3))
					this.mesh.geometry.attributes.position.needsUpdate = true; 
					(document.querySelector('.vertex_status') as HTMLElement).style.boxShadow = ''
				}catch(err){
					(document.querySelector('.vertex_status') as HTMLElement).style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					console.debug("error", err)
				}
			}

			requestAnimationFrame(this.loop_vertex)
		},
		toggle_scale_pane(){
			const app = this
			const index = 1

			if(!this.mesh.userData.scale.script){
				const scale_pane = this.pane.addInput(this.mesh, 'scale',{ index: index })
				scale_pane.controller_.view.labelElement.classList.add('hand')

				scale_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.scale.script = true
					scale_pane.dispose()
					app.toggle_scale_pane()
				}


			}else{

				const scale_pane = this.pane.addInput(this.mesh.userData.scale, 'func', {
					label: 'scale function',
					index: index
				})

				scale_pane.controller_.view.valueElement.classList.add('scale_status')

				scale_pane.on('change', function(){
					try{
						const scale_func = new Function(
							'x',
							'y',
							'z',
							`return (${app.mesh.userData.scale.func})`
						)

						app.mesh.userData.scale.callback = (x:number,y:number,z:number) => scale_func(x,y,z)
						scale_pane.controller_.view.valueElement.style.boxShadow = ''
					}catch(error){
						scale_pane.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
						app.$emit('log', app.id, error)
					}
				})

				scale_pane.controller_.view.labelElement.classList.add('hand')

				scale_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.scale.script = false
					scale_pane.dispose()
					app.toggle_scale_pane()
				}

			}
		},
		toggle_position_pane(){
			const app = this
			const index = 2

			if(!this.mesh.userData.position.script){
				const position_pane = this.pane.addInput(this.mesh, 'position',{ index: index })
				position_pane.controller_.view.labelElement.classList.add('hand')

				position_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.position.script = true
					position_pane.dispose()
					app.toggle_position_pane()
				}


			}else{
				const position_pane = this.pane.addInput(this.mesh.userData.position, 'func', {
					label: 'position function',
					index: index
				})
				
				position_pane.controller_.view.valueElement.classList.add('position_status')

				position_pane.on('change', function(){
					try{
						const position_func = new Function(
							'x',
							'y',
							'z',
							`return (${app.mesh.userData.position.func})`
						)

						position_pane.controller_.view.valueElement.style.boxShadow = ''
						app.mesh.userData.position.callback = (x:number,y:number,z:number) => position_func(x,y,z)
					}catch(error){
						position_pane.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
						app.$emit('log', app.id, error)
					}
				})

				
				position_pane.controller_.view.labelElement.classList.add('hand')

				position_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.position.script = false
					position_pane.dispose()
					app.toggle_position_pane()
				}

			}
		},
		toggle_rotation_pane(){
			const app = this
			const index = 3

			if(!this.mesh.userData.rotation.script){
				const rotation_pane = this.pane.addInput(this.mesh, 'rotation',{ 
					index: index,
					view: 'rotation',
					rotationMode: 'euler',
				})

				rotation_pane.controller_.view.labelElement.classList.add('hand')

				rotation_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.rotation.script = true
					rotation_pane.dispose()
					app.toggle_rotation_pane()
				}


			}else{
				const rotation_pane = this.pane.addInput(this.mesh.userData.rotation, 'func', {
					label: 'rotation function',
					index: index
				})

				rotation_pane.controller_.view.valueElement.classList.add('rotation_status')

				rotation_pane.on('change', function(){
					try{
						const rotation_func = new Function(
							'x',
							'y',
							'z',
							`return (${app.mesh.userData.rotation.func})`
						)

						rotation_pane.controller_.view.valueElement.style.boxShadow = ''
						app.mesh.userData.rotation.callback = (x:number,y:number,z:number) => rotation_func(x,y,z)
					}catch(error){
						app.$emit('log', app.id, error)
						rotation_pane.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
					}
				})

				rotation_pane.controller_.view.labelElement.classList.add('hand')

				rotation_pane.controller_.view.labelElement.onclick = function(){
					app.mesh.userData.rotation.script = false
					rotation_pane.dispose()
					app.toggle_rotation_pane()
				}	
			}
		},
		add_source_pane(){
			const app = this
			this.pane.on('change', this.save)

			this.pane.children.map( (c:any)=> c.dispose())

			this.pane.title = this.$data.name
			this.pane.hidden = false

			this.pane.addInput(this.$data, 'name').on('change', function(name:any){
				app.$emit('rename_source', app.id, name.value)			
				app.pane.title = name.value
			})

			this.toggle_scale_pane()
			this.toggle_position_pane()
			this.toggle_rotation_pane()
/*
			this.pane.addButton({
				title: 'from file'
			})
		       */

			if(!this.$props.is_model) {
				const geometry_pane = this.pane.addFolder({title:'geometry'})
				add_geometry_pane( this, geometry_pane )
			}
			if(!this.$props.is_model) {
				const material_pane = this.pane.addFolder({title:'material'})
				add_material_pane( this, material_pane )
			}
		},
		import(){
			const app = this

			let data = JSON.parse(localStorage.getItem(this.id) || "null")
				console.debug("data improt", data)
			if(data != null){
				const loader = new THREE.ObjectLoader()
				const mesh: any = loader.parse(data)
				console.debug("miau ?")
				this.mesh.geometry.dispose()
				this.mesh.material.dispose()
				this.mesh = mesh 


				this.mesh.material.map = null
				this.mesh.material.displacementMap = null

				if(this.mesh.userData.texture_map != ''){
					this.mesh.material.map = (this.$props.textures[this.mesh.userData.texture_map] || {}).texture || null
				}else{
					this.mesh.material.map = null
				}

				if(this.mesh.userData.texture_displacement != ''){
					this.mesh.material.displacementMap = (this.$props.textures[this.mesh.userData.texture_displacement] || {}).texture || null
				}else{
					this.mesh.material.displacementMap = null
				}
					this.mesh.material.needsUpdate = true

				try{
					this.mesh.userData.color.callback = new Function(
						'r','g','b',
						`return ${this.mesh.userData.color.func}`
					)
				}catch(err){
					this.mesh.userData.color.callback = (r:number, g:number, b:number) => [r,g,b]
				}

				try{
					this.mesh.userData.opacity.callback = new Function(
						'x',
						`return ${this.mesh.userData.opacity.func}`
					)
				}catch(err){
					this.mesh.userData.opacity.callback = (x:number) => x				
				}

				try{
					this.mesh.userData.displacementScale.callback = new Function(
						'x',
						`return ${this.mesh.userData.displacementScale.func}`
					)
				}catch(err){
					this.mesh.userData.displacementScale.callback = (x:number) => x				
				}

				try{
					this.mesh.userData.displacementBias.callback = new Function(
						'x',
						`return ${this.mesh.userData.displacementBias.func}`
					)
				}catch(err){
					this.mesh.userData.displacementBias.callback = (x:number) => x				
				}

				try{
					this.mesh.userData.scale.callback = new Function(
						'x',
						'y',
						'z',
						`return (${this.mesh.userData.scale.func})`
					)
				}catch(err){
					this.mesh.userData.scale.callback = (x:number, y:number, z:number) => [x,y,z]
				}
				
				try{
					this.mesh.userData.position.callback = new Function(
						'x',
						'y',
						'z',
						`return (${this.mesh.userData.position.func})`
					)
				}catch(err){
					this.mesh.userData.position.callback = (x:number, y:number, z:number) => [x,y,z]		
				}
				
				try{
					this.mesh.userData.rotation.callback = new Function(
						'x',
						'y',
						'z',
						`return (${this.mesh.userData.rotation.func})`
					)
				}catch(err){
					this.mesh.userData.rotation.callback = (x:number, y:number, z:number) => [x,y,z]		
				}
			}

		},
		save(){
			let data = JSON.stringify(this.toJSON())
			localStorage.setItem(this.id, data)
		},
		toJSON(){
		      	return this.mesh.toJSON()
		},
	},
	data(){
		let mesh;
		if(this.$props.is_model){
			mesh = this.$props.models[this.$props.id]
		}else{
			mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(1,1,100,100),
			new THREE.MeshPhongMaterial({
				transparent: true,
				side: THREE.DoubleSide,
				map: null
			})
		)
		}

		mesh.name = this.$props.name

		mesh.userData = {
			id: this.$props.id,
			name: this.$props.name,
			texture_map: '',
			texture_displacement: '',
			color: {
				script: false,
				func: '',
				callback: (r:number,g:number,b:number)=>[r,g,b]
			},
			opacity: {
				script: false,
				func: '',
				callback: (x:number)=> x
			},
			displacementScale:{
				script: false,
				func: '',
				callback: (x:number)=> x
			},
			displacementBias:{
				script: false,
				func: '',
				callback: (x:number)=> x
			},
			scale: {
				script: false,
				func: '',
				callback: (x:number,y:number,z:number)=>[x,y,z]
			},
			position : {
				script: false,
				func: '',
				callback: (x:number,y:number,z:number)=>[x,y,z]
			},
			rotation : {
				script: false,
				func: '',
				callback: (x:number,y:number,z:number)=>[x,y,z]
			},
			segments: 100,
			vertex:{
				script: false,
				func: '',
				callback: (x:number, y:number, z:number, i:number)=>[x,y,z]
			},
		}

		return {
			name: this.$props.name,
			mesh: mesh,
		}
	},
	send_socket(){
		const pos = {
			x: this.mesh.position.x,
			y: this.mesh.position.y,
			z: this.mesh.position.z,
		}

		const rot = {
			x: this.mesh.rotation.x,
			y: this.mesh.rotation.y,
			z: this.mesh.rotation.z,
		}

		const data = {
			id: this.$props.id,
			name: this.$props.name,
			position: pos,
			rotation: rot,
		}
		this.$emit('socket', data)
	},
	unmounted(){
		this.scene.remove(this.mesh)
		this.mesh.geometry.dispose()
		this.mesh.material.dispose()

		localStorage.removeItem(this.id)
	},
	created(){
		this.import()
		this.add_source_pane()
		this.scene.add(this.mesh)
		console.debug("component ", this)

		requestAnimationFrame(this.loop_vertex)
		requestAnimationFrame(this.loop_color)
		requestAnimationFrame(this.loop_opacity)
		requestAnimationFrame(this.loop_displacementScale)	
		requestAnimationFrame(this.loop_displacementBias)
		requestAnimationFrame(this.loop_scale)
		requestAnimationFrame(this.loop_position)
		requestAnimationFrame(this.loop_rotation)
	}
})
