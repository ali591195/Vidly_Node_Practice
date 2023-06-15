const debug = require('debug')('vidly:startup');
const config = require('config');  
const express = require('express');
const genres = require('./routes/genres');
const homepage = require('./routes/homepage');
const helmet = require('helmet');
const morgan = require('morgan');
const authenticator = require('./middleware/authenticator');
const logger = require('./middleware/logger');
const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

console.log(config.get('mail.host'));
console.log(config.get('mail.password')); 

if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    debug(`Morgan enabled...`);
}

app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.use('/', homepage);
app.use('/api/genres', genres);
app.use(logger);
app.use(authenticator);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
