class chan{
	constructor(value){
		this.value = value
	}

	[Symbol.toPrimitive](hint){
		console.debug(hint)
		return this.value
	}
}

ch0 = new chan(666)
console.debug(
	ch0,
	ch0+222,
	ch0.value
)
ch0.value = 555
console.debug(
	ch0,
	ch0+222,
	ch0 == true
)
