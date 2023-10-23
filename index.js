const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use('/documentation.html', express.static('public'));

const cors = require('cors');
// app.use(cors());

// giving access only to certain origins
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);
const passport = require('passport');
    require('./passport');

// this one works!
app.get('/', (req, res) => {
    res.send('Movie time!');
});

// GET - return list of all movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find().then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET - return data about single movie by title
app.get('/movies/title/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET - return data about genre by name
app.get('/movies/genre/:Genre', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({'Genre.Name': req.params.Genre })
    .then((movie) => {
        if (!movie) {
            return res.status(404).json({
                error: 'genre not found.'
            })
        }
        res.status(200).json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });W
});

// GET - return data about director by name
app.get('/movies/directors/:Director', passport.authenticate('jwt', {session: false}), async (req, res) => {
    Movies.findOne({'Director.Name': req.params.Director})
    .then((movie) => {
        if (!movie) {
            return res.status(404).json({
                error: 'director not found.'
            })
        }
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// get all users
app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            return res.status(404).json({
                error: 'user not found.'
            })
        }
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// updating a user's info by username
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate
        }
    },
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    })

});

// POST - add movie to user's list of favourites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), 
    [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ],
    async (req, res) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
    }

    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavouriteMovies: req.params.MovieID }
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// DELETE - user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        }else{
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// CREATE - allow new users to register
app.post('/users', 
    // validation logic
    [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
// check validation objects for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthdate: req.body.Birthdate
            })
            .then((user) =>{res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//DELETE - allow users to remove a movie from their list of favourites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
   await Users.findOneAndUpdate({Username: req.params.Username}, {
    $pull: {FavouriteMovies: req.params.MovieID}},
    {new: true })
    .then(updatedUser => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Your app is listening on port ' + port);
});

// error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured!');
});
