const socket = io();

// todo
socket.on('table-data', data => {
	
})

// todo: nice-to-have: umstruktierung beim init-laden
// init server call vermeiden, um zu pruefen ob user admin ist oder nicht

// dom-table with temp values
let tableBody = document.getElementById('tableBody'),
	tableHead = document.getElementById('tableHead'),
	filterSelect = document.getElementById('filter')

let isAdmin = 0,
	tableBodyArray = [],
	tableHeadArray = []

// add row to tableHead
const addDataToTableHead = name => {
	tableHead.insertAdjacentHTML('beforeend', `<th scope="col">${ name }</th>`)
}

// add data to tableBody
const addDataToTableBody = temperature => {
	let bodyData = ''

	for (let [key, value] of Object.entries(temperature)) {
		bodyData += `<td scope="row">${ value }</td>`
	}

	const templateBody = `
		<tr>
			${ bodyData }
			${ isAdmin ? '<td><i id=' + temperature.id + ' class="fas fa-times" onclick="iconClick(this, \'remove\')"></i></td>' : '' }
		</tr>
	`

	tableBody.insertAdjacentHTML('beforeend', templateBody)
}

// get temp values from db
const getTemperatures = () => {
	return fetch('/api/list', {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({filter: document.getElementById('filter').value})
	})
	.then(res => res.json())
	.then(data => {
		console.log(data)
		isAdmin = data.admin

		if (tableBodyArray === data.data)
			return

			tableBodyArray = data.data

		tableHead.innerHTML = ''
		tableBody.innerHTML = ''

		data.data.forEach(data => {
			addDataToTableBody(data)
		})

		data.filter.forEach(name => {
			addDataToTableHead(name)
		})
	})
}

// init table
const init = () => {
	getTemperatures()
		.then(() => {
			if (!isAdmin)
				return

			// todo: kopf machen was wir hier immer brauchen um einen Temp-wert zu adden 
			let template = ` 
				<table class="table">
					<thead id="tableHead">
						<tr>
							<td><input class="form-control" id="sensorId"></td>
							<td><input class="form-control" readonly></input></td>
							<td><input class="form-control" id="tempValue"></td>
							<td><i onclick="iconClick(this, \'add\')" class="fas fa-check"></i></td> 
						</tr>
					</thead>
					<tbody id="tableBody"></tbody>
				</table>
			`
			tableBody.parentElement.insertAdjacentHTML('beforeend', template)
		})
}

// click event (add, remove)
const iconClick = (element, action) => {
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
				showToast(text)
				getTemperatures()
			})
			break
		case 'add':
			let tempValue = Number(document.getElementById('tempValue').value),
				sensorId = Number(document.getElementById('sensorId').value)

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
				showToast(text)
				getTemperatures()
			})
			break
	}
}

// todo: toast for messages from backend
const showToast = message => {
	let toast = document.createElement('div'),
		text = document.createElement('span')

	text.value = message
	toast.style.position = 'absolute'

	toast.appendChild(text)
	document.body.appendChild(toast)
}

// update temp values every x seconds
setInterval(() => {
	getTemperatures()
}, 5000)

init()
filterSelect.addEventListener('change', getTemperatures)