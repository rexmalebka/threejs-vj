import { Pane } from 'tweakpane'
import type {FolderApi} from 'tweakpane'

export default function(data:any, pane:FolderApi){
	const material_pane = pane.addFolder({
		title: 'Material',
		expanded: false
	})

	material_pane.addInput(data.userData, 'texture',{
		label: "map",
		options: {
			...Object.fromEntries(Object.entries(data.userData.videos).map((x:[string, any]) => [x[1].name as string, x[0]] )),
			none: ''
		}
	})
	
	material_pane.addInput(data.material.userData, 'color')

	 material_pane.addInput(data.material, 'opacity', {
		 min: 0,
		 max: 1,
		 step:0.01
	 })

	 material_pane.addInput(data.material, 'shininess',{
		 min: 0,
		 step:0.1
	 })
	 

	 material_pane.addInput(data.material, 'displacementScale',{
		 min: 0,
		 step:0.001
	 })
	 
	 material_pane.addInput(data.material, 'displacementBias',{
		 min: 0,
		 step:0.001
	 })
/*
	 material_pane.addInput(data.material.map.repeat, 'x',{
		 label: "repeat x",
		 min: 0.01,
		 step:0.01
	 })

	 material_pane.addInput(data.material.map.repeat, 'y',{
		 label: "repeat y",
		 min: 0.01,
		 step:0.01
	 })
*/

}
