import { Pane } from 'tweakpane'
import * as THREE from 'three'
import type {FolderApi } from 'tweakpane'

export default function(data:any, pane:FolderApi){
	const geometry_pane = pane.addFolder({
		title: 'Geometry',
		expanded:false
	})

	geometry_pane.addInput(data.userData, 'geometry',{
		options: {
			'plane': new THREE.PlaneGeometry(1,1,100,100),
			'box': new THREE.BoxGeometry(1,1,1,100,100,100),
			'sphere': new THREE.SphereGeometry(1,100,100),
			'torus': new THREE.TorusGeometry(1,0.5,100,100),
			'torus knot': new THREE.TorusKnotGeometry(1,0.4,100,100),
			'circle': new THREE.CircleGeometry(1,100),
			'cone': new THREE.ConeGeometry(1,1,100,100),
			'cylinder': new THREE.CylinderGeometry(1,1,1,100,100),
			'ring': new THREE.RingGeometry(0.5,1, 100)
		}
	})
}
