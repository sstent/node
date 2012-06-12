
/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var db = require('mongoskin').db('localhost:27017/test'); 
var testcollection = db.collection('testcollection');
var exercisecollection = db.collection('exercisecollection');
var expressocollection = db.collection('expressocollection');
var hrdatacollection = db.collection('expressocollection');

var app = require('http').createServer(function handler(request, response) {
 
    console.log('request starting...;' + request.url);
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
}).listen(3000);

                  
var io = require('socket.io');
io = io.listen(app);
io.configure('development', function(){
io.set("transports", ["websocket"]);
});

io.sockets.on('connection', function(socket) {
    console.log('Client connected'); 
    
//    socket.on('getactivites', function(data) {
//        console.log('getactivites')    
//        testcollection.find().toArray(function(err, result) {
//            if (err) throw err;
 //           socket.emit('populateactivities', result);
 //       });
//    });

  socket.on('getactivites', function(data) {
        console.log('getactivitesoooo')    
        testcollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateactivities', result);
        });
    });


////////////////////////
    socket.on('addactivity', function(data) {
        console.log('addactivity' + JSON.stringify(data))    
        testcollection.insert(data, function(err, result) {
            if (err) throw err;
            testcollection.find().toArray(function(err, result) {
                if (err) throw err;
                socket.emit('populateactivities', result);
            }); 
        });
    });
/////////////////////    
        socket.on('delactivity', function(id) {
            testcollection.removeById(id,function(err, reply){
                if (err) throw err;
                testcollection.find().toArray(function(err, result) {
                    if (err) throw err;
                    socket.emit('populateactivities', result);
            }); 
        });
    });
 ///////////////////
     socket.on('getexercises', function(data) {
     console.log('emit exercises')
        exercisecollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateexercises', result);
        });
    });
    socket.on('updateexercises', function(data) {
        console.log('updateexecises' + JSON.stringify(data))
        if (data[0]._id  == 'undefined') {
                delete data[0]._id
                console.log('edited updateexecises' + JSON.stringify(data))
                exercisecollection.insert(data, function(err, result) {
                if (err) throw err;
                        exercisecollection.find().toArray(function(err, result) {
                        if (err) throw err;
                        socket.emit('populateexercises', result);
                        }); 
                });
        }
        else {
                var document_id = new BSON.ObjectID(data[0]._id);
                delete data[0]._id;
                exercisecollection.update({_id:document_id}, data[0],{upsert:true} , function(err, result) {
                if (err) throw err;
                         exercisecollection.find().toArray(function(err, result) {
                         if (err) throw err;
                             console.log('populateexercises');
                                socket.emit('populateexercises', result);
                         }); 
                });
                
        };
    });
////////////////
     socket.on('getexpresso', function(data) {
     console.log('emit expresso')
        expressocollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateexpresso', result);
        });
    });
////////////////
    
////////////////    
});
    

  
