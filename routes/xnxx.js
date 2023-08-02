var express = require('express');
var router = express.Router();
var thudam = require('../db/xnxx');
const controller = require('../mongod/controller');

/* GET users listing. */
router.get('/*', function(req, res, next) {
  let video={}
  controller.init('javsModel','aggregate',[
    { $sample: { size:50 } }
  ]).then(data =>{
    video.docs=data.result
    res.render('indexMongo.html',{...video});
  })
});
router.get('/todays-selection|search*', function(req, res, next) {

  let pageNum = req.params.p || 0

  thudam.list(req.url).then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('indexMongo',result);
  })
});
router.get('/video-*', function(req, res, next) {
  let pageNum = req.query.page || 0
  thudam.detail(req.url).then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('detailMongo',result);
  })
});
module.exports = router;
