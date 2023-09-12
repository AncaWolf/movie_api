const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

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

// READ - return list of all movies to the user
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// READ - return data about single movie by name
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title );

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such movie');
    }

});

// READ - return data about genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movies => movies.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such genre')
    }

});

// READ - return data about director by name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movies => movies.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no such director')
    }

});

// CREATE - allow new users to register
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need names')
    }
})

//UPDATE - allow users to update their username info
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }
})

//POST - allow users to add movies to their list of favourites
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favouriteMovies.push(movieTitle);
        res.status(200).send('${movieName} has been added to user ${id}s array');
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE - allow users to remove a movie from their list of favourites
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle );
        res.status(200).send('${movieTitle} has been removed from user ${id} s array');
    } else {
        res.status(400).send('no such user')
    }
})

//DELETE - allow users to deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id );
        res.status(200).send('user ${id} has been deleted');
    } else {
        res.status(400).send('no such user')
    }
})



app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured!');
});
