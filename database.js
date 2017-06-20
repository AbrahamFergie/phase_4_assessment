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

const getAlbums = function(callback) {
  query("SELECT * FROM albums", [], callback)
}

const getAlbumsByID = function(albumID, callback) {
  query("SELECT * FROM albums WHERE id = $1", [albumID], callback)
}

const getUser = function(username, password, callback){
  query("SELECT name, email FROM users WHERE name = $1 AND password = $2", [username, password], callback)
}

const getUserByName = function(name, callback){
  query("SELECT name, email FROM users WHERE name = $1", [name], callback)
}

const newUser = function(user, email, password, callback){
  query("INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *", [user, email, password], callback)
}

module.exports = {
  getAlbums,
  getAlbumsByID,
  getUser,
  newUser,
  getUserByName
}
