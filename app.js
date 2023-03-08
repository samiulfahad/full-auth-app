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

app.get('/', (req, res) => {
    res.render('index', { isLoggedIn: req.session.isLoggedIn, msg: req.session.msg })
})

app.get('/s', (req, res) => {
    req.session.msg = 'Testing.....'
    req.session.isLoggedIn = true
    req.session.cookie.maxAge = 5000
    res.render('index', { isLoggedIn: req.session.isLoggedIn, msg: req.session.msg })
})

app.get('/signup', (req, res) => {
    res.render('signup', { isLoggedIn: req.session.isLoggedIn })
})

app.post('/signup', async (req, res) => {
    const name = req.body.name
    const email = req.body.email.trim().toLowerCase()
    const password = req.body.password
    const user = await new User (name, email, password)
    const savedUser = await user.save()
    if(!savedUser){
        return res.render('error', { isLoggedIn: req.session.isLoggedIn })
    }
    res.send(savedUser)
    // res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('login', { isLoggedIn: req.session.isLoggedIn })
})

app.post('/login', async (req, res) => {
    try{
        const email = req.body.loginEmail.trim().toLowerCase()
        const password = req.body.loginPassword
        const user = await User.findUser(email, password)
        if(!user){
            return res.send('No user Found')
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

app.listen(3000, async()=>{
    const db = await connectDB()
    console.log('Server is listening on port 3000');
})