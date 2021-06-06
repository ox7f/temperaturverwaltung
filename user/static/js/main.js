let isAdmin = 0
const temperatures = document.getElementById('temperatures')

const addTemperature = temperature => {
	const template = `
		<tr>
			<th scope="row">${ temperature.sensor }</th>
			<td>${ temperature.time }</td>
			<td>${ temperature.value }</td>
			${ isAdmin ? '<td><i class="fas fa-times"></i></td>' : '' }
		</tr>
	`

	temperatures.insertAdjacentHTML('beforeend', template)
}

const getTemperatures = () => {
	fetch('/api/list', {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(res => res.json())
	.then(data => {
		isAdmin = data.admin
		temperatures.innerHTML = ''
		data.data.forEach(temperature => {
			addTemperature(temperature)
		})
		leerzeileEinfuegen()
	})
}

leerzeileEinfuegen = () => {
	temperatures
}

getTemperatures()

setInterval(() => {
	getTemperatures()
}, 5000)