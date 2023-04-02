const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')

const connectDB = require('./dbConnection')
const authController = require('./controller/authControllers');
const checkPoint = require('./checkLoginStatus');
const prController = require('./controller/protectedRouteControllers');

const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/auth',
  collection: 'sessions'
});

app.use(session({
    secret: 'hi there!!!',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 604800 },
    store: store
}))
const csrfProtection = csrf()
app.use(csrfProtection)

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    res.locals.successMsg = req.session.successMsg
    res.locals.errorMsg = req.session.errorMsg
    req.session.successMsg = undefined
    req.session.errorMsg = undefined
    next()
})

app.get('/', (req, res) => {
    const oldData = { email: '', password: '' }
    res.render('index', { oldData })
})

// Auth Routes
app.get('/signup', checkPoint.nonLoggedInOnly, authController.getSignup)

app.post('/signup', checkPoint.nonLoggedInOnly, authController.signupValidator, authController.postSignup)

app.get('/login', checkPoint.nonLoggedInOnly, authController.getLogin)

app.post('/login', checkPoint.nonLoggedInOnly, authController.loginValidator, authController.postLogin )

app.post('/logout', checkPoint.loggedInOnly, authController.postLogout)

app.get('/reset-password', checkPoint.nonLoggedInOnly, authController.getResetPassword)

app.post('/reset-password', checkPoint.nonLoggedInOnly, authController.resetPasswordValidator, authController.postResetPassword)

app.get('/update-password', checkPoint.nonLoggedInOnly, authController.getUpdatePassword)

app.post('/update-password', checkPoint.nonLoggedInOnly, authController.postUpdatePassword)

// Protected Routes
app.get('/pr-1', prController.pr_1)

app.get('/pr-2', prController.pr_2)

//Centralized Error Handling Middleware
app.use( (err, req, res, next) => {
    console.log(err);
    console.log('From Centralized Error handling Middleware');
    res.status(500).render('error')
})

app.listen(3000, async()=>{
    try{
        const db = await connectDB()
        await db.collection('users').createIndex({email: 1}, {unique: true})
        console.log('Server is listening on port 3000');
    } 
    catch (err) {
        console.log(err);
    }
})