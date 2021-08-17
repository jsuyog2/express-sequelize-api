const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');
const {
    Pool,
    Client
} = require('pg');
const config = require('./config');
const app = express();
const port = config.port;

// create application/json parser
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '500mb'
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

//cors
const allowlist = config.corsAllowList;

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;

    let isDomainAllowed = allowlist.indexOf(req.header('Origin')) !== -1;

    if (isDomainAllowed) {
        // Enable CORS for this request
        corsOptions = {
            origin: true
        }
    } else {
        // Disable CORS for this request
        corsOptions = {
            origin: false
        }
    }
    callback(null, corsOptions)
}
app.use(cors(corsOptionsDelegate))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});
