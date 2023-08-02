#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('mjw:server');
var http = require('http');
const controller = require('../mongod/controller');
const towCat = require('../db/towCat');
// for (const [idx, obj] of towCat.nav.entries()) {
//   controller.init('catsModel','updateMany',{'href':obj.href},{$set:obj},{upsert:true}).then(res =>{
//     console.log(res)
//   })
//
// }
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '6432');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
console.log(`http://localhost:${process.env.PORT}/`)
const io = require('socket.io')(server);
let clients = {}
const  send= (data) =>{
  for (var s in clients) {
    clients[s].send(data)
  }
}
io.on('connection', function(socket) {

  clients[socket.id] = socket
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    delete clients[socket.id]
  });
  //controller.init('newsModel','remove',{})
  socket.on('message', async (msg) => {

    if(Object.prototype.toString.call(msg) == '[object Object]' && msg.av){
      for (const [idx, obj] of msg.av.entries()) {
        let result=  await controller.init('javsModel','findOne',{'id':obj.id})
        if(!result.result){
          result= await controller.init('javsModel','create',obj)
        }else{
          result= await controller.init('javsModel','updateMany',{'id':obj.id},{$set:obj})
        }
        send(result)
      }
    }
    if(Object.prototype.toString.call(msg) == '[object Object]' && msg.data){
      let data= await controller.init('catsModel','findOne',{href:msg.data.cat})
      if(data.result && data.result._id){
        msg.data.cat=data.result._id
          controller.init('javsModel','updateMany',{$and:[
              {'id':msg.data.id},
              {site:{$ne:'porn5f'}}
            ]},{$set:msg.data},{upsert:true}).then(res =>{

            })
      }
    }
    if(Object.prototype.toString.call(msg) == '[object Object]' && msg.tran){
      for (const [idx, item] of msg.tran.entries()) {
        let {title_en,keywords_en,desc_en}=item
        if(title_en && keywords_en && desc_en){
          controller.init('javsModel','updateMany',{_id:item._id},{$set:{title_en,keywords_en,desc_en,tran:1}},{upsert:false}).then(res =>{

          })
        }

      }

    }
    if(!Array.isArray(msg)) return  false
    let pic=await controller.muchImg(msg)
    msg.forEach(v =>{
      v.uri=v.href
      pic.forEach(list =>{
        if(list.indexOf(v.id) > -1){
          v.img=list
        }
      })
    })

    for (const [idx, item] of msg.entries()) {
      let data= await controller.init('catsModel','findOne',{href:item.cat})

      if(data.result && data.result._id){
        item.cat=data.result._id
        await  controller.init('javsModel','updateMany',{$and:[
            {'id':item.id},
            {site:{$eq:'porn5f'}}
          ]},{$set:item},{upsert:true}).then(res =>{

        })
        await controller.delay(0.5)
      }


    }

  })

});
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
