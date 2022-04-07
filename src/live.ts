import {createApp} from 'vue'
import Peer from 'peerjs'

const url = new URL(location.href)

const host_id = url.searchParams.get('live')

export default createApp({
	data(){
		return {
			is_live : true,
			host_id: host_id,
			peer_id: ''
		}
	},
	methods:{
		oncall(call:any){

			console.debug("call received")
			call.on('stream', function(stream:any){
				console.debug("sream ", stream);
				(document.querySelector('#live') as HTMLVideoElement).srcObject = stream;
				(document.querySelector('#live') as HTMLVideoElement).width = stream.getVideoTracks()[0].getSettings().width;
				(document.querySelector('#live') as HTMLVideoElement).height = stream.getVideoTracks()[0].getSettings().height
			})
			call.answer()
		},	
	},
	mounted(){
		const app = this
		let a = new Uint32Array(3);
		window.crypto.getRandomValues(a);

		const id = (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");
		const peer = new Peer(
			id,
			{
				host: "peerjs.piranhalab.cc",
				secure:true,
				config:{
					iceServers: [
						{
							urls: 'stun:stun.piranhalab.cc:5349'
						},
						{
							urls: 'turn:turn.piranhalab.cc:3478',
							username: 'guest',
							credential:"somepassword"
						}
					],
				},
			}
		)

		this.peer_id = id

		peer.on('open', function(id){
			console.debug("peerjs connection happened")
			app.peer_id = id

			peer.on('call', app.oncall)
			const conn = peer.connect(app.host_id, {label: 'threejs'})
			conn.on('open', function(){
				console.debug("connection opened with host")
			})

		})
	}
})
.mount('#app')

