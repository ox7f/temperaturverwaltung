const express = require('express')
const router  = express.Router()

let db

router.get('/', (req, res) => {
	if (req.session.email) {
		return res.redirect('/dashboard')
	}

    return res.render('pages/index')
})

router.get('/dashboard', (req, res) => {
	if (req.session.email) {
		return res.render('pages/dashboard', {user: {
			email: req.session.email,
			isAdmin: req.session.isAdmin
		}})
	}

	return res.redirect('/')
})

// +++++ Login, Session stuff +++++

router.get('/api/logout', (req, res) => {
	req.session.destroy(() => res.redirect('/'))
})

router.post('/api/login', (req, res) => {
	let { email, password } = req.body

	if (email && password) {
		return db.login(email, password)
			.then((user) => {
				req.session.email = user.email
				req.session.password = user.passwd
				req.session.isAdmin = user.admin

				return res.redirect('/dashboard')
			})
			.catch((e) => res.redirect('/'))
	}

	return res.send({ message: 'Missing parameters' })
})

router.post('/api/signup', (req, res) => {
	let { email, password, password2 } = req.body

	if (email && password && passwordConf) {
		return db.signup(email, password, password2)
			.then(() => res.send({ message: 'Login successful' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))
	}

	return res.send({ message: 'Missing parameters' })
})

// +++++ Admin stuff +++++

router.post('/api/add', (req, res) => {
	let { sensor, value } = req.body

	if (sensor && value) {
		return db.add(sensor, value)
			.then(() => res.send({ message: 'Successfully added' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))
	}

	return res.send({ message: 'Missing parameters' })
})

router.post('/api/remove', (req, res) => {
	let { sensor, value } = req.body

	if (sensor && value) {
		return db.add(sensor, value)
			.then(() => res.send({ message: 'Successfully added' }))
			.catch((e) => res.send({ message: 'Something went wrong' }))
	}

	return res.send({ message: 'Missing parameters' })
})

// +++++ Dashboard stuff +++++

router.post('/api/list', (req, res) => {
	return db.list()
		.then(data => res.json({data:data, admin:req.session.isAdmin}))
		.catch((e) => res.send({ message: 'Missing parameters' }))
})

module.exports = database => { 
	db = database
	return router
}
