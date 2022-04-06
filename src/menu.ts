import { Pane } from 'tweakpane'
import { defineComponent } from 'vue'
import type { TabApi, TabPageApi} from 'tweakpane'

export default defineComponent({
	props: ['sources', 'active_source', 'videos'],
	watch:{
		'active_source': {
			handler(){
				const page = (this.pane.children[0] as TabApi).pages[0]
				this.gen_source(page)

			},
			deep: true
		}
	},
	data(){
		const pane = new Pane({
			title: 'menu'
		})

		const help:{[name:string] : string} = {
			'sources': `sources are 3D mesh specification, as the geometry and mesh properties`,
			'textures': `textures are color maps for a mesh`,
			'from script': "",
		}

		return {
			pane:pane,
			help:help,
			active_source_: '',
		}
	},
	methods: {
		add_tabs(){
			const menu_tabs = this.pane.addTab({
				pages:[
					{title: 'sources'},
					{title: 'textures'},
					{title: 'monitor'},
				]
			})
			this.add_sources_tab(menu_tabs.pages[0])
			//this.add_info_tab(menu_tabs.pages[3])
		},
		add_sources_tab(page:TabPageApi){
			const app = this

			this.gen_sources_menu(page)

			page.addButton({title:'create source'}).on('click', function(){
				app.$emit('add_source')	
			})

			page.addSeparator()
		},
		gen_sources_menu(page:TabPageApi){
			if(page.children[0]) page.children[0].dispose()

			const sources = Object.fromEntries(
				Object.entries(this.$props.sources).map(function(source_entry:[string, any]){
					return [source_entry[1].name as string, source_entry[0]]
				})
			)

			if(Object.keys(this.$props.sources).length == 0){
				sources.none =  ''
			}

			page.addInput(this.$data, 'active_source_', {
				index:0,
				label: 'active source',
				options: sources
			})
		},
		gen_source(page:TabPageApi){
			const source = this.sources[this.active_source]

			console.debug("soucr",source, this.active_source)

			if(page.children[4]) page.children[4].dispose()
			page.addInput(source, 'name',{index:4})
		},
		add_info_tab(page:TabPageApi){
			for(let sub_help of Object.keys(this.help)){
				page.addMonitor(this.help, sub_help, {
					multiline: true
				})	
			}

		},
	},
	mounted(){
		console.debug("menu component ",this)
		this.add_tabs()
	}
})
