var express = require('express')
var app = express()
var path = require('path')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var passport = require('./config/passport')
var session = require('express-session');
var methodOverride = require('method-override');

// Database
let url = "mongodb+srv://leehoyun:"+ encodeURIComponent("PIXM9QXuKyaaer50")+"@cluster0.rskid.gcp.mongodb.net/test"
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection
db.once('open', function(){
    console.log('DB connected!')
})
db.on('error', function(err){
    console.log('DB ERROR', err)
})

// Middlewares
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type');
  next();
});
app.use(session({
  secret: '1q2w3e4r',
  resave: false,
  saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function(req, res, next){
  res.locals.isAuthenticated  =   req.isAuthenticated();
  res.locals.currentUser      =   req.user;
  next();
})

// Router
app.use('/', require('./routes/manager'))
app.use('/users', require('./routes/users'))
app.use('/posts', require('./routes/posts'))

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log('server on! http://localhost:' + port);
})