import {createApp} from 'vue'
import { Pane } from 'tweakpane'
import * as THREE  from 'three'

interface Texture_Map extends THREE.VideoTexture{
	userData: {
		id: string
	}
}

interface Texture{
	map: Texture_Map
}


export default createApp({
	data(){
		let miau = {miau:''};
		const pane = new Pane()
		pane.addInput(miau, 'miau')
		return {
			textures: {}
		}
	}
})
.mount("#app")
