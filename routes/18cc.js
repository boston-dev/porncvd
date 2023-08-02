var express = require('express');
var router = express.Router();
var jable = require('../db/18cc');
/* GET users listing. */
router.get('/videos/', function(req, res, next) {
  jable.list(req.url).then(result =>{
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('indexMongo',result);
  });
});
router.get('/video/*', async (req, res, next) => {
  jable.detail(req.url).then(result =>{
    if(req.query.ajax){
      return res.send(result)
    }
    res.render('detailMongo',result);
  })

});
module.exports = router;
