import type {TabPageApi, FolderApi} from 'tweakpane'
import Peer from 'peerjs'
import { WebMidi } from 'webmidi'


function add_audio_page(data:any, page:TabPageApi){

	navigator.mediaDevices.enumerateDevices().then(function(devices){
		const audio = page.addFolder({title: 'audio'})

		let devs:{[name:string] : string} = {
			'none': 'none'
		}

		devices.forEach( (device)=>{
			if(device.kind === 'audioinput'){
				const name = `[input] ${device.label}`
				devs[name] = device.deviceId
			}else if(device.kind === 'audiooutput'){
				const name = `[output] ${device.label}`
				devs[name] = device.deviceId
			}
		})

		const audio_menu = audio.addInput(data, 'audio_device',{
			options:devs
		})

	})
}

function add_socket_page(data:any, page:TabPageApi){
	const sockets = page.addFolder({title: 'socket.io'})
	const url_obj = {url: data.socket_url}

	const socket_input = sockets.addInput(url_obj, 'url', {label: 'url'}).on('change', function(){
		data.socket_url = url_obj.url
	})

	socket_input.controller_.view.valueElement.classList.add('socket_status')

}

function add_webrtc_page(app:any, page:TabPageApi){
	const stream = page.addFolder({title: 'webrtc stream'})
	const stream_but = stream.addButton({title: 'go live'})

	stream_but.controller_.view.valueElement.classList.add('webrtc_status')
	let peer: Peer;
	stream_but.on('click', function(){
		if(app.peer_id.length == 0){
			let a = new Uint32Array(3);
			window.crypto.getRandomValues(a);

			const id = (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");

			peer = new Peer(
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
					debug:3
				})

				app.peer_id = id

				peer.on('open', function(id){
					console.debug("peerjs connection happened")

					app.peer_id = id
					app.mediaStream = app.renderer.domElement.captureStream(25)

					peer.on('connection', function(conn:any){ app.onconnect(peer, conn)})

					const url_div = document.createElement('div')
					url_div.id = "live_url"
					url_div.innerHTML =`${location.origin}${location.pathname}?live=${id}`

					stream.controller_.view.containerElement.appendChild(url_div)
					stream_but.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(0 255 0 / 30%)'

					stream_but.title = 'stop stream'
				})

				peer.on('close', function(){
					stream_but.title = 'go live'
					app.peer_id = '';
					stream_but.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
				})

				peer.on('disconnected', function(){
					stream_but.title = 'go live'
					app.peer_id = '';
					stream_but.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
				})

				peer.on('error', function(){
					stream_but.title = 'go live'
					app.peer_id = '';
					stream_but.controller_.view.valueElement.style.boxShadow = '0px 0px 10px 2px rgb(255 0 0 / 30%)'
				})

		}else{
			peer.destroy()
			app.peer_id = '';
			(stream.controller_.view.containerElement.querySelector("#live_url") as HTMLElement).remove();
			stream_but.title = 'go live'
			stream_but.controller_.view.valueElement.style.boxShadow = ''
		}
	})

}

function add_midi_page(app:any, page:TabPageApi){
	WebMidi.enable()
	.then(function(){
		if(WebMidi.inputs.length >= 1){
			const midi_folder = page.addFolder({title: 'midi', index:0})
			const inputs = Object.fromEntries(
				WebMidi.inputs.map((dev, index) => [dev.name,index])
			)
			console.debug("midi inpts", inputs, WebMidi)
			inputs['none'] = -1

			midi_folder.addInput(app, 'midi_input', {
				options: inputs
			})

		}

	})
}

export function midi_listener(new_midi:number, old:number){
	console.debug(new_midi, old, 'midi', WebMidi)
	for(let inp in WebMidi.inputs){
		for(let i=1; i<WebMidi.inputs[inp].channels.length; i++){
			WebMidi.inputs[inp].channels[i].removeListener()
		}
		
	}
	if(new_midi != -1){
		const listener = function(event:any){
			console.debug("noteOn ", event)
			const channel:number = event.message.channel
			const raw:number = Number(event.rawValue)
			const value:number = Number(event.value)
			const note:number = event.note.number;

			let ch;
			if(channel == 1) { ch = window.ch1 }
			if(channel == 2) { ch = window.ch2 }
			if(channel == 3) { ch = window.ch3 }
			if(channel == 4) { ch = window.ch4 }
			if(channel == 5) { ch = window.ch5 }
			if(channel == 6) { ch = window.ch6 }
			if(channel == 7) { ch = window.ch7 }
			if(channel == 8) { ch = window.ch8 }
			if(channel == 9) { ch = window.ch9 }
			if(channel == 10) { ch = window.ch10 }
			if(channel == 11) { ch = window.ch11 }
			if(channel == 12) { ch = window.ch12 }
			if(channel == 13) { ch = window.ch13 }
			if(channel == 14) { ch = window.ch14 }
			if(channel == 15) { ch = window.ch15 }
			if(channel == 16) { ch = window.ch16 }

			if(ch != undefined){
				ch.value = value
				ch.raw = raw
				ch.note = note
				ch.on = event.type == 'noteon' ? true : false
			}

		}

		WebMidi.inputs[new_midi].addListener('noteon', listener)
		WebMidi.inputs[new_midi].addListener('noteoff', listener)
	}

}

export  function add_interfaces_tab(data: any, page:TabPageApi){
	add_webrtc_page(data, page)
	add_audio_page(data, page)
	add_socket_page(data, page)
	add_midi_page(data, page)

}

