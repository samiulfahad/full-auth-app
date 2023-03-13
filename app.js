const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const connectDB = require('./dbConnection')
const User = require('./userModel')

const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))


const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/auth',
  collection: 'sessions'
});

app.use(session({
    secret: 'hi there!!!',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30000 },
    store: store
}))

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn
    res.locals.successMsg = req.session.successMsg
    res.locals.errorMsg = req.session.errorMsg
    req.session.successMsg = undefined
    req.session.errorMsg = undefined
    next()
})

app.get('/', (req, res) => {
    res.render('index', { email: '' })
})

app.get('/signup', (req, res) => {
    res.render('signup', { isLoggedIn: req.session.isLoggedIn })
})

app.post('/signup', async (req, res) => {
    const name = req.body.name
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password
    const user = new User (name, email, password)
    const result = await user.save()
    req.session.isLoggedIn = false
    req.session.cookie.maxAge = 5000
    if(result === 11000) {
        req.session.errorMsg = 'Email already exists'
        return res.redirect('/signup')
    }
    if(!result){
        return res.render('error')
    }
    req.session.successMsg = 'Account Created. Please Login'
    res.redirect('login')
    // res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('login', {email: ''})
})

app.post('/login', async (req, res) => {
    try{
        const email = req.body.email.trim().toLowerCase()
        const password = req.body.password
        const user = await User.Login(email, password)
        if(!user){
            return res.render('login', {errorMsg: 'No user Found', email: email})
        }
        req.session.user = user
        req.session.isLoggedIn = true
        res.redirect('/')
    }
    catch(err) {
        console.log(err)
        res.render('error', { isLoggedIn: req.session.isLoggedIn })
    }
})

app.post('/logout', (req, res) => {
    if(!req.session){
        return res.render('error')
    }
    req.session.destroy((err)=> {
        if(!err){
           return res.redirect('/') 
        }
        res.render('error', { isLoggedIn: req.session.isLoggedIn })
    })
})

app.get('/reset-password', (req, res, next) => {
    res.render('resetPassword', {isLoggedIn: false})
})

app.post('/reset-password', async (req, res, next) => {
    const email = req.body.email.trim().toLowerCase()
    const resetToken = await User.EmailResetToken(email)
    console.log(resetToken);
    res.render('passwordResetMsg', {isLoggedIn: false})
})


app.get('/update-password', async (req, res, next) => {
    const resetToken = req.query.token
    const userId = req.query.userId
    const result = await User.FindResetToken(userId, resetToken)
    if( !result ) {
        return res.render('resetPassword', {isLoggedIn: false})
    }
    res.render('updatePassword', {userId: userId, token: resetToken})
})

app.post('/update-password', async (req, res, next) => {
    const token = req.body.token
    const userId = req.body.userId
    const password = req.body.password
    const result = await User.ResetPassword(userId, token, password)
    if( !result ) {
        return res.render('resetPassword', {isLoggedIn: false})
    }
    res.render('login', {isLoggedIn : false})
})

app.listen(3000, async()=>{
    try{
        const db = await connectDB()
        const result = await db.collection('users').createIndex({email: 1}, {unique: true})
        console.log('Server is listening on port 3000');
    } 
    catch (err) {
        console.log(err);
    }
})