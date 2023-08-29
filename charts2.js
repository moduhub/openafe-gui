const chart = require('chart.js')
chart({
	type: 'bar',
	data: {
		labels: ['a', 'b', 'c', 'd'],
		datasets: [{
			label: 'red bars',
			backgroundColor: '#ab1020',
			data: [0, 3, 4, 1],
		}],
	}
})