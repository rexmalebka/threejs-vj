import * as THREE from 'three'
import app from './index'


function create_axes(scene:THREE.Scene){
	const axes: THREE.AxesHelper = new THREE.AxesHelper(5)
	axes.name = "axes"
	scene.add(axes)
}

function add_lights(scene:THREE.Scene){
	const alight = new THREE.AmbientLight()
	alight.name = "ambient_light"
	alight.castShadow = true
	scene.add(alight)

	const plight = new THREE.PointLight(0xffffff, 0.1, 100, )
	plight.name = "point_light"

	plight.castShadow = true
	plight.position.set(0, 50, 0)
	scene.add(plight)

}

function add_fog(scene:THREE.Scene){
	scene.fog = new THREE.Fog(0xffffff,0.1,20)
	scene.userData.fog_color = scene.fog.color
	scene.fog.name = 'fog'
}

export default function init_scene(scene:THREE.Scene){
	create_axes(scene)	
	add_lights(scene)
	add_fog(scene)
}
