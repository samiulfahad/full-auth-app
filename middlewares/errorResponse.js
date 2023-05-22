const { validationResult } = require('express-validator');

const signupErrRes = (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        let errorFields = []
        let errorMsg = ''
        validationError.array().forEach(e => {
            errorFields.push(e.param)
            if (!errorMsg) {
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
        return res.render('signup', { errorMsg, errorFields, oldData })
    }
    next()
}

const loginErrRes = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMsg = errors.array()[0].msg
        const oldData = { email: req.body.email, password: req.body.password }
        return res.render('login', { errorMsg, oldData })
    }
    next()
}

const resetPassErrRes = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorMsg = errors.array()[0].msg
        return res.render('resetPassword', { errorMsg })
    }
    next()
}

exports.signupErrRes = signupErrRes
exports.loginErrRes = loginErrRes
exports.resetPassErrRes = resetPassErrRes