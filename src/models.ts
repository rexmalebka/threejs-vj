import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader }  from 'three/examples/jsm/loaders/FBXLoader.js';

const gltf_loader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );

gltf_loader.setDRACOLoader( dracoLoader );

const obj_loader = new OBJLoader()
const fbx_loader = new FBXLoader()

function import_obj(blob:string, res:Function, rej:Function){
	obj_loader.load(blob, function(obj:THREE.Object3D){
		console.debug("miau", obj)
		res(obj)
	}, ()=>{} , function(error:ErrorEvent){
		rej(error)
	})

}

function import_gltf(blob:string, res:Function, rej:Function){
	gltf_loader.load(blob, function(obj:any){
		console.debug("miau", obj)
		res(obj.scene)
	}, ()=>{}, function(error:ErrorEvent){
		rej(error)
	})
}

function import_fbx(blob:string, res:Function, rej: Function){
	fbx_loader.load(blob, function(obj:any){
		console.debug("miau", obj)
		res(obj)
	}, ()=>{}, function(error:ErrorEvent){
		rej(error)
	})
}

export default function(){
	const input = document.createElement('input')
	input.type='file'
	input.click()

	return new Promise(function(res:Function, rej:Function){

		input.onchange = function(e:Event){
			if(input.files == null){ 
				return rej() 
			}

			const reader = new FileReader()
			// reader.readAsArrayBuffer(input.files[0])


			const ext = (input.files[0] as File).name.split('.')
			if(ext.length  == 0){ rej() }

			reader.readAsDataURL(input.files[0])
			switch(( ext.pop() as String).toLowerCase()){
				case 'obj': 
					reader.addEventListener('load', function(){
					import_obj(reader.result as string, res, rej)
				})
				break;
				case 'gltf': 
					reader.addEventListener('load', function(){
					import_gltf(reader.result as string, res, rej)
				})
				break;
				case 'glb': 
					reader.addEventListener('load', function(){
					import_gltf(reader.result as string, res, rej)
				})
				break;
				case 'fbx': 
					reader.addEventListener('load', function(){
					import_fbx(reader.result as string, res, rej)
				})
				break;
				default: 
					rej("Not Supported")
				break;
			}
		}
	})
}
