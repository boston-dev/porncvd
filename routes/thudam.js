var express = require('express');
var router = express.Router();
var thudam = require('../db/thudam');
/* GET users listing. */
router.get('/', function(req, res, next) {
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
router.get('/search', function(req, res, next) {
  if(!req.query.search_query){
    return  res.redirect('/english')
  }
  let pageNum = req.query.page || 0
  thudam.list('/'+decodeURIComponent(req.query.search_query.trim())).then(result =>{
    Object.assign(result,{
      pageNum
    })
    if(req.query.ajax){
      return  res.send(result)
    }
    res.render('thudam',result);
  })
});
router.get('/video|/xvideos/v/*', function(req, res, next) {
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
