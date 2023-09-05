const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use('/documentation.html', express.static('public'));

let movies = [];

app.get('/', (req, res) => {
    res.send('Movie time!');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});



app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error occured!')
});
