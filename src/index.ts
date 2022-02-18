const url = new URL(location.href)

let app:any;
if(url.searchParams.get('live')){
	app = import('./live')
}else{
	app = import('./app')
}

export default app 
