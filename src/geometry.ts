import type {FolderApi} from 'tweakpane'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
	
const font_loader = new FontLoader()
let font_promise = new Promise(function(res, rej){
	font_loader.load('/fonts/Roboto_Regular.json', function(font:any){
		res(font)
	})
})


export default function(data:any, pane:FolderApi){
	pane.addInput(data.mesh.geometry, 'type',{
		options: {
			'plane': 'PlaneGeometry',
			'box': 'BoxGeometry',
			'sphere': 'SphereGeometry',
			'circle': 'CircleGeometry',
			'cone': 'ConeGeometry',
			'cylinder': 'CylinderGeometry',
			'torus': 'TorusGeometry',
			'knot': 'TorusKnotGeometry',
			'text': 'TextGeometry'
		}
	}).on('change', function(type:any){
		switch(type.value){
			case 'PlaneGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.PlaneGeometry(1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break;
			case 'BoxGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.BoxGeometry(1,1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break;
			case 'SphereGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.SphereGeometry(1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'CircleGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CircleGeometry(1,
									     data.mesh.userData.segments,
									    )
				break
			case 'ConeGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.ConeGeometry(1,1,
									     data.mesh.userData.segments,
									    )
				break
			case 'CylinderGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CylinderGeometry(1,1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TorusGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusGeometry(1,0.4,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TorusKnotGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusKnotGeometry(1,0.4,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TextGeometry': 
				let content = { text: '' }

				pane.addInput(content, 'text').on('change', function(){
					font_promise.then(function(font:any){	
						data.mesh.geometry.dispose()
						data.mesh.geometry = new TextGeometry(content.text, {
							font: font,
							size:2,
							height: 0.1
						})

						data.mesh.geometry.userData['text'] = content.text
						console.debug("mesh--", data.mesh)
					})

				})
				break
		}
	})

	const segments = pane.addInput(data.mesh.userData, 'segments', {
		step:1,
		min:1,
	})

	segments.on('change', function(){
		switch(data.mesh.geometry.type){
			case 'PlaneGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.PlaneGeometry(1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break;
			case 'BoxGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.BoxGeometry(1,1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break;
			case 'SphereGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.SphereGeometry(1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'CircleGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CircleGeometry(1,
									     data.mesh.userData.segments,
									    )
				break
			case 'ConeGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.ConeGeometry(1,1,
									     data.mesh.userData.segments,
									    )
				break
			case 'CylinderGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CylinderGeometry(1,1,1,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TorusGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusGeometry(1,0.4,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TorusKnotGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusKnotGeometry(1,0.4,
									     data.mesh.userData.segments,
									     data.mesh.userData.segments,
									    )
				break
			case 'TextGeometry': 

				font_promise.then(function(font:any){	
					const text = data.mesh.geometry.userData.text
					data.mesh.geometry.dispose()
					data.mesh.geometry = new TextGeometry(text, {
						font: font,
						size:2,
						height: 0.1,
						curveSegments: Math.floor(data.mesh.userData.segments/2)
					})
				})

				break
		}
		
	})
	
	pane.addInput(data.mesh.userData.vertex, "script", {
		label: "vertex script"
	})

	const vertex_func = pane.addInput(data.mesh.userData.vertex, 'func', {
		label: 'vertex modifier function',
	})

	vertex_func.on('change', function(vertex:any){
		try{
			const vertex_func = new Function(
				'x', 'y', 'z','i',
				`return (${vertex.value})`			
			)

			data.mesh.userData.vertex.callback = vertex_func
		}catch(err){
			data.$emit('log', data.id, err)
		}
	})
	
}
