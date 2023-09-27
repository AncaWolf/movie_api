const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use('/documentation.html', express.static('public'));

let movies = [
    {
        "Title":"The Bridges of Madison County",
        "Description":"The life of a typical wife takes unexpected turns after encountering a photographer from out-of-town.",
        "Genre": {
            "Name":"Drama",
            "Description":"In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone."
        },
        "Director": {
            "Name":"Clint Eastwood",
            "Bio":"Clinton Eastwood Jr. is an American actor and film director. After achieving success in the Western TV series Rawhide, Eastwood rose to international fame with his role as the \"Man with No Name\".",
            "Birth": 1930
        },
    },
    {
        "Title":"House of Flying Daggers",
        "Description":"A police captain breaks a dancer of a rebel group out of prison to help her rejoin her fellow members. He gains her trust only to use her to lead him to the new leader of the organisatio",
        "Genre": {
            "Name":"Drama",
            "Description":"In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone."
        },
        "Director": {
            "Name":"Yi-Mou Zhang",
            "Bio":"Zhang Yimou is a Chinese film director, producer, writer, actor, professor and former cinematographer. Considered a key figure of China's Fifth Generation filmmakers, he made his directorial debut in 1988 with Red Sorghum, which won the Golden Bear at the Berlin International Film Festival.",
            "Birth": 1950
        },
    },
    {
        "Title":"3000 Years of Longing",
        "Description":"While attending a conference in Istanbul, Dr. Alithea Binnie happens to encounter a djinn who offers her three wishes in exchange for his freedom.",
        "Genre": {
            "Name":"Drama",
            "Description":"In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone."
        },
        "Director": {
            "Name":"George Miller",
            "Bio":"George Miller AO is an Australian filmmaker best known for his Mad Max franchise, whose second installment, Mad Max 2, and fourth, Fury Road, have been hailed as two of the greatest action films of all time, with Fury Road winning six Academy Awards.",
            "Birth": 1945
        },
    },
    
]

let users = [
    {
        id: 1,
        name: "Lilly",
        favouriteMovies: []
    },
    {
        id: 2,
        name: "James",
        favouriteMovies: ["The Bridges of Madison County"]
    },
]

app.get('/', (req, res) => {
    res.send('Movie time!');
});

// GET - return list of all movies to the user
app.get('/movies', async (req, res) => {
    await Movies.find().then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET - return data about single movie by name
app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({title: req.params.title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET - return data about genre by name
app.get('/movies/genre/:genreName', async (req, res) => {
    await Movies.findOne({'Genre.Name': req.params.genreName })
    .then((movie) => {
        res.status(200).json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// GET - return data about director by name
app.get('/movies/directors/:directorName', async (req, res) => {
    Movies.findOne({'Director.Name': req.params.directorName})
    .then((movie) => {
        res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// get all users
app.get('/users', async (req, res) => {
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
app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// updating a user's info by username
app.put('/users/:Username', async(req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
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

// POST - add movie to user's list of favorites
app.post('/users/:Username/movies/:MoviesID', async (req, res) => {
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
app.delete('/users/:Username', async (req, res) => {
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
app.post('/users', async (req, res) => {
    await Users.findOne({Username: req.body.Username })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Username + 'already exists');
        }else{
            Users
            .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
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
app.delete('/users/:Username/movies/:MoviesID', async (req, res) => {
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

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured!');
});
