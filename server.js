const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const flash = require('flash')
const session = require('express-session')

const app = express()

const port = process.env.PORT || 3000
const index = require('./routes/index')
const database = require('./database.js')

require('ejs')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'basic-secret' }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use('/', index)
app.use((request, response) => {
  response.status(404).render('not_found')
})

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, username, password, done){
    database.getUser(username, password, (error, user) => {
      if (error) {
        return done(error)
      }
      if(user.length <= 0){
        return done(null, false, req.flash('loginMessage', "Login Attempt Failed"))
      }
      if(!error) {
        return done(null, username)
      }
    })
  }
))

passport.serializeUser(function(user, done) {
  return done(null, user)
})
passport.deserializeUser(function(name, done) {
  database.getUserByName(name, function(err, user) {
    return done(err, user)
  })
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
