
/**
 * Module dependencies.
 */

var express = require('express'); 
var store = require('./routes/store');
//var db_helper = module.exports = require("./routes/db_helper.js");
var app = module.exports = express.createServer();

var db = require('mongoskin').db('localhost:27017/test'); 
var testcollection = db.collection('testcollection');

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
                        // testcollection.find({}, function(err, result) {
                        // if (err) throw err;
                        // result.each(function(err, data) {
                                // if (err) throw err;
                                // console.log('This Is What I Got' + JSON.stringify(data));
                                // emitdata('populate',data);
                                // });
                        // });
                        
                        testcollection.find().toArray(function(err, result) {
                        if (err) throw err;
                        console.log('This Is What I Got ' +JSON.stringify(result));
                        emitdata('populate', result);
                        });
                        
        if (typeof req.session.username == 'undefined') res.redirect('/');
        else res.render('items', { title: 'Ninja Store - Items'});
    //    else res.render('items', { title: 'Ninja Store - Items', username: req.session.username, items:items, keys:keys, fieldkeys:fieldkeys  });
  //  });
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

                  
var io = require('socket.io');
io = io.listen(app);
io.configure('development', function(){
  //io.set("transports", ["xhr-polling"]); 
  io.set("transports", ["websocket"]);
  //io.set("polling duration", 20); 
  //io.set("polling timeout", 20);
  //io.set("log level", 1);
  //io.set('heartbeat timeout', 5);
  //io.set('heartbeat interval', 5);
});

io.sockets.on('connection', function(socket) {
  console.log('Client connected'); 
  
  socket.on('data', function(data) {
            //console.log("data" + JSON.stringify(data))
                    testcollection.insert(data, function(err, result) {
                    if (err) throw err;
                    if (result) console.log('Added!');
                             testcollection.find().toArray(function(err, result) {
                                if (err) throw err;
                                //console.log('This Is What I Got ' +JSON.stringify(result));
                                socket.emit('populate', result);
                            }); 
                    });
         });
        });

function emitdata(channel,data) {
    console.log('This Is What I should Emit');
    io.sockets.on('connection', function (socket) {
      console.log('This Is What I Emit ' +JSON.stringify(data));
      socket.emit(channel, data);
      });
};        

  
