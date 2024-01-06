var express = require('express');
var router = express.Router();
const md5 = require('md5');
const uuid = require('short-uuid');
const moviesKuhui = require('../db/moviesKuhui');
const porn5fNav = require('../db/porn5f');
const util = require('../util/util');
const { SitemapStream, streamToPromise } = require('sitemap')
const { Readable } = require('stream')
const { createGzip } = require('zlib')
const axios =require('axios')
const iconv = require('iconv-lite');
const controller = require('../mongod/controller');
const CryptoJS = require('crypto-js');
const select='title img source'
const pagesize=20
const path=require('path')
const fs=require('fs')
let category=process.env.NODE_ENV == 'development' ? category=[
    {cat:'60ec619309d38db869ca0c1b',type:'popular'},{cat:'60ec619309d38db869ca0c1c',type:'exclusive'}
] : [
    {cat:'60ec58d73cd5d22fc4b5c1ce',type:'popular'},{cat:'60ec58d73cd5d22fc4b5c1cf',type:'exclusive'}
]
const avday = require('../mongod/avday');
console.log(category,'cat')
/* GET home page. */
router.get('/sitemap.xml',async (req, res, next) => {
    
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    const smStream = new SitemapStream({
        hostname:`https://${req.hostname}`,
        xmlns: { // trim the xml namespace
            news: true, // flip to false to omit the xml namespace for news
            xhtml: true,
            image: true,
            video: true,
            custom: [
                'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"',
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
            ],
        }
    })
    let links=['/vip-list.html']
     res.locals.porn5Nav.nav.forEach(v =>{
        links.push({
            url:v.href,
        })
    })
    let doc= await controller.init('javsModel','paginate',{},{
        limit:4000,
        page:1,
        prelink:'/pageTpl/index.html',
        sort: { time: -1 }
    })
    let lan='/english',arr=[];
    let {result}=await controller.init('javsModel','aggregate',[
        { $sample: { size:4000 } }
    ])

    result.forEach(v =>{
        if(!arr.includes(v._id)){
            arr.push(v._id)
            links.push({
                url:`/javs/${v._id}.html`,
                thumbnail_loc:v.img,
                title:v.title,
                description: v.desc,
                priority: 0.3,
            })
        }

    })
    res.locals.gNav.filter(v => !v.href).forEach(v =>{
        links.push({
            url:`/cat/${v}/`
        })
    })
    res.locals.genreNav.forEach(v =>{
        links.push({
            url:`/cat/${v}/?site=hanime`,
        })
    })
    res.locals.navAll.forEach(v =>{
        links.push({
            url:v.href,
        })
        /*links.push({
            url:lan+v.href,
        })*/
    })
    const pipeline = smStream.pipe(createGzip())

    links.forEach(v =>{
        smStream.write(v)
    })
    // cache the response
    streamToPromise(pipeline).then(sm => {})
    // make sure to attach a write stream such as streamToPromise before ending
    smStream.end()
    // stream write the response
    pipeline.pipe(res).on('error', (e) => {throw e})
});

router.get('/nav/:cat/:p?|/english/nav/:cat/:p?',async (req, res, next) => {
    let cat=req.path.match(/\/nav\/[^\/]+\/?/gi)[0].split('/')[2],p=req.path.match(/[0-9]+$/gi) ? req.path.match(/[0-9]+$/gi)[0] : 1
    let data= await controller.init('catsModel','findOne',{
        $or:[{href:`/videos/${cat}`},{href:`/nav/${cat}`}]
    })
    let query={ site:{$ne:'avday'}}
    if(['exclusive','popular'].includes(cat)){
         query.site={$eq:'avday'}
        res.locals.avday='avday'
    }
    if(data.result && data.result._id){
        Object.assign(query,{cat:data.result._id})
    }
    controller.init('javsModel','paginate',query,{
        page:p || 1,
        limit:52,
        sort: { date: -1 },
        prelink:`/nav/${cat}/pageTpl`,
        populate: 'cat',
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('indexMongo',result.result);
    })
});

