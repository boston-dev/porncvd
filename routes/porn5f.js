var express = require('express');
var router = express.Router();
const porn5f = require('../db/porn5f-com');
const controller = require('../mongod/controller');
/* GET users listing. */
router.get('/search/videos/*',async (req, res, next) => {
  let  data= await  porn5f.getList(req.url)
  let arr=[]
  data.list.docs.forEach(v =>{
    arr.push(v.id)
  })
  await  controller.init('javsModel','find',{
    id:{$in:arr},
    site:'porn5f'
  }).then(all =>{
    if(all.code == 200){
      data.list.docs.forEach(v =>{
        all.result.forEach(item =>{
          if(v.id == item.id){
            v.img=item.img
          }
        })
      })
    }
  })
  data.docs=data.list && data.list.docs || []
  data.range= data.page
  res.locals.siteTag=res.locals.pornNav
  if(req.query.ajax){
    return  res.send( data);
  }
  res.render('boot',data);
});


module.exports = router;
