import { Pane } from 'tweakpane'
import mesh_pane from './panes/mesh'
import material_pane from './panes/material'
import geometry_pane from './panes/geometry'


export default function(data:any, pane:Pane){
	pane.addInput(data.userData,'name')
	mesh_pane(data, pane)

	geometry_pane(data, pane)
	material_pane(data, pane)

	
	return pane
}
