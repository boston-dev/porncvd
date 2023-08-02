var express = require('express');
var router = express.Router();
var comic = require('../db/comic');
/* GET users listing. */
router.get('/g/:id', function(req, res, next) {
  comic.detail(req.url).then(result =>{
    //res.send(result)
    res.render('bootstrap/detail.html',result);
  })
});
router.get('/page/:p?', function(req, res, next) {
  comic.list(req.url).then(result =>{
    res.render('bootstrap/index.html',result);
  })
});
router.get('/xvideos/v/*', function(req, res, next) {
  let pageNum = req.query.page || 0
  thudam.detail(req.url).then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('thudam',result);
  })
});
router.get('/xvideos*', function(req, res, next) {
  let pageNum = req.query.page || 0
  thudam.list(req.url).then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
     return  res.send(result)
    }
    res.render('thudam',result);
  })
});

module.exports = router;
