var express = require('express');
var router = express.Router();
var thudam = require('../db/cliphunter');


/* GET users listing. */
router.get('/', function(req, res, next) {
  let pageNum = req.query.page || 0

  thudam.list().then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('indexMongo',result);
  })
});
router.get('/categories/:cat/:p?', function(req, res, next) {
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
router.get('/search*', function(req, res, next) {

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
router.get('/a/relmovies',async (req, res, next) => {

  thudam.getRate(req.url).then(video =>{
    res.render('include/videoTpl.html',{video});
   // return  res.send(result)
  })
});
router.get('/w/:id/:title?', function(req, res, next) {
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
