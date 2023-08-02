var express = require('express');
var router = express.Router();
const jable= require('../db/koreanbj');
/* GET users listing. */
router.get('/:name/', function(req, res, next) {
  jable.detail(req.url).then(result =>{
    if(req.query.ajax){
      return res.send(result)
    }
    res.render('bj',result);
  })
});

module.exports = router;
