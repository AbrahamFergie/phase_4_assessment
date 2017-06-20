const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')

const database = require('../database')
// const passport = require('../config/passport')
const router = express.Router()

router.get('/', (request, response) => {
  console.log("=====response.user======", response)
  database.getAlbums((error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      response.render('index', { albums: albums })
    }
  })
})

router.get('/albums/:albumID', (request, response) => {
  const albumID = request.params.albumID

  database.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      const album = albums[0]
      response.render('album', { album: album })
    }
  })
})

router.get('/login', function(req, res) {
   res.render('login.ejs', { message: req.flash('loginMessage') })
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

router.get('/signup', function(req, res) {
   res.render('signup.ejs', { message: req.flash('signupMessage') })
})

router.post('/signup', function(req, res) {
  let { username, email, password } = req.body
  database.newUser(username, email, password, (error, profile) => {
    if(error) {
      res.render('signup')
    }else {
      let result = {}
      result.name = profile[0].name
      result.email = profile[0].email
      result.password = profile[0].password

      res.render('profile', {result})
    }
  })
})

router.get('/profile', isLoggedIn, function(req, res) {
   res.render('profile.ejs', {
       user : req.user
   })
})

router.get('/logout', function(req, res) {
   req.logout()
   res.redirect('/')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = router