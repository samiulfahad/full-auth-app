const express = require('express')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')

const connectDB = require('./databaseConnection/dbConnection')
const { router } = require('./router/router');

// Setting up the App
const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Session Initialization
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

// Passing variables to all views
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn
    res.locals.successMsg = req.session.successMsg
    res.locals.errorMsg = req.session.errorMsg
    req.session.successMsg = undefined  // Clearing values after single use (flash messages)
    req.session.errorMsg = undefined    // Clearing values after single use (flash messages)
    next()
})

// CSRF Protection
const csrfProtection = csrf()
app.use(csrfProtection)         // Check CSRF Token in incoming request 
app.use((req, res, next) => {   // Pass CSRF token to view
    res.locals.csrfToken = req.csrfToken()
    next()
})

// Main Router
app.use(router)

// 404 Handler
app.use((req, res)=> {
    res.render('404')
})


//Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err);
    console.log('From Centralized Error handling Middleware');
    res.status(500).render('error')
})

app.listen(3000, async () => {
    try {
        const db = await connectDB()
        await db.collection('users').createIndex({ email: 1 }, { unique: true })
        console.log('Server is listening on port 3000');
    }
    catch (err) {
        console.log(err);
    }
})