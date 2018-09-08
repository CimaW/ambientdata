var WebSocketServer = require('ws').Server;
var dateFormat = require('dateformat');
var wsPort = process.env.WSPORT || 8888;
webSocketServer = new WebSocketServer({port: wsPort});
const uuidv4 = require('uuid/v4');

console.log('web socket Listening on: %s', wsPort);

webSocketServer.response={};

webSocketServer.on('connection', function (ws) {
  ws.on('close', function (message) {
      var obj = JSON.parse(message);
      if(webSocketServer.esp==ws){
        webSocketServer.esp=null;
      }
  });

  ws.on('message', function (message) {
    try{
        var obj = JSON.parse(message);
        if(obj.id==null){
          ws.send('{"error":"I need a id"}');
          return;
        }
        //{"id":"ESP_867A15","temp":24,"hum":66}
        if(obj.id=="ESP_867A15"){
          webSocketServer.esp=ws;
          if(obj.temp!=null){
            webSocketServer.response.temp=obj.temp;
          }
          if(obj.hum!=null){
            webSocketServer.response.hum=obj.hum;
          }

          let result="OK";
          let timestamp=dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
          webSocketServer.response.timestamp=timestamp;
          ws.send('{"result":'+result+',"timestamp:"'+timestamp+'""}');

          webSocketServer.clients.forEach(

          client=>{
            if(ws!=client && (obj.for==null || obj.for==client.id)){
              sendData(client);
            }
          }
        );
        }else{
          if(webSocketServer.esp==null){
            ws.send('{"error":"sorry sensor not found"}')
          }else{
            webSocketServer.esp.send('{"update":"'+ws.id+'"}');
          }
        }
    }catch(error) {
      console.log(error);
      ws.send('{"error":"I speak only json"}');
    }
  })
  ws.id=uuidv4();
  sendData(ws);
});

function sendData(ws){
  ws.send('{"id":"'+ws.id+'","data":'+JSON.stringify(webSocketServer.response)+'}');

}


module.exports = webSocketServer;
