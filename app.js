var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var mongo = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/toby";
var mongoose = require('mongoose');
mongoose.connect(dbUrl);
var db = mongoose.connection;
var assert = require('assert');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fileUpload = require('express-fileupload');

var app = express();

//Configure app
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

//Use middleware
app.use(express.static(`${__dirname}/public`));
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

app.use(session({
    secret: 'secret'
    ,saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.use(validator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;

        while(namespace.length){
            formParam += `[${namespace.shift()}]`;
        }
        
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

app.use(flash());

app.use(function (req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error.msg');
    res.locals.user = req.user || null;
    next();
});

/*
app.use(function(req, res, next){
    res.type('text/plain');
    res.status(404);
    res.render('404');
});
*/

app.use(require('./routes/users')); //Routers for user actions
app.use(require('./routes/posts')); //Routers for post actions

app.get('/', function(req, res){
    var posts = null;
    mongo.connect(dbUrl, function(err, db){
        if(err) {
            console.log("Unable to connect to the mongodb server", err);
        } else {
            var collection = db.collection('posts');

            collection.find({}).toArray(function(err, result){
                if(err){
                    res.send(err);
                } else if(result.length){
                    console.log(result);
                    posts = result;
                } else {
                    console.log(`No results found`);
                }

                res.render('home', {posts: posts});
            });
        }
    });
});

app.get('/about', function(req, res){
    res.render('about');
});

app.listen(app.get('port'), function(){
    console.log(`Toby-gallery is running on port ${app.get('port')}...`);
    console.log(`Enter CTRL-C to exit`)
});
