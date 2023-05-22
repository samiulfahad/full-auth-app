const { body } = require('express-validator');

const name = body('name').trim()
            .custom((value, {req}) => {
                const names = value.split(' ')
                names.forEach(name => {
                    const isAlpha = /^[a-zA-Z]+$/.test(name)
                    if(!isAlpha){
                        throw new Error("Name should contain letters only")
                    }
                })
                return true
            })
const email = body('email').isEmail().withMessage('Enter a valid email').normalizeEmail().trim()
const password = body("password").isLength({ min: 5 }).withMessage("Minimum 5 characters long password")
    .isLength({ max: 12 }).withMessage("Maximum 12 characters long password")

const signup = [name, email, password]
const login = [email, body('password').notEmpty().withMessage("Enter password")]

exports.validateSignupForm = signup
exports.validateLoginForm = login
exports.validateResetPassForm = email