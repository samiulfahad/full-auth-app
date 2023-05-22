const express = require('express');
const controller = require('../controller/controllers');
const {loggedInOnly, nonLoggedInOnly} = require('../middlewares/checkLoginStatus');
const { validateSignupForm, validateLoginForm, validateResetPassForm } = require('../middlewares/formValidation');
const { signupErrRes, loginErrRes, resetPassErrRes } = require('../middlewares/errorResponse');

const router = express.Router()
// Homepage
router.get('/', (req, res) => {
    const oldData = { email: '', password: '' }
    res.render('index', { oldData })
})

router.get('/signup', nonLoggedInOnly, controller.getSignup)

router.post('/signup', nonLoggedInOnly, validateSignupForm, signupErrRes, controller.postSignup)

router.get('/login', nonLoggedInOnly, controller.getLogin)

router.post('/login', nonLoggedInOnly, validateLoginForm, loginErrRes, controller.postLogin)

router.post('/logout', loggedInOnly, controller.postLogout)

router.get('/reset-password', nonLoggedInOnly, controller.getResetPassword)

router.post('/reset-password', nonLoggedInOnly, validateResetPassForm, resetPassErrRes, controller.postResetPassword)

router.get('/update-password', nonLoggedInOnly, controller.getUpdatePassword)

router.post('/update-password', nonLoggedInOnly, controller.postUpdatePassword)

// Protected Route
router.get('/protected', controller.protected)

exports.router = router

