/**
 * a logger for dialog conversations
 */
//declare module pg {};

import * as crypto from 'crypto';
import * as pg from 'pg';
import * as debug from 'debug';
import * as process from 'process';


var THETABLE = process.argv[2];
console.log(THETABLE);
//process.exit(-1);

var HSHLENGTH = 32;

const debuglog = debug('dbinsert');

export interface IRec {
  hsh : string,
  pth : string,
  content : string,
  sec : number
}



function variableHash(size, data) {
	//Generate 256-bit hash of data
	var hash = crypto.createHash("sha256");
  //console.log('here data' + data);
	hash.update(data, 'utf-8' as any);
  var hsh = hash.digest("base64" as any);
  //console.log("now hsh" + hsh + " size " + size);
  return hsh.substring(0,size);
}


const columns = ["pth","hsh", "sec"];
// 0 indicates do not process /truncate, e.g. non string type
const columnLengths = [10, 40, 1024, 1024, 512, 20, 40, 0,0 ];

var abc = "ABCDEFHIJKLMNOPQRSTUVWXYabcdefghijlkmnopqrstuv";

function makeRandom(len : number) {
  var targetlen = Math.random() * (len - 10) + 10;
  var s = "";
  for(var i = 0; i < targetlen; i++) {
    var x = Math.floor(Math.random() * abc.length);
    s += abc.charAt(x);
  }
  return s;
}
//const crypto = require('crypto');

export function makeData(nr : number, sec : number, res : IRec[]) {
  var seen = {};
  var sec = sec + 1000; // Math.floor(12342342*Math.random());
  for(var k = 0; k < nr; ++k) {
    var path = ( res[k] && res[k].pth ) || (makeRandom(100) + k);
        var content = ( res[k] && res[k].content ) || (makeRandom(1800) + k);
    var hash = variableHash(30, path + "_" + sec);
    if(seen[hash] || seen[path]) {
      console.log('duplicate hash or path' + hash);
      process.exit(-1);
    }
    seen[hash] = 1;
    seen[path] = 1;
    res[k] = {
      sec : sec,
      content : content,
      pth : path,
      hsh : hash
    };
  }
  return res;
}

var BLOCKSIZE = 400;

var res = makeData(BLOCKSIZE,1, []);


console.log(JSON.stringify(res,undefined,2));

var dburl = process.env.DATABASE_URL || "";

var pglocalurl = "postgres://joe:abcdef@localhost:5432/ddd";
var dburl = process.env.DATABASE_URL || pglocalurl;
var o = pg as any;


var pgp = require('pg-promise')({
    // Initialization Options
});

var total = {};
var glob = {};

// Concatenates an array of objects or arrays of values, according to the template,
// to use with insert queries. Can be used either as a class type or as a function.
//
// template = formatting template string
// data = array of either objects or arrays of values
function Inserts(template, data): void {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function () {
        return data.map(d=>'(' + pgp.as.format(template, d) + ')').join(',');
    };
}


var db = pgp(pglocalurl);

export function insertMult(table: string, recs : IRec[] ) {
  "use strict";
  var columns = ['pth', 'sec', 'hsh', 'content'];
  var values = new Inserts('${pth}, ${sec}, ${hsh},${content} ', recs); // using Inserts as a type;
  var t = Date.now();
  //console.log('values ' + values.formatDBType());
  return db.none('INSERT INTO ' + table + '(pth,sec,hsh,content) VALUES $1', values)
    .then(data=> {
      var t2 = Date.now() - t;
      glob[table] = t2;
      //console.log(` ${table} ` + t2 );
        // OK, all records have been inserted
    })
    .catch(error=> {
      console.log('here erorr ' + error);
        // Error, no records inserted
    });
};

export function insertOne(recs : IRec[],  callback : (err: any, res?: any) => void ) {
  "use strict";
  callback = callback || (function() {});
  var columns = ['pth', 'sec', 'hsh'];



  pg.connect(pglocalurl, (err, client : pg.Client, pgDone) => {
      if (err) {
        // failed to acquire connection
        //logger.emit('error', err);
        debuglog('Error connecting to db' + err);
        callback(err);
      } else {
        var query =`INSERT INTO psh (` + columns.join(",") + ") " +
        //   (convid, sessionid, user, message, response, meta) ` +
        "VALUES ( "  +
        // $1, $2, ...
         columns.map(function(o,iIndex) { return "$" + (iIndex+1); }).join(", ") + ")";

        var values = columns.map(function(sCol) {
             return recs[0][sCol];
           });
              var values2 = columns.map(function(sCol) {
             return recs[1][sCol];
           });
           console.log(values, undefined, 2);
           //  [level, msg, meta instanceof Array ? JSON.stringify(meta) : meta],
        client.query(query,values,

                     (err, result) => {
            pgDone();
            if (err) {
             // logger.emit('error', err);
             debuglog('Error inserting record into db ' + err + '\n' +
                values.join("\n"));
              callback(err);
            } else {
            //  logger.emit('logged');
              callback(null, true);
            }
        });
      }
    });
}

var p = (Promise as any).resolve(1);
var t0 = Date.now();

function addP(p: any, i : number) {
  return p.then( a => insertMult(THETABLE, res)).then(
  a => {
     Object.keys(glob).map(key =>
     total[key] = (total[key] || 0) + glob[key];
     if( i % 500 === 0) {
      console.log("now i " + i* BLOCKSIZE + " " + Object.keys(glob).map(key => `${key}: ${glob[key]} `).join(" ")
      + Object.keys(total).map(key => `${key}: ${total[key]}  ${total[key]/(i+1)} `).join(" ")
      + " " + (Date.now()-t0) + " "  + (Date.now()-t0) / (i+1)
      );
    }
    res = makeData(500, i + 5,res);
  }
);

}

for(var i = 0; i < 20000; ++i) {
 p = addP(p,i);
}

