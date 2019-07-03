var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');
const uuidv4 = require('uuid/v4');
const { Pool, Client } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
ssl: true
})

    router.post("/insert", (req, response) => {
        let temp = req.body.temp;
        let hum = req.body.hum;

	const update_query='update ambient_data set "temp"="temp"+$1, hum=hum+$2,measure_count=measure_count+1 where measure_date =date_trunc(\'hour\', now())';
	const now_query='select temp,hum,measure_count from ambient_data where measure_date =date_trunc(\'hour\', now())';
        const insert_query = 'INSERT INTO ambient_data("temp", hum, measure_count) VALUES($1, $2, $3) RETURNING *';
	pool.query(now_query, (err, res) => {
		if(res!=null && res.rowCount==0){
			const values = [temp, hum,1];
			pool.query(insert_query, values, (err, res) => {
			  if (err) {
			    console.log(err.stack)
			  }
			});
		}else{
			const values = [temp, hum];
			pool.query(update_query, values, (err, res) => {
			  if (err) {
			    console.log(err.stack)
			  }
			});
		}
	});

        var resp={};
        resp.result="OK";
        resp.timestamp=dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
        response.status( 200 ).json(resp);

    });


    router.get("/now", (req, response) => {
        response.status( 200 ).json(webSocketServer.response);
    });


    router.get("/alexa", (req, response) => {
        response.header("Content-Type", "application/json");
        response.status( 200 ).send(
             '{'
              +'"uid": "urn:uuid:'+uuidv4()+'",''
              +'"updateDate": "'+dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")+'",''
              +'"titleText": "Temperatura e Unidità in camera",''
              +'"mainText": "La temperatura è di '+webSocketServer.response.temp+'gradi mentre la percentuale di umidità è di '+webSocketServer.response.hum+' percento",''
              +'"redirectionUrl": "https://developer.amazon.com/public/community/blog"''
            +'}'
        );
    });

    router.get("/select/:from/:to", (req, response) => {
        let from=req.params.from;
        let to=req.params.to;
        let str="select measure_date as time, temp/measure_count as temperature,hum/measure_count as humidity"+
		" from ambient_data"+
		" where measure_date >=timezone('GMT',date_trunc('hour',to_timestamp($1,'YYYY-MM-DD\"T\"HH24:MI:SS.MS')))"+
		" and measure_date <=timezone('GMT',date_trunc('hour',to_timestamp($2,'YYYY-MM-DD\"T\"HH24:MI:SS.MS'))) ORDER BY measure_date ASC";
	const values = [from, to];
	pool.query(str, values,(err, res) => {
		if (err) {
			    console.log(err.stack)
			  }
		if(res!=null && res.rowCount>0){
			response.json(res.rows);
		}else{
			response.json("{}")
		}
	});
    });


module.exports = router;
