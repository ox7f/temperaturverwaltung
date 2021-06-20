const express = require('express')
const router  = express.Router()

let db

// +++++ Routes +++++

// login
router.get('/', (req, res) => {
	// falls schon eingeloggt auf dashboard weiterleiten
	if (req.session.email)
		return res.redirect('/dashboard')

    return res.render('pages/index')
})

// dashboard
router.get('/dashboard', (req, res) => {
	// check session => redirect to login
	if (req.session.email)
		return res.render('pages/dashboard', {user: {
			email: req.session.email,
			isAdmin: req.session.isAdmin
		}})

	return res.redirect('/')
})

// +++++ Login, Session stuff +++++

// logout
router.get('/api/logout', (req, res) => {
	req.session.destroy(() => res.redirect('/'))
})

// login
router.post('/api/login', (req, res) => {
	let { email, password } = req.body

	if (email && password)
		return db.login(email, password)
			.then((user) => {
				req.session.email = user.email
				req.session.password = user.passwd
				req.session.isAdmin = user.admin

				return res.redirect('/dashboard')
			})
			.catch((e) => res.redirect('/'))

	return res.send({ message: 'Missing parameters' })
})

// signup
router.post('/api/signup', (req, res) => {
	let { email, password, password2 } = req.body

	if (email && password && passwordConf)
		return db.signup(email, password, password2)
			.then(() => res.send({ message: 'Login successful' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))

	return res.send({ message: 'Missing parameters' })
})

// +++++ Admin stuff +++++

// add value
router.post('/api/add', (req, res) => {
	let { sensor, value } = req.body

	if (sensor && value)
		return db.add(sensor, value)
			.then(() => res.send({ message: 'Successfully added' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))

	return res.send({ message: 'Missing parameters' })
})

// remove value
router.post('/api/remove', (req, res) => {
	let id = req.body.id

	if (id)
		return db.remove(id)
			.then(() => res.send({ message: 'Successfully removed' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))

	return res.send({ message: 'Missing parameters' })
})

// +++++ Dashboard stuff +++++

// get db values
router.post('/api/list', (req, res) => {
	let { filter } = req.body,
		tableHead = ['id', 'time', 'value']

	switch(filter) {
		case 'b':
			tableHead = ['name', 'adresse', 'serverschrank']
			break
		case 'c':
			tableHead = ['name', 'adresse', 'serverschrank', 'time', 'value']
			break
		case 'd':
			tableHead = ['name', 'id', 'serverschrank', 'time', 'value']
			break
	}

	return db.list(filter)
		.then(data => res.json({ data:data, filter:tableHead, admin:req.session.isAdmin }))
		.catch((e) => res.send({ message: 'Missing parameters' }))
})

module.exports = database => { 
	db = database
	return router
}
