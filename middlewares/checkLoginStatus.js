const loggedInOnly = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn
    const msg = 'Login Required!'
    if( !isLoggedIn ){
        return res.redirect('login', {email: '', errorMsg: msg})
    }
    next()
}

const nonLoggedInOnly = (req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn
    if( isLoggedIn ){
        return res.render('msg', {msg: 'You are already logged in'})
    }
    next()
}

exports.loggedInOnly = loggedInOnly
exports.nonLoggedInOnly = nonLoggedInOnly