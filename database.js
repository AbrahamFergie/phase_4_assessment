const pg = require('pg')

const dbName = 'vinyl'
const connectionString = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`
const client = new pg.Client(connectionString)

client.connect()

// Query helper function
const query = function(sql, variables, callback){
  console.log('QUERY ->', sql.replace(/[\n\s]+/g, ' '), variables)

  client.query(sql, variables, function(error, result){
    if (error){
      console.log('QUERY <- !!ERROR!!')
      callback(error)
    }else{
      // console.log('QUERY <-', JSON.stringify(result.rows))
      callback(error, result.rows)
    }
  })
}

const getAlbums = function(number, callback) {
  query("SELECT id, title, artist FROM albums LIMIT $1", [number], callback)
}

const getAlbumsByID = function(albumID, callback) {
  query("SELECT users.name, albums.title, albums.id, albums.artist, reviews.message FROM albums JOIN reviews ON reviews.album_id=albums.id JOIN users ON users.id=reviews.user_id WHERE albums.id = $1 ORDER BY reviews.date_added DESC", [albumID], callback)
}

const getUser = function(username, password, callback){
  query("SELECT name, email, date_added FROM users WHERE name = $1 AND password = $2", [username, password], callback)
}

const getUserByName = function(name, callback){
  query("SELECT name, email, date_added FROM users WHERE name = $1", [name], callback)
}

const getUserIdByUsername = function(name, callback){
  query("SELECT id FROM users WHERE name = $1", [name], callback)
}

const newUser = function(user, email, password, date_added, callback){
  query("INSERT INTO users(name, email, password, date_added) VALUES($1, $2, $3, $4) RETURNING *", [user, email, password, date_added], callback)
}

const getAlbumTitleById = function(id, callback){
  query("SELECT title FROM albums JOIN reviews ON reviews.album_id=albums.id WHERE albums.id=$1", [id], callback)
}

const createReview = function(user, id, albumId, albumTitle, message, date, callback){
  query("INSERT INTO reviews(album_title, message, user_id, album_id, date_added) VALUES ($1, $2, $3, $4, $5)", [albumTitle, message, id, albumId, date], callback)
}

const getReviewsForUser = function(id, callback){
  query("SELECT reviews.id, title, message FROM reviews JOIN users ON reviews.user_id=users.id JOIN albums ON reviews.album_id=albums.id WHERE users.id = $1 ORDER BY reviews.date_added DESC", [id], callback)
}

const getReviewsByAlbumId = function(albumId, callback){
  query("SELECT message FROM reviews JOIN albums ON albums.id=reviews.album_id WHERE albums.id=$1", [albumId], callback)
}

const deleteMessage = function(reviewId, callback){
  query("DELETE FROM reviews WHERE id = $1", [reviewId], callback)
}

const checkUser = function(userEmail, callback){
  query("SELECT email FROM users WHERE email = $1", [userEmail], callback)
}

const getReviews = function(callback){
  query("SELECT message, users.name, reviews.date_added FROM reviews JOIN users ON reviews.user_id=users.id ORDER BY reviews.date_added DESC", [], callback)
}

module.exports = {
  newUser,
  getAlbums,
  getAlbumsByID,
  getUser,
  getUserByName,
  getUserIdByUsername,
  getAlbumTitleById,
  createReview,
  getReviewsForUser,
  getReviewsByAlbumId,
  deleteMessage,
  checkUser,
  getReviews
}
