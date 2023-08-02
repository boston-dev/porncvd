const express = require('express');
const router = express.Router();
const mjw = require('../db/91mjw');

import util from '../util/util'



router.post('/', async (req, res, next)  =>{
   let data =[],resData=[],area=[],areaen=[],signName=[],signNameen=[],pageHtml={},lang=req.query.lang,limit=48,page=req.body.p || 1,id=req.body.id;
   let {jsonTpl}=util;
   let result=await mjw.index() 
   console.log(result)
    return res.send({
        ...jsonTpl,
        result:{
            ...result,
            pageHtml
        }
    })

});
router.post('/detail', async (req, res, next)  =>{
    let index = {},id=req.body.id,{jsonTpl}=util;
    index = await mjw.kuhuivideo(id)
    return res.send({
        ...jsonTpl,
        result:{
            ...index
        }
    })
});
router.get('/vshow', async (req, res, next) => {
    let data =req.query
    let site=parseInt(req.query.site)
    let url=`http://www.kuhuiv.com${data.url}`
    let video= await moviesKuhui.getM3U8(url)
    data={...data,...video}
    res.send(data);
})
router.post('/index', async (req, res, next) => {
    let {jsonTpl}=util,page=req.body.p || 1,
    cat=req.body.id,
    data={},
    pageHtml={},
    lang=req.query.lang,limit=48;
    let result= await moviesKuhui.getIndex()
    if(result){
        data=result
    }
    res.send({
        ...jsonTpl,
        result:{
            ...data,
            pageHtml
        }
    })
});
router.post('/movies', async (req, res, next) => {
    let {jsonTpl}=util,page=req.body.p || 1,
    cat=req.body.id,
    data={},
    pageHtml={},
    lang=req.query.lang,limit=48;
    
    let options = {
        limit,
        page,
        sort: { date: -1 },
    };
    let query  = {signName:'',signNameen:'',area:'',areaen:''},pagecat='';
    for(let a in req.body){
        if(typeof query[`${a}`] != 'undefined'){
            query[`${a}`]=req.body[`${a}`]
        }
    }
    for(let keys in query){
        if(query[`${keys}`] == ''){
            delete query[`${keys}`]
        }else{
            pagecat+=query[`${keys}`]
        }
    }
    data =await moviesModel.paginate(query, options)
    console.log(pagecat) 
    pageHtml =pagination({prelink:`/list/${pagecat}-pageStr`,current:page,totalDocs:data.totalDocs,limit})
     
    res.send({
        ...jsonTpl,
        result:{
            ...data,
            pageHtml
        }
    })
});
router.post('/sitemap', async (req, res, next) => {
  let result= await moviesModel.find({}).limit(6000).sort({date:-1})
  console.log(result)
  res.send(result)
});
router.get('/kusearch', async (req, res, next) => {
    let keyword = req.query.keyword
    let data = await moviesKuhui.kuhuivSuggest(keyword)
    res.send(data)
})
router.post('/trant', async (req, res, next) => {
    let data = await moviesKuhui.update(req.body)
    res.send(data)
})
module.exports = router;
