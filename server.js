'use strict';

var express = require('express');
var multer = require('multer');
var parse = require('csv-parse');
var fs = require('fs');
var pg = require('pg').native;
//Constants
const PORT = 8080;

function addDb(name, email, callback){
    var conString = "postgres://upload:upload@db/upload";

    pg.connect(conString, function(err, client, done) {
        if(err) {
            done();
	    return console.error('error fetching client from pool', err);
        }
        var query = client.query("INSERT INTO fileuploads(name, email) values($1,$2) RETURNING name, email",[name, email]);
	query.on('row',function(row){
	    callback(row);
	});
	query.on('err',function(err){
	    done();
	    return console.error('error running Insert',err);	
	});
	query.on('end',function(){
            done();
	});
    });
}


function parseCsvFile(sourceFilePath, columns, onNewRecord, handleError, done){
    var source = fs.createReadStream(sourceFilePath);
    var linesRead = 0;
    var arr = [];
    var parser = parse({
	delimiter: ',',
	columns:columns
    });
    
    parser.on('readable',function(){
	var record;
        
	while(record=parser.read()){
	    linesRead++;
	    onNewRecord(record);
	    (function(id){
	        addDb(record.name,record.email,function(row){
		    //console.log(row);      
		  
		});
	    })(arr.push(record));
	}
    });

    parser.on('error',function(error){
	handleError(error);	
    });

    parser.on('end',function(){
	done(linesRead,arr);
	
    });

    source.pipe(parser);

}

function parseFile(req, res, next){
    var filePath = req.file.path;
    console.log(filePath);
    function onNewRecord(record){
    }
    function onError(error){
        console.log(error);
    }
    function done(linesRead,arr){
        res.json(arr);
    }
    var columns = true;
    parseCsvFile(filePath, columns, onNewRecord, onError, done);
}

//App
var app = express();

var storage = multer.diskStorage({
     destination: function(req, file, callback){
	callback(null,'./uploads/');
     },
     filename: function(req, file, callback){
	callback(null,file.fieldname + '-'+Date.now());
     }
});


var upload = multer({
storage:storage,
limits:{ fields: 2, fileSize: 2097152 },
fileFilter: function(req, file, callback){
    var fileType = ['csv'];
    if (fileType.indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1){
	return callback(new Error('Wrong extension type'));
    }
    callback(null,true);    
 }
}).single('userFile');

app.get('/', function (req, res){
     res.sendFile(__dirname + '/index.html');
});



app.post('/api/file', [upload, parseFile]);
	
     


app.listen(PORT, function(){
     console.log('Running http://localhost:'+PORT);
});
