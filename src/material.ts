import type {FolderApi} from 'tweakpane'
import * as THREE from 'three'


function toggle_opacity_pane(data:any, pane:FolderApi){
	const index = 1

	if(data.mesh.userData.opacity.script){
		const opacity_pane = pane.addInput(data.mesh.userData.opacity, 'func',{
			label: 'opacity function',
			index: index
		})

		opacity_pane.on('change', function(){
			try{
				 const opacity_func = new Function(
					 'x',
					 `return (${data.mesh.userData.opacity.func})`
				 )

				 data.mesh.userData.opacity.callback = opacity_func
			}catch(error){
				data.$emit('log', data.id, error)
			}
		})

		opacity_pane.controller_.view.labelElement.classList.add('hand')

		opacity_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.opacity.script = false
			opacity_pane.dispose()
			toggle_opacity_pane(data, pane)
		}
	}else{
		const opacity_pane = pane.addInput(data.mesh.material, 'opacity',{
			index: index,
			min:0,
			max: 1,
			step:0.01
		})

		opacity_pane.controller_.view.labelElement.classList.add('hand')

		opacity_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.opacity.script = true
			opacity_pane.dispose()
			toggle_opacity_pane(data, pane)
		}

	}

}

function toggle_color_pane(data:any, pane:FolderApi){
	const index = 0

	if(data.mesh.userData.color.script){
		const color_pane = pane.addInput(data.mesh.userData.color, 'func',{
			label: 'color function',
			index: index
		})

		color_pane.on('change', function(){
			try{
				 const color_func = new Function(
					 'r','g','b',
					 `return (${data.mesh.userData.color.func})`
				 )

				 data.mesh.userData.color.callback = color_func
			}catch(error){
				data.$emit('log', data.id, error)
			}
		})

		color_pane.controller_.view.labelElement.classList.add('hand')

		color_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.color.script = false
			color_pane.dispose()
			toggle_color_pane(data, pane)
		}
	}else{
		const color = {
			color: {
				r: data.mesh.material.color.r * 255,
				g: data.mesh.material.color.g * 255,
				b: data.mesh.material.color.b * 255,
			}
		}

		const color_pane = pane.addInput(color, 'color', {
			index: index
		})
		
		color_pane.on('change', function(color_value:any){
			data.mesh.material.color.r = color_value.value.r / 255
			data.mesh.material.color.g = color_value.value.g / 255
			data.mesh.material.color.b = color_value.value.b / 255
		})

		color_pane.controller_.view.labelElement.classList.add('hand')

		color_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.color.script = true
			color_pane.dispose()
			toggle_color_pane(data, pane)
		}

	}
}

function toggle_displacementScale_pane(data:any, pane:FolderApi){
	const index = 4

	if(data.mesh.userData.displacementScale.script){
		const displacementScale_pane = pane.addInput(data.mesh.userData.displacementScale, 'func',{
			label: 'displacementScale function',
			index: index
		})

		displacementScale_pane.on('change', function(){
			try{
				 const displacementScale_func = new Function(
					 'x',
					 `return (${data.mesh.userData.displacementScale.func})`
				 )

				 data.mesh.userData.displacementScale.callback = displacementScale_func
			}catch(error){
				data.$emit('log', data.id, error)
			}
		})

		displacementScale_pane.controller_.view.labelElement.classList.add('hand')

		displacementScale_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.displacementScale.script = false
			displacementScale_pane.dispose()
			toggle_displacementScale_pane(data, pane)
		}
	}else{
		const displacementScale_pane = pane.addInput(data.mesh.material, 'displacementScale',{
			index: index,
			min:0,
			step:0.01
		})

		displacementScale_pane.controller_.view.labelElement.classList.add('hand')

		displacementScale_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.displacementScale.script = true
			displacementScale_pane.dispose()
			toggle_displacementScale_pane(data, pane)
		}

	}

}

function toggle_displacementBias_pane(data:any, pane:FolderApi){
	const index = 5

	if(data.mesh.userData.displacementBias.script){
		const displacementBias_pane = pane.addInput(data.mesh.userData.displacementBias, 'func',{
			label: 'displacementBias function',
			index: index
		})

		displacementBias_pane.on('change', function(){
			try{
				 const displacementBias_func = new Function(
					 'x',
					 `return (${data.mesh.userData.displacementBias.func})`
				 )

				 data.mesh.userData.displacementBias.callback = displacementBias_func
			}catch(error){
				data.$emit('log', data.id, error)
			}
		})

		displacementBias_pane.controller_.view.labelElement.classList.add('hand')

		displacementBias_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.displacementBias.script = false
			displacementBias_pane.dispose()
			toggle_displacementBias_pane(data, pane)
		}
	}else{
		const displacementBias_pane = pane.addInput(data.mesh.material, 'displacementBias',{
			index: index,
			min:0,
			step:0.01
		})

		displacementBias_pane.controller_.view.labelElement.classList.add('hand')

		displacementBias_pane.controller_.view.labelElement.onclick = function(){
			data.mesh.userData.displacementBias.script = true
			displacementBias_pane.dispose()
			toggle_displacementBias_pane(data, pane)
		}

	}

}

export default function(data:any, pane:FolderApi){

	toggle_color_pane(data, pane)
	
	toggle_opacity_pane(data, pane)

	const textures = Object.fromEntries(
		Object.entries(data.$props.textures).map((x:[string, any]) => [x[1].name, x[0]])
	)

	textures.none = ''

	pane.addInput(data.mesh.userData, 'texture_map',{
		label: 'map texture',
		options: textures
	}).on('change', function(texture:any){
		if(texture.value == ''){
			data.mesh.material.map = null
		}else{
			data.mesh.material.map = data.$props.textures[texture.value].texture
		}
		data.mesh.material.needsUpdate = true
	})

	pane.addInput(data.mesh.userData, 'texture_displacement',{
		label: 'displacement texture',
		options: textures
	}).on('change', function(texture:any){
		if(texture.value == ''){
			data.mesh.material.displacementMap = null
		}else{
			data.mesh.material.displacementMap = data.$props.textures[texture.value].texture
		}
		data.mesh.material.needsUpdate = true
	})


	toggle_displacementScale_pane(data, pane)
	
	toggle_displacementBias_pane(data, pane)
}
