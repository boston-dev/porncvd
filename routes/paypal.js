//https://developer.paypal.com/docs/checkout/reference/server-integration/get-transaction/
const express = require('express');
const router = express.Router();
const http = require('../db/http')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('pay-server')
});
router.get('/create-payment', async  function (req, res, next) {
   let data= await http.vaidOrder()
    res.send(data)
   // res.send(details)
});
router.post('/execute-payment', function (req, res, next) {
    res.render('pay-server')
});
module.exports = router;
