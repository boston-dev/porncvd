var express = require('express');
var router = express.Router();
var jable = require('../db/jable');
/* GET users listing. */
router.get('/list-*.htm', function(req, res, next) {
  jable.list(req.url).then(result =>{
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('indexMongo',result);
  });
});
router.get('/video-[0-9]+.htm', function(req, res, next) {
  jable.detail(req.url).then(result =>{
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('detailMongo',result);
  });
});

module.exports = router;
