# movie API
 
## Endpoints

- GET - Return a list of all movies
- GET - Return data(description, genre, director, image URL, whether it's features or not) about a single movie by title to the user
- GET - Return data about a genre(description) by name/title (e.g. "Chocolat")
- GET - Return data about a director(bio, birth year, death year) by name
- POST - Allow new users to register
- PUT - Allow users to update their user info (username)
- POST - Allow users to add a movie to their list of favorite
- DELETE - Allow users to remove a movie from their list of favorite
- DELETE - Allow existing users to deregister

## Dependencies

- bcrypt
- body-parser
- CORS
- express
- express-validator
- jsonwebtoken
- lodash
- mongodb
- mongoose
- morgan
- passport
- passport-jwt
- uuid

## Getting Started

- install npm: `npm install`
- server start command: `npm start`
