import { Pane } from 'tweakpane'
import type {FolderApi} from 'tweakpane'



export default function(data:any, pane:FolderApi){
	const mesh_pane = pane.addFolder({
		title: 'mesh',
		expanded: false
	})

	mesh_pane.addInput(data, 'visible')
	
	const scale_tab = mesh_pane.addTab({
		pages:[
			{ title: "Fixed"},
			{ title: "From script"},
		]
	})

	scale_tab.pages[0].addInput(data, 'scale', {
		x: {min:0.1, step: 0.1},
		y: {min:0.1,step: 0.1},
		z: {min:0.1,step: 0.1},
	}).on('change',function(){
		data.userData.scale_fun = ""
	})

	scale_tab.pages[1].addInput(data.userData, 'scale_fun', {
		label: 'scale function'
	})
	

	const rotate_tab = mesh_pane.addTab({
		pages:[
			{ title: "Fixed"},
			{ title: "From script"},
		]
	})

	rotate_tab.pages[0].addInput(data, 'rotation', {
		x: { step: 0.1},
		y: { step: 0.1},
		z: { step: 0.1},
	}).on('change',function(){
		data.userData.rotation_fun = ""
	})

	rotate_tab.pages[1].addInput(data.userData, 'rotation_fun', {
		label: 'rotation function'
	})

	const pos_tab = mesh_pane.addTab({
		pages:[
			{ title: "Fixed"},
			{ title: "From script"},
		]
	})

	pos_tab.pages[0].addInput(data, 'position', {
		x: { step: 0.1},
		y: { step: 0.1},
		z: { step: 0.1},
	}).on('change',function(){
		data.userData.position_fun = ""
	})

	pos_tab.pages[1].addInput(data.userData, 'position_fun', {
		label: 'position function'
	})
	
}
