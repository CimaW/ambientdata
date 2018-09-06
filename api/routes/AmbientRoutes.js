var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');
const Influx = require('influx')
const influx = new Influx.InfluxDB({
  host: 'influxdb-svc.ambientdata.svc',
  database: 'cam42DB',
  schema: [
    {
      measurement: 'ambient',
      fields: {
        temp: Influx.FieldType.INTEGER,
        hum: Influx.FieldType.INTEGER
      },
      tags: [
        'host'
      ]
    }
  ]
})

    router.post("/insert", (req, response) => {
        let temp = req.body.temp;
        let hum = req.body.hum;
        console.log(`Write to ${temp} ${hum}`);

        influx.writePoints([{
            measurement: 'ambient',
            fields: { temp:temp, hum:hum }
            }
        ]).catch(err => {
          console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })


        var resp={};
        resp.result="OK";
        resp.timestamp=dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
        response.status( 200 ).json(resp);

    });


    router.get("/now", (req, response) => {
      webSocketServer.ws.send('getInfo',function(){
        let temp = webSocketServer.temp;
        let hum = webSocketServer.hum;
        console.log(`Write to ${temp} ${hum}`);
        var resp={};
        resp.temp=temp;
        resp.hum=hum;
        resp.timestamp=dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
        response.status( 200 ).json(resp);
      });
    });


    router.get("/select/:from/:to", (req, response) => {
        let from=req.params.from;
        let to=req.params.to;
        if(from.indexOf("now")<0){
          from="'"+from+"'";
        }
        if(to.indexOf("now")<0){
          to="'"+to+"'";
        }
        let str="SELECT MEAN(temp) as temperature,MEAN(hum) as humidity " +
                            "FROM ambient " +
                            "WHERE time > "+from+" and time <= "+ to + " "+
                            "GROUP BY time(60m)";

    influx.query(str).then(result => {
        response.json(result)
      }).catch(err => {
        response.status(500).send(err.stack)
      })
    });


module.exports = router;
