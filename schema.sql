
CREATE TABLE albums
(
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  artist VARCHAR NOT NULL
);

CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  date_added VARCHAR NOT NULL
);

CREATE TABLE reviews
(
  id SERIAL PRIMARY KEY,
  album_title VARCHAR NOT NULL,
  message VARCHAR NOT NULL,
  user_id INT NOT NULL,
  album_id INT NOT NULL,
  date_added VARCHAR NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (album_id) REFERENCES albums(id)
);
