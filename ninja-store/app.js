
/**
 * Module dependencies.
 */

var express = require('express'); 
var store = require('./routes/store');
var db_helper = module.exports = require("./routes/db_helper.js");
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { pretty: true });
  //app.set('view options', { debug: true });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
	// if user is not logged in, ask them to login
	if (typeof req.session.username == 'undefined') res.render('home', { title: 'Ninja Store'});
	// if user is logged in already, take them straight to the items list
	else res.redirect('/items');
});

app.post('/', store.home_post_handler);

app.get('/input', store.input);
app.post('/input', store.input_post_handler);

// display the list of item


app.get('/items', function(req, res) {
    var items = db_helper.get_all('employees', function(err, items, fields) {
    if (err) {
        console.log("async1: " + err);
    }
    var keys = Object.keys( items );
        var fieldkeys = Object.keys( fields );
        var employees = items;
        emitdata('populate',employees);
        if (typeof req.session.username == 'undefined') res.redirect('/');
        else res.render('items', { title: 'Ninja Store - Items', username: req.session.username, items:items, keys:keys, fieldkeys:fieldkeys  });
    });
});

// show individual item
//app.get('/items', store.items);

// show individual item
app.get('/item/:id', store.item);
// show general pages
app.get('/page', store.page);
app.get('/logout', function(req, res) {
    // delete the session variable
    delete req.session.username;
    // redirect user to homepage
    res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var emitdata = function(channel,data) {
io.sockets.on('connection', function (socket) {
  io.sockets.emit(channel, data);
  });
};

var addemployee =  function(data) {
    db_helper.add_employee(data, function(lastId) {  
  });
 db_helper.get_all('employees', function(err, items, fields) {
    if (err) {
        console.log("async1: " + err);
    }
    emitdata('populate',items);
    });
    
    };

                   
var io = require('socket.io');
io = io.listen(app);
io.configure('development', function(){
  io.set('close timeout', '50');
});

io.sockets.on('connection', function(client) {
    
  console.log('Client connected'); 
  
    // client add new employee
  client.on('add employee', function(data) {
            console.log("addemployee ")
            addemployee(data);
        });
         });



  
