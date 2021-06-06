let isAdmin = 0
const temperaturesTable = document.getElementById('temperatures')

const addTemperature = temperature => {
	const template = `
		<tr>
			<th scope="row">${ temperature.sensor }</th>
			<td>${ temperature.time }</td>
			<td>${ temperature.value }</td>
			${ isAdmin ? '<td><i id=' + temperature.id + ' class="fas fa-times" onclick="iconClick(this, \'remove\')"></i></td>' : '' }
		</tr>
	`

	temperaturesTable.insertAdjacentHTML('beforeend', template)
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
		temperaturesTable.innerHTML = ''
		data.data.forEach(temperature => {
			addTemperature(temperature)
		})
	})
}


leerzeileEinfuegen = () => {
	const template = ` 
		<table class="table">
			<thead>
				<tr>
					<td><input class="form-control" id="sensorId"></td>
					<td><input class="form-control" readonly></input></td>
					<td><input class="form-control" id="tempValue"></td>
					<td><i onclick="iconClick(this, \'add\')" class="fas fa-check"></i></td> 
				</tr>
			</thead>
			<tbody id="temperatures"></tbody>
		</table>
	`
	temperaturesTable.parentElement.insertAdjacentHTML('beforeend', template)
}

iconClick = (element, action) => {
	switch(action) {
		case 'remove':
			let tempId = Number(element.id)

			fetch('/api/remove', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: tempId
				})
			})
			.then(res => res.text())
			.then(text => {
				// if text => error/success meldung
				getTemperatures()
			})
			break
		case 'add':
			let tempValue = Number(document.getElementById('tempValue').value),
				sensorId = Number(document.getElementById('sensorId').value)

			console.log('add temp', tempValue, sensorId)

			fetch('/api/add', {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					sensor: sensorId,
					value: tempValue
				})
			})
			.then(res => res.text())
			.then(text => {
				// if text => error/success meldung
				getTemperatures()
			})
			break
	}
}

getTemperatures()
leerzeileEinfuegen()

setInterval(() => {
	getTemperatures()
}, 5000)