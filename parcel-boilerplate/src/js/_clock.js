function getTime() {
	const clockElement = document.querySelector('#clock')

	let date = new Date()
	let hours = date.getHours()
	let minutes = date.getMinutes()
	let seconds = date.getSeconds()

	hours = (hours < 10 ? '0' : '') + hours
	minutes = (minutes < 10 ? '0' : '') + minutes
	seconds = (seconds < 10 ? '0' : '') + seconds

	clockElement.innerHTML = hours + ':' + minutes + ':' + seconds
}

export {
	getTime
}