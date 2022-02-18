import type {FolderApi} from 'tweakpane'
import * as THREE from 'three'


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

		}
	}).on('change', function(type:any){
		switch(type.value){
			case 'PlaneGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.PlaneGeometry(1,1,100,100)
				break;
			case 'BoxGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.BoxGeometry(1,1,1,100,100)
				break;
			case 'SphereGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.SphereGeometry(1,100,100)
				break
			case 'CircleGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CircleGeometry(1,100)
				break
			case 'ConeGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.ConeGeometry(1,1,100)
				break
			case 'CylinderGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.CylinderGeometry(1,1,1,100,100)
				break
			case 'TorusGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusGeometry(1,0.4,100, 100)
				break
			case 'TorusKnotGeometry':
				data.mesh.geometry.dispose()
				data.mesh.geometry = new THREE.TorusKnotGeometry(1,0.4, 100, 50)	
				break
		}
	})
	pane.addInput()
}
