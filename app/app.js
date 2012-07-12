
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
var hrdatacollection = db.collection('hrdatacollection');
var util = require('util');
var formidable = require('formidable');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var dateFormat = require('dateformat');

var app = require('http').createServer(function handler(request, response) {
 
    console.log('request starting...;' + request.url);
    
 switch(request.url) {
    case '/upload':
            var form = new formidable.IncomingForm(),
            files = [],
            fields = [];

            var tempdirectory = "/tmp/";

            // //tempdirectory changes if the operating system is windows
            if(process.platform == "windows")
            {
                tempdirectory = "c:\\temp\\";
            }
            form.uploaddir = tempdirectory;

            //tempDirectory = "c:\\Temp\\";
            //form.uploadDir = tempDirectory;

            form.on('error', function(err) {
                response.writeHead(200, {'content-type': 'text/plain'});
                response.end('error:\n\n'+util.inspect(err));
              });
            form.on('field', function(field, value) {
                console.log(field, value);
                fields.push([field, value]);
                });
            form.on('file', function(field, file) {
                console.log(field, file);
                files.push([field, file]);
                });
            form.on('end', function() {
                console.log('-> upload done');              
                response.writeHead(200, {'content-type': 'text/plain'});
                response.write('received fields:\n\n '+util.inspect(fields));
                response.write('\n\n');
                response.write('received files:\n\n '+util.inspect(files));
                });
                
            form.parse(request, function(err, fields, files) {
                    console.log('-> uploaded -' + files.upload.path);
                fs.readFile(files.upload.path, function(err, data) {
                parser.parseString(data, function (err, result) {
                response.write('received file contents:\n\n ');
		response.end(JSON.stringify(result));
                    console.log('Done');

		//hrdatacollectionJSON.stringify(result)
		var data = JSON.stringify(result)
		var buf1 = new Buffer(12);
		var dataid = JSON.parse(data).Activities.Activity.Id;
		var datadate = Date.parse(dataid);
                //console.log('TCX ID' + JSON.parse(data).Activities.Activity.Id);
		console.log('TCX ID ' + datadate);
		var document_id = new BSON.ObjectID(datadate);
                console.log('inserted BSONID ' + document_id);
                hrdatacollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
                if (err) throw err;
                });

                });
            });
            });
    break;
    default:
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
    };
}).listen(3000);

                  
var io = require('socket.io');
io = io.listen(app);
io.configure('development', function(){
io.set("transports", ["websocket"]);
});

io.sockets.on('connection', function(socket) {
    console.log('Client connected'); 
    
  socket.on('getactivites', function(data) {
        console.log('getactivites')    
        testcollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateactivities', result);
        });
    });
///////////////////////////////////////
  socket.on('getactivitybyid', function(id) {
        console.log('getactivitybyid')    
        testcollection.findById(id, function(err, result) {
            if (err) throw err;
            socket.emit('populateactivitybyid', result);
        });
    });
    

////////////////////////
    socket.on('addactivity', function(data, docid) {
        console.log('addactivity' + docid)    
        if (docid  === null) {
                 var document_id = new BSON.ObjectID();
         }
         else {
            var document_id = new BSON.ObjectID(docid);
          };
                //var document_id = new BSON.ObjectID(docid);
                console.log('inserted BSONID' + document_id);
                testcollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
                if (err) throw err;
                         exercisecollection.find().toArray(function(err, result) {
                         if (err) throw err;
                                socket.emit('populateexercises', result);
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
    socket.on('updateexercises', function(data, docid) {
        console.log('updateexecises' + JSON.stringify(data))
        if (docid  == 'undefined') {
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
                var document_id = new BSON.ObjectID(docid);
                exercisecollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
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
        socket.on('updateexpresso', function(data, docid) {
        
        if (docid  == 'undefined') {
        console.log('addedexpresso ' + JSON.stringify(data))
                console.log('edited updateexpresso' + JSON.stringify(data))
                expressocollection.insert(data, function(err, result) {
                if (err) throw err;
                        expressocollection.find().toArray(function(err, result) {
                        if (err) throw err;
                        socket.emit('populateexpresso', result);
                        }); 
                });
        }
        else {
        console.log('updateexpresso ' + JSON.stringify(data))
                var document_id = new BSON.ObjectID(docid);
                expressocollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
                if (err) throw err;
                         expressocollection.find().toArray(function(err, result) {
                         if (err) throw err;
                             console.log('populateexpresoo');
                                socket.emit('populateexpresso', result);
                         }); 
                });
                
        };
    });
////////////////
     socket.on('gethrdata', function(data) {
     console.log('emit hrdata')
        hrdatacollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populatehrdata', result);
        });
    });

    
////////////////    
});
    

  
