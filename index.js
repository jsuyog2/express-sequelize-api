const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {
    Pool,
    Client
} = require('pg');
const config = require('./config');
const app = express();
const port = config.port;

// create application/json parser
app.use(bodyParser.urlencoded({
    extended: false
}));


//Assgin all routes
const routes = require('./routes');
app.use('/', routes);

//pg db config
const client = new Client({
    connectionString: config.db,
})
client.connect()
app.set('client', client);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});
