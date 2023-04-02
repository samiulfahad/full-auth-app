exports.pr_1 = (req, res)=> {
    if( !req.session.isLoggedIn ) {
        req.session.errorMsg = 'Login Required'
        req.session.redirectUrl = '/pr-1'
        return res.redirect('/login')
    }
    res.render('protected', {successMsg: 'This is Protected Route 1. You are logged in and you have access to this route'})
}

exports.pr_2 = (req, res)=> {
    if( !req.session.isLoggedIn ) {
        req.session.errorMsg = 'Login Required'
        req.session.redirectUrl = '/pr-2'
        return res.redirect('/login')
    }
    res.render('protected', {successMsg: 'This is Protected Route 2. You are logged in and you have access to this route'})
}