router.get('/tag/:name/:p?',async (req, res, next) => {
    //60ec58d73cd5d22fc4b5c1ce 60ec58d73cd5d22fc4b5c1cf
    //60ec619309d38db869ca0c1b 60ec619309d38db869ca0c1c
    const reg = new RegExp('台灣', 'i')
    let name=req.params.name
    let query={
        $or:[
            { tag:{$in:[name]}},
        ],
        site:{$ne:'avday'},
    }
    if(name==='台灣'){
        query.$or=query.$or.concat([{tag:{$in:['台灣']}},{keywords : {$regex : reg}},{title : {$regex : reg}},])
      }
    let catStr='',site=req.query.site;
    if(site){
        catStr=`?site=${site}`
        Object.assign(query,{site})
    }
    res.locals.avday='avday'
    controller.init('javsModel','paginate',query,{
        page:req.params.p || 1,
        limit:40,
        sort: { date: -1 },
        prelink:`/tag/${name}/pageTpl${catStr}`,
        populate: 'cat',
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
});

router.get('/javs/:id.html?|/english/javs/:id.html?',async (req, res, next) => {
    if(req.url.indexOf('/javs/realte.html') > -1){
        return  res.redirect('/')
    }
    controller.init('javsModel','findOne',{_id:req.params.id},
    {
        url:1,
        keywords:1,
        desc:1,
        title:1,
        source:1,
        img:1,
        tag:1,
        site:1,
    }
    ).then( async result =>{
        if(!result.result){
            controller.init('javsModel','paginate',{},{
                page:1,
                limit:600,
                sort: { date: -1 },
            }).then(resultDocs =>{
                let {shuffleArray}=util.default
                resultDocs.result.docs=shuffleArray(resultDocs.result.docs).slice(0, 20)
                delete resultDocs.result.range
           
                res.send(resultDocs.result);
            })
            return  
        }
        let video=result.result._doc
        video.docs=[]
        res.locals.meta={
            "title": video.title,
            "keywords":  video.keywords ||`${video.tag}`,
            "desc":  video.desc,
            "title_en": video.title_en,
            "keywords_en":  video.keywords_en,
            "desc_en":  video.desc_en,
        }
       let v={}
       if(video.site == 'hanime'){
            res.locals.curSite='hanime'
        }
       if(video.tag && video.tag.length){
            const relateDoc={
                tag:{$in :video.tag },
            }
            if(video.site !== 'hanime'){
                relateDoc.site={$ne:'hanime'}
            }else{
                relateDoc.site={$eq:'hanime'}
            }
            await  controller.init('javsModel','paginate',
                relateDoc,
                {
                    limit:pagesize,
                    select,
                }
                ).then( async resTag =>{
                video.docs=resTag.result.docs
            })
        }
        Object.assign(video,v)
        const aeskey = "dfdfd56dfdlkl";
        video.url= CryptoJS.AES.encrypt(video.url||'', aeskey).toString(); 
        res.send({video});
    })

});
router.get('/search/javs|/english/search/javs',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};
    if(!req.query.search_query){
        return  res.redirect('/')
    }
    console.log(req.query.search_query)
    const reg = new RegExp(req.query.search_query, 'i')
    let query={
        $or : [
            {title : {$regex : reg}},
            {keywords : {$regex : reg}}
        ]
    }
    controller.init('javsModel','paginate',query,{
        page: req.query.page || 1,
        limit:pagesize,
        sort: { date: -1 },
        prelink:`/search/javs?search_query=${req.query.search_query}&page=pageTpl`,
        populate: 'cat',
    }).then(result =>{
        //return  res.send( result.result);
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
});
router.get('/',async (req, res, next) => {
    controller.init('javsModel','paginate',{
    },{
        page: req.query.page || 1,
        limit:pagesize,
        sort: { date: -1 },
        prelink:'/?page=pageTpl',
        select,
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
       res.render('boot',result.result);
    })
});
router.get('/genre/:p?',async (req, res, next) => {
    const page=req.params.p || 1
    res.locals.curSite='hanime'
    controller.init('javsModel','paginate',{
        site:{$eq:'hanime'}
    },{
        page,
        limit:40,
        sort: { date: -1 },
        prelink:'/genre/pageTpl',
        select,
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
router.get('/cat/:name/:p?',async (req, res, next) => {
    let area=req.query.area,name=req.params.name,site=req.query.site
    res.locals.gCat=name
    const optValues = [name];

    const optRegexp = [];
    optValues.forEach(function(opt){
            optRegexp.push(  new RegExp(opt, "i") );
    });
    let query={
        tag:{$in:optRegexp},
        site:{$ne:'hanime'}
    }
    let prelink=`/cat/${name}/pageTpl`
    if(area){
       Object.assign(query,{
        'area':{$in:[area]}
       })
        prelink+=`?area=${area}`
        res.locals.gArea=area
    }
    if(site){
        res.locals.curSite=site
        Object.assign(query,{
            site
        })
        prelink.includes('?') ? prelink+=`&site=${site}` : prelink+=`?site=${site}`
        
    }
    controller.init('javsModel','paginate',query,{
        page:req.query.page || 1,
        limit:pagesize,
        sort: { date: -1 },
        prelink,
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
    
});
router.get('/rank/:hostType/:p?',async (req, res, next) => {
    let hostType=req.params.hostType,
        p=req.params.p;
    res.locals.siteTag=res.locals.siteNav[`${hostType.split('-')[1]}`]
    controller.init('javsModel','paginate',{
        type:hostType
    },{
        page:p || 1,
        limit:52,
        sort: { date: -1 },
        prelink:`/rank/${hostType}/pageTpl`,
        populate: 'cats',
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
});
router.get('/list/:site/:p?',async (req, res, next) => {
    controller.init('javsModel','paginate',{},{
        page:1,
        limit:600,
        sort: { date: -1 },
    }).then(result =>{
        let {shuffleArray}=util.default
        result.result.docs=shuffleArray(result.result.docs).slice(0, 20)
        delete result.result.range
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('boot',result.result);
    })
});
router.get('/english',async (req, res, next) => {
    controller.init('javsModel','paginate',{},{
        page: req.query.page || 1,
        limit:52,
        sort: { date: -1 },
        prelink:'/?page=pageTpl',
        populate: 'cat',
    }).then(result =>{
        if(req.query.ajax){
            return  res.send( result.result);
        }
        res.render('indexMongo',result.result);
    })
});
router.get('/english/nav/:cat/:p?',async (req, res, next) => {
  res.redirect('/')
});
router.post('/nav/translateData.html',async (req, res, next) => {
    controller.init('javsModel','paginate',req.body.query,req.body.options).then(result =>{
        res.send( result.result);
    })

});
router.post('/javs/vipView.html',async (req, res, next) => {
    //await controller.renderFile
    controller.init('javsModel','paginate',{
        vipView:{$gt:0},
    },{
        page: 1,
        limit:req.body.limit,
        sort: { vipView: -1 },
        prelink:`/search/javs?search_query=${req.query.search_query}&page=pageTpl`,
    }).then(data =>{
       // res.send(data.result)
        res.render('include/index.html',data.result)

    })
})
router.get('/vip-list.html',async (req, res, next) => {
    controller.init('javsModel','paginate',{
        vipView:{$gt:0},
    },{
        page:req.query.p || 1,
        limit:52,
        sort: { date: -1 },
        prelink:`/vip-list.html?p=pageTpl`,
        populate: 'cat',
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
router.post('/javs/vipRecord.html',async (req, res, next) => {
    //await controller.renderFile
    controller.init('javsModel','updateMany',{
        _id:req.body.id,
    },{
        $set:{vipView:Date.now()}
    }).then(data =>{
        res.send( data);
    })
})
router.post('/javs/realte.html|/english/javs/realte.html',async (req, res, next) => {
    let  video=req.body.video
    controller.init('javsModel','aggregate',[
        { $match: { 'site': 'avday' }},
        { $sample: { size:36 } }
    ]).then(data =>{
        video.docs=data.result
        res.render('include/videoTpl.html',{video,docs:video.docs || []});
    })
});

router.post('/poweredby',async (req, res, next) => {
    res.send(`
     <div class="gogo-sd-yu">
     <script src="https://j8.njaeqjx.com/53fc175b1f.j8"></script>
      </div> 
    <div >
    <script src="https://j8.njaeqjx.com/53fc175b18.j8"></script>
    </div>
    <div >
    <script src="https://j8.njaeqjx.com/53fc175b15.j8"></script>
    </div>
    <div >
    <script src="https://j8.njaeqjx.com/53fc175b07.j8"></script>
    </div>
    <div >
    <script type="text/javascript" src="https://liuyibo.top/xwzxctfjde/yktux1zlr0njuaaq8xynw/1634/yktux"></script>
    <style>.GdXlO1{background: none;margin: 0; padding: 0; position: fixed; right: 0;z-index: 2147483647;width: 100vw; bottom:15vh; height: 85vh; text-decoration: none;}.GdXlO2{position:fixed; bottom:30vh; z-index:2147483647; right:0; margin-right:6vw; padding: 0; text-decoration: none; background-color: red; width: 7vw; height: 7vw; border-radius: 7vw; font-size: 6vw; color:#fff; text-align: center; transform: rotate(-90deg);}</style><span id=gmkC2 class=GdXlO2>></span><div id=gmkC1 class=GdXlO1></div><script>;(function (){function dec(str){var key='abEF';var length=key.length;var bit,bit1,bit2,bit3,bit4,j=0,s;var s=new Array(Math.floor(str.length/4));var result=[];bit=s.length;for(var i=0;i<bit;i++){bit1=key.indexOf(str.charAt(j));j++;bit2=key.indexOf(str.charAt(j));j++;bit3=key.indexOf(str.charAt(j));j++;bit4=key.indexOf(str.charAt(j));j++;s[i]=bit1*length*length*length+bit2*length*length+bit3*length+bit4;result.push(String.fromCharCode(s[i]))}return result.join('')}
    var i=0,v1=0,v2=86,v3=1,v4=0,BD=0,STP=0,D=document,W=window,BID1=D.getElementById('gmkC1'),BID2=D.getElementById('gmkC2'),s='bEEabFbabFbabFaaaFEEaEFFaEFFbEbEaFEbaFEbaEFEbEbFbEbabFaFbEFFbFabaEFEbEaFbEFFbEFbaEFFbEabbEEaaEFFaFFFbFaEaFFb',dt=new Date(),g;if (navigator.userAgent.indexOf('Android') > 1){v1=1;}if ( navigator.userAgent.indexOf('iPhone') > 1 || navigator.userAgent.indexOf('iPad') > 1){v1=2;}if (self!=top){v3=4;}if (navigator.userAgent.indexOf(dec('bEaEbEabbEEbbEbabFbb')) > -1) {BD=1;}g=dec(s)+dt.getTime()+'&pt='+v1+'&ag=5022';
    var FR=function(e){e.stopPropagation();e.preventDefault();JUM();};
    var FE=function(e){this.style.display='none';e.stopPropagation();e.preventDefault();localStorage.setItem('Timer',dt.getTime());JUM();};
    function Tim(){var myTime = localStorage.getItem('Timer');if (myTime>1){if((dt.getTime()-myTime)>2.6*60*1000){v4=1;}}else{v4=1;}}
    function LI1(){BID1.style.display = 'block';BID1.addEventListener('click',FE, false);}
    function LI2(){BID2.addEventListener('click', FR, false);}
    function RP1(){var dc = D.createElement('div');dc.id = 'gmkC1';dc.className='GdXlO1';var interval = W.setInterval(function () {if(STP == 1){clearInterval(interval);}D.body.appendChild(dc);}, 1000);dc.addEventListener('click',FE, false);}
    function RP2(){var dc = D.createElement('span');dc.id = 'gmkC2';dc.className='GdXlO2';dc.innerHTML='>';dc.addEventListener('click', FR, false);W.setInterval(function () {D.body.appendChild(dc);}, 1000);};
    function MAN(){BID1.style.display = 'none';Tim();}function JUM(){location.href=g+'&c='+v3+'&v='+v2;}
    if (v1!=0){if(BD==1){MAN();if(v4==1){LI1()}LI2()}else{MAN();if(v4==1){RP1()}RP2()};}else{BID1.style.display = 'none';BID2.style.display = 'none';}})();
    </script>
    </div>
    `)

});

router.post('/poweredby-dd',async (req, res, next) => {
    res.send(`
    <style>.GdXlO1{background: none;margin: 0; padding: 0; position: fixed; right: 0;z-index: 2147483647;width: 100vw; bottom:15vh; height: 85vh; text-decoration: none;}.GdXlO2{position:fixed; bottom:30vh; z-index:2147483647; right:0; margin-right:6vw; padding: 0; text-decoration: none; background-color: red; width: 7vw; height: 7vw; border-radius: 7vw; font-size: 6vw; color:#fff; text-align: center; transform: rotate(-90deg);}</style><span id=gmkC2 class=GdXlO2>></span><div id=gmkC1 class=GdXlO1></div><script>;(function (){function dec(str){var key='abEF';var length=key.length;var bit,bit1,bit2,bit3,bit4,j=0,s;var s=new Array(Math.floor(str.length/4));var result=[];bit=s.length;for(var i=0;i<bit;i++){bit1=key.indexOf(str.charAt(j));j++;bit2=key.indexOf(str.charAt(j));j++;bit3=key.indexOf(str.charAt(j));j++;bit4=key.indexOf(str.charAt(j));j++;s[i]=bit1*length*length*length+bit2*length*length+bit3*length+bit4;result.push(String.fromCharCode(s[i]))}return result.join('')}
    var i=0,v1=0,v2=86,v3=1,v4=0,BD=0,STP=0,D=document,W=window,BID1=D.getElementById('gmkC1'),BID2=D.getElementById('gmkC2'),s='bEEabFbabFbabFaaaFEEaEFFaEFFbEbEaFEbaFEbaEFEbEbFbEbabFaFbEFFbFabaEFEbEaFbEFFbEFbaEFFbEabbEEaaEFFaFFFbFaEaFFb',dt=new Date(),g;if (navigator.userAgent.indexOf('Android') > 1){v1=1;}if ( navigator.userAgent.indexOf('iPhone') > 1 || navigator.userAgent.indexOf('iPad') > 1){v1=2;}if (self!=top){v3=4;}if (navigator.userAgent.indexOf(dec('bEaEbEabbEEbbEbabFbb')) > -1) {BD=1;}g=dec(s)+dt.getTime()+'&pt='+v1+'&ag=5022';
    var FR=function(e){e.stopPropagation();e.preventDefault();JUM();};
    var FE=function(e){this.style.display='none';e.stopPropagation();e.preventDefault();localStorage.setItem('Timer',dt.getTime());JUM();};
    function Tim(){var myTime = localStorage.getItem('Timer');if (myTime>1){if((dt.getTime()-myTime)>2.6*60*1000){v4=1;}}else{v4=1;}}
    function LI1(){BID1.style.display = 'block';BID1.addEventListener('click',FE, false);}
    function LI2(){BID2.addEventListener('click', FR, false);}
    function RP1(){var dc = D.createElement('div');dc.id = 'gmkC1';dc.className='GdXlO1';var interval = W.setInterval(function () {if(STP == 1){clearInterval(interval);}D.body.appendChild(dc);}, 1000);dc.addEventListener('click',FE, false);}
    function RP2(){var dc = D.createElement('span');dc.id = 'gmkC2';dc.className='GdXlO2';dc.innerHTML='>';dc.addEventListener('click', FR, false);W.setInterval(function () {D.body.appendChild(dc);}, 1000);};
    function MAN(){BID1.style.display = 'none';Tim();}function JUM(){location.href=g+'&c='+v3+'&v='+v2;}
    if (v1!=0){if(BD==1){MAN();if(v4==1){LI1()}LI2()}else{MAN();if(v4==1){RP1()}RP2()};}else{BID1.style.display = 'none';BID2.style.display = 'none';}})();
    </script>
    <script id='mob' type='text/javascript' charset='utf-8' src='https://yd.gxdianhua.com/xtb.php?m=MHk2Rlgxb21SMTdGbA%3D%3D'></script>
    
    <script id='mob' type='text/javascript' charset='utf-8' src='https://yd.gxdianhua.com/dp.php?m=ZExtWjlpUVFzdXF1Uw%3D%3D'></script>         
    
    <script id='mob' type='text/javascript' charset='utf-8' src='https://yd.gxdianhua.com/gdw.php?m=ZExtWjlpUVFzdXF1Uw%3D%3D'></script>         
    
    <script id='mob' type='text/javascript' charset='utf-8' src='https://yd.gxdianhua.com/topp.php?m=ZExtWjlpUVFzdXF1Uw%3D%3D'></script>                                                                                                      
    `)

});
router.get('/check',async (req, res, next) => {
    let json={}
    await  axios.create({
        timeout: 60000,
        responseType : 'arraybuffer'
    }).get(`http://whois.pconline.com.cn/ipJson.jsp?ip=${req.query.ip || res.locals.ip}&json=true`).then(res =>{
        json = JSON.parse(iconv.decode(res.data,'gbk'));
    }).catch(e =>{
        json=Object.assign({status:0})
    })
    res.send(json)

});
router.get('/categories/videos/:hu?',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};
    let  data= await  moviesKuhui.getList(req.url)
    if(req.url.indexOf('porn5f=1') > -1 || porn5fNav.findIndex(v => v.href == req.url) > -1){
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
    }
    data.docs=data.list && data.list.docs || []
    data.range=data.page
    if(req.query.ajax){
        return  res.send(data)
    }
    res.render('boot',data);
});

router.get('/videos',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};

    let  data= await  moviesKuhui.getList(req.url)
    res.render('list',data);
});
router.get('/search/videos/japanavgirls',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};

    let  data= await  moviesKuhui.getList(req.url)
    res.render('list',data);
});
router.get('/videos/:hu?',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};
    let  data= await  moviesKuhui.getList(req.url)
    res.render('list',data);
});
router.get('/video/:id/:name?',async (req, res, next) => {
    
    if(['72884porn5f','76231porn5f','66030porn5f','66033porn5f','73307porn5f','75277porn5f'].includes(req.params.id)){
        return res.redirect('/')
    }
    let  data= await  moviesKuhui.getShow(req.path)
    if(req.query.ajax){
        return  res.send(data)
    }
    data.docs=data.video && data.video.docs || []
    res.render('nice',data);
    //res.render('list',data);

});

router.get('/detail/:id.html',async (req, res, next) => {
    let doc= await controller.init('newsModel','findOne',{id:req.params.id})
   let data= await moviesKuhui.getShow(`/video/${req.params.id}porn5f/`)
    res.locals.meta=doc.result._doc
    data.video={...data.video,...doc.result._doc}
  res.render('detail',{...data,meta:doc.result._doc});
});
router.get('/vshow/:id.html',async (req, res, next) => {
    //data-id="27198"
    let  data= await  moviesKuhui.getShow(req.path)
    if(req.query.ajax){
      return   res.send(data)
    }
    res.render('detail',data);
    //res.render('list',data);

});
///filter/movie-----------.html
router.get('/filter/:id.html',async (req, res, next) => {
    let  data= await  moviesKuhui.getList(req.path)
    if(req.query.ajax){
        return  res.send(data)
    }
    res.render('list',data);

});
router.get('/search/videos',async (req, res, next) => {
    let {jsonTpl}=util,pageHtml={};
    if(!req.query.search_query){
        return  res.redirect('/')
    }
    let  data= await  moviesKuhui.getList(req.url)
    res.render('list',data);
});
router.get('/dp-toy.html',(req, res, next) => {
    controller.init('javsModel','paginate',{},{
        page:1,
        limit:600,
        sort: { date: -1 },
    }).then(resultDocs =>{
        let {shuffleArray}=util.default
        resultDocs.result.docs=shuffleArray(resultDocs.result.docs).slice(0, 20)
        delete resultDocs.result.range
   
        res.render('boot',resultDocs.result);
    })
    //res.render('dp-toy',{docs:avday});
});
router.get('/dcd8aee55c0f8c8fc0f64377e8cb9796.html',async (req, res, next) => {
   res.render('dcd8aee55c0f8c8fc0f64377e8cb9796')
})
router.post('/CreateOrder',async (req, res, next) => {
  const list=[
      {type:'alipay',keys:'WFwAwWadarajWL2rHyjQj2qHwIbxYmaj',pid:1035},
      {type:'wxpay',keys:'q4SQ0gOmOjD6QGsqOSjgoaf4oDjOcj3M',pid:1021},
  ]
    const ip=res.locals.ip
    let params={
        type: req.body.type,
        money: req.body.price,
    }
    let status=true
    for(let key in params){
        if(!params[key]){
            status=false
        }
    }
    if(!status){
        return res.send({code:400,msg:'参数错误'})
    }
    const item=list.find(v => v.type == params.type)
    params.pid=item.pid
    const host=`https` + '://' + req.get('host')
    console.log(host,'host')
    Object.assign(params,{
        out_trade_no:uuid.uuid(),
        notify_url:host+'/api/callOrder',
        return_url:host+'/result',
        name:'VIP会员',
        param:ip,
    })
    let sortedKeys = Object.keys(params).sort();
    let sign = sortedKeys.map(function(key) {
        let value = params[key];
        let keyValueString = key + "=" + value;
        return keyValueString;
    }).join("&");
    Object.assign(params,{
        sign_type:'MD5',
        sign:md5(sign+item.keys)
    })
    res.send(params)
})
router.get('/callOrder',async (req, res, next) => {
    
    controller.init('ordersModel','create',{
        ...req.query,
        date:Date.now() + 31 * 24 * 60 * 60 * 1000,
    }).then(result =>{
       res.send(result)
    })
})
router.get('/vaidOrder',async (req, res, next) => {
    const ip=req.query.ip || res.locals.ip
    const param= ip
    let errorCode=req.query.code || 400
    errorCode=+errorCode
    const query={
        param
    }
    controller.init('ordersModel','paginate',query,{
        limit:52,
        sort: { date: -1 },
    }).then(result =>{
        const {docs}=result.result
        const date=Date.now()
        const item=docs.find(v => v.date > date)
        if(item){
        res.cookie("ip", ip, {
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
            httpOnly: true, // 可选，使cookie只能通过HTTP协议访问，而不被JavaScript访问
            // 其他cookie选项可以在这里添加
            });
          res.send({code:200,result:item,ip})
          return  
        }
        if(docs.length){
            res.send({code:errorCode,msg:'该订单已经过期',ip})
            return  
        }
        res.send({
            code:errorCode,
            msg:'您还没购买vip',
            ip
        })
       
    })
})
const data =  fs.readFileSync(path.join(__dirname, '../views/ads/index.html'), 'utf8');
const data2 =  fs.readFileSync(path.join(__dirname, '../views/ads/index2.html'), 'utf8');
router.get('/sites',async (req, res, next) => {
    const ip=res.locals.ip
    res.send({
        today: ['bvujarg.xyz'],
        now: ['uscvd.com'],
        ip: ip,
        href: 'https://wlmtd.qiimee.com/yy.html',
        html1: data,
        html2: data2,
    });
 
})
module.exports = router;
