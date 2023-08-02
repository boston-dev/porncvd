var express = require('express');
var router = express.Router();
const controller = require('../mongod/controller');
router.get('/:id/:p?',async (req, res, next) => {
  const id=req.params.id;
    const doc=res.locals.porn5Nav.nav.find(v => v.href === `/category/${id}`) || res.locals.porn5Nav.nav[0];
    const reg = new RegExp('台灣', 'i')
    let p=req.params.p,
       query={
        $or:[
            {path:{$in:doc.path}},
        ]
    };
    if(id==='taiwan'){
      query.$or=query.$or.concat([{tag:{$in:['台灣']}},{keywords : {$regex : reg}},{title : {$regex : reg}},])
    }
    controller.init('javsModel','paginate',query,{
        page:p || 1,
        limit:52,
        sort: { date: -1 },
        prelink:`/category/${id}/pageTpl`,
    }).then(result =>{
        if(+process.env.PORT === 6414){
            result.result=JSON.parse(JSON.stringify(result.result))
           Array.isArray(result.result.docs) && result.result.docs.forEach(v =>{
                v.title=global.sity(v.title)
                v.keywords=global.sity(v.keywords)
                v.desc=global.sity(v.desc)
            })
        }
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
});
module.exports = router;
