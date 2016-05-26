var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongojs = require('mongojs');

var mongo = require('mongodb');
var mongoose = require('mongoose');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//mongoose.connect('mongodb://localhost/productApp');
//var db = mongoose.connection;
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ent = require('ent');
mongoose.connect('mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist');
var dbm = mongoose.connection;


var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine','handlebars');

//icone
app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(session({
     secret: 'secret secret',
     //store: new MongoStore({db:dbcart}),
     store: new MongoStore({
    url: 'mongodb://elfuche:Travail#2016@ds011903.mlab.com:11903/productlist',
    collection:'cartSession'
  }),
     resave: false,
     saveUninitialized: true
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());


// Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;
    while(namespace.length){
      formParam +='[' + namespace.shift() +']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

// Global Vars
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.booking = req.md || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
