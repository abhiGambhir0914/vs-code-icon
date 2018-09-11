// server.js

// set up ========================
var express = require('express');
var app = express(); // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

const icongen = require('icon-gen');
var fs = require('fs');
var zipFolder = require('zip-folder');

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================
var port = process.env.PORT || 8080;

app.get('/api/download', function(req, res) {
    res.download('./icons.zip');
})

app.post('/api/convert', function (req, res) {
    console.log("Converting");
    console.log(req.body.image);

    fs.writeFile("src/image.svg", req.body.image, function(err) {
        if(err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");

        const options = {
            report: true
        };
    
        icongen('./src/image.svg', './dist', options)
            .then((results) => {
                console.log(results)
                zipFolder('./dist', './icons.zip', function(err) {
                    if(err) {
                        console.log('oh no!', err);
                        res.send('error');
                    } else {
                        console.log('EXCELLENT');
                        res.download('icons.zip');
                    }
                });

                
            })
            .catch((err) => {
                console.error(err)
                res.send('error');
            });
    }); 
});

app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.listen(port);
console.log("app listening on " + port)