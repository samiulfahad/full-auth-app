const User = require('../model/userModel');
const { body, validationResult } = require('express-validator');
const mailer = require('../nodeMailerConfig');


exports.getSignup = (req, res, next) => {
    const oldData = {name: '', email: '', password: ''}
    res.render('signup', {errorFields: [], oldData})
}

exports.postSignup = async (req, res, next) => {
    try {
        const validationError = validationResult(req)
        if( !validationError.isEmpty() ) {
            let errorFields = []
            let errorMsg = ''
            validationError.array().forEach( e => {
                errorFields.push(e.param)
                if( !errorMsg ) {
                    errorMsg = e.msg
                } else {
                   errorMsg = errorMsg + '.  ' + e.msg 
                }
            })
            const oldData = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            return res.render('signup', {errorMsg, errorFields, oldData})
        }
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const user = new User (name, email, password)
        const result = await user.save()
        if(result === 11000) {
            const errorMsg = 'Email already exists'
            const errorFields = ['email']
            const oldData = { name, email, password }
            return res.render('signup', {errorMsg, errorFields, oldData})
        }
        if(!result){
            throw new Error('erroe in postSignup')
        }
        const successMsg = 'Account Created. Please Login'
        const oldData = { email, password: '' }
        res.render('login', { oldData, successMsg })
        await mailer(email, 'Account Created Successfully', '<p>Hello, Your account has been created and activated successfully. This is a demo website and no activation link was sent to speed up the testing. And also no styling were applied</p> <p>Thank You</p> <b>Samiul Fahad</b>')
    }
    catch (err) {
        next(err)
    }
}

exports.getLogin = (req, res, next ) => {
    const oldData = { email: '', password: '' }
    res.render('login', { oldData })
}

exports.postLogin = async (req, res, next) => {
    try{
        const email = req.body.email
        const password = req.body.password
        const errors = validationResult(req)
        if( !errors.isEmpty() ) {
            const errorMsg = errors.array()[0].msg
            const oldData = { email, password}
            return res.render('login', {errorMsg, oldData})            
        }
        const user = await User.Login(email, password)
        if(!user){
            const oldData = {email, password}
            return res.render('login', {errorMsg: 'Criteria did not match', oldData})
        }
        req.session.user = user
        req.session.isLoggedIn = true
        if(req.session.redirectUrl){
            return res.redirect(req.session.redirectUrl)
        }
        res.redirect('/')
    }
    catch(err) {
        next(err)
    }
}

exports.postLogout = (req, res, next) => {
    req.session.destroy( err => {
        if(err){
           throw new Error('Error in postLogout')
        }
        return res.redirect('/')
    })
}

exports.getResetPassword = (req, res, next) => {
    res.render('resetPassword')
}

exports.postResetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorMsg = errors.array()[0].msg
            return res.render('resetPassword', {errorMsg})
        }
        const email = req.body.email
        const user = await User.EmailResetToken(email)
        if(!user){
            return res.render('passwordResetMsg')
        }
        const resetUrl = `http://localhost:3000/update-password?userId=${user.userId}&token=${user.resetToken}`
        res.render('passwordResetMsg')
        await mailer(email, 'Password Reset', `<p>Hello, <button> <a href=${resetUrl}>Click Here </a> </button> to reset your password. Link will be expired after 10mins.</p> <p>Thank You</p> <b>Samiul Fahad</b>`)
    }
    catch (err) {
        next(err)
    }
}

exports.getUpdatePassword = async (req, res, next) => {
    try {
        const resetToken = req.query.token
        const userId = req.query.userId
        const result = await User.FindResetToken(userId, resetToken)
        if(!result) {
            const errorMsg = 'User not found with this token or token expired'
            return res.render('resetPassword', {errorMsg})
        }
        res.render('updatePassword', {userId: userId, token: resetToken})
    }
    catch (err) {
        next(new Error(err))
    }
}

exports.postUpdatePassword = async (req, res, next) => {
    try {    
        const token = req.body.token
        const userId = req.body.userId
        const password = req.body.password
        const result = await User.ResetPassword(userId, token, password)
        if( !result ) {
            const errorMsg = 'User not found with this token or token expired'
            return res.render('resetPassword', {errorMsg})
        }
        const oldData = { email: '', password: '' }
        const successMsg = 'Password Changed Successfully' 
        res.render('login', { successMsg, oldData})
    }
    catch (err) {
        next(err)
    }
}

// Validation Functions
exports.signupValidator = [
        body('name').isAlpha().withMessage('Name should contain only letters')
            .isLength({min:3, max:18}).withMessage('Name should have min 3 and max 10 characters').trim(),
        body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail().trim(),
        body('password').isLength({min: 3, max: 12}).withMessage('Password should have min length of 3 and max 12')
    ]

exports.loginValidator = [
            body('email', 'Please Enter a valid email').isEmail().normalizeEmail().trim()
        ]

exports.resetPasswordValidator = [
            body('email', 'Please Enter a valid email').isEmail().normalizeEmail().trim()
        ]