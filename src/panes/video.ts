import { Pane } from 'tweakpane'
import * as THREE from 'three'
import type {FolderApi} from 'tweakpane'


export default function(data:any, pane:FolderApi){
	const video_pane = pane.addFolder({
		title: 'video',
		expanded: false
	})


	const options = Object.fromEntries(
		Object.entries(data.userData.videos).map(function(x:[string, any]){
			return [x[1].name as string, x[1].texture]		
		})
	)

	const mock_texture = {
		texture: ''
	}

	video_pane.addInput(mock_texture, 'texture',{
		label: 'map texture',
		options: {
			...options,
			none:''
		}
	})
/*
	tabs.pages[0].addInput(data.userData.video, 'playbackRate', {
		min: 0.1,
		max: 14,
		step: 0.1,
	})

	tabs.pages[0].addInput(data.userData, 'start', {
		min: 0,
		max: 0.99,
		step: 0.01,
	})
	
	tabs.pages[0].addInput(data.userData, 'duration', {
		min: 0.1,
		step: 0.01,
	})

	tabs.pages[1].addButton({
		title: "select window" 
	}).on('click', async function(){
		data.userData.src = await navigator.mediaDevices.getDisplayMedia({video:true, audio:false})
	})
       */
}
