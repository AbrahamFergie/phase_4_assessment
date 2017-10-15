const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')

const database = require('../database')
const router = express.Router()

router.get('/', (request, response, next) => {
  const numberOfAlbums = 10
  var name = ''
  if(request.user){
    name = request.user[0]
  }

  database.getAlbums(numberOfAlbums, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      database.getReviews((error, messages) => {
        if(error){
          response.status(500).render('error', { error: error })
        }else {
          messages = messages.slice(0,3)
          response.render('index', { albums, name, messages })
        }
      })
    }
  })
})

router.get('/albums/:albumID', (request, response) => {
  const { albumID } = request.params
  let userRetrieval = null
  if(request.session.passport){
    let { user } = request.session.passport
    userRetrieval = user
  }
  let userName = userRetrieval || ''
  database.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      response.status(500).render('error', { error: error })
    } else {
      const album = albums[0]
      const userNames = albums.map(album => {return album.name})
      const reviews = albums.map(album => {return album.message})
      response.render('album', { album, reviews, userNames, userName })
    }
  })
})

router.get('/album/:albumId/review', isLoggedIn, (request, response) => {
  let { albumId } = request.params
  if(request.session.passport){
    database.getAlbumTitleById(albumId, (error, title) => {
      let albumTitle = title[0].title
      response.render('add-review', {albumId, albumTitle})
    })
  }else{
    response.redirect('/')
  }
})

router.post('/album/:albumId/review', (request, response) => {
  let { user } = request.session.passport
  let { albumId } = request.params
  let message = request.body.review
  let date = new Date()
  date = date.getMonth() + ':' + date.getDay() + ':' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  database.getAlbumTitleById(albumId, (error, title) => {
    if(error){
      response.status(500).render('error', { error: error })
    }else{
      database.getUserIdByUsername(user, (error, id) => {
        if(error){
          response.status(500).render('error', { error: error })
        }else{
          let albumTitle = title[0].title
          let userId = id[0].id
          database.createReview(user, userId, albumId, albumTitle, message, date, (error, result) => {
            if(error){
              response.status(500).render('error', { error: error })
            }else{
              response.redirect('/')
            }
          })
        }
      })
    }
  })
})

router.get('/login', function(request, response) {
  response.render('login', {message: request.flash().session.flash})
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
)

router.get('/signup', function(request, response) {
  let responseMessage = ''
   response.render('signup.ejs', { message: request.flash('signupMessage'), responseMessage })
})

router.post('/signup', function(request, response) {
  let { username, email, password } = request.body
  let date = new Date()
  date = date.getMonth() + ':' + date.getDay() + ':' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  database.checkUser(email, (error, result) => {
    if(error){
      response.status(500).render('error', { error: error })
    }else if(result.length > 0){
      let responseMessage = 'Account has already been created with this email'
      response.render('signup', {responseMessage})
    }else {
      database.newUser(username, email, password, date, (error, profile) => {
        if(error) {
          let responseMessage = 'There was an error signing you up'
          response.render('signup')
        }else {
          let result = {}
          result.name = profile[0].name
          result.email = profile[0].email
          result.password = profile[0].password
          response.redirect('/')
        }
      })
    }
  })
})

router.get('/profile', isLoggedIn, function(request, response) {
  let { user } = request.session.passport
  database.getUserIdByUsername(user, (error, id) => {
    if(error){
      response.status(500).render('error', { error: error })
    }else {
      let userId = id[0].id
      database.getReviewsForUser(userId, (error, reviews) => {
        if(error){
          response.status(500).render('error', { error: error })
        }else{
          response.render('profile.ejs', {
            user : request.user, reviews
          })
        }
      })
    }
  })
})

router.get('/delete-message/:reviewId', function(request, response){
  let { reviewId } = request.params
  database.deleteMessage(reviewId,(error, result) => {
    if(error){
      response.status(500).render('error', { error: error })
    }else{
      response.redirect('/profile')
    }
  })
})

router.get('/logout', function(request, response) {
   request.logout()
   response.redirect('/')
})

function isLoggedIn(request, response, next) {
    if (request.isAuthenticated())
        return next();
    response.redirect('/');
}

module.exports = router
