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


    router.get("/select", (req, response) => {
        let str="SELECT MEAN(temp) as temperature,MEAN(hum) as humidity " +
                            "FROM ambient " +
                            //"WHERE time > "+from+" and time <= "+ to + " "+
                            "GROUP BY time(60m)";

    influx.query(str).then(result => {
        response.json(result)
      }).catch(err => {
        response.status(500).send(err.stack)
      })
    });


module.exports = router;