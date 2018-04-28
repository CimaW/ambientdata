var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');

router.get("/insert", (req, response) => {
    var resp={};
    resp.result="OK";
    resp.timestamp=dateFormat(new Date(), "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'")
    response.status( 200 ).json(resp);

});

module.exports = router;