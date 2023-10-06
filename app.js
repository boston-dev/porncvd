const config = require('./mongod/config');
const configPC = require('./mongod/configPC');
const chineseConv = require('chinese-conv');
global.sity=(str) =>{
    if(!str){
        return ''
    }
    str= chineseConv.sify(str) 
    return str
}
global.porn=''
if(+process.env.PORT === 6421){
    global.porn= '_en'
}
global.HOST=process.env.HOST
global.paypal=config[`paypal${(process.env.NODE_ENV === 'development' ? 'Dev' : '')}`]
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const needle = require('needle');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const accepts = require('accepts');
var mangaRouter = require('./routes/manga');
var xnxxRouter = require('./routes/xnxx');
var thudamRouter = require('./routes/thudam');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var porn5fRouter = require('./routes/porn5f');
var koreanbjRouter = require('./routes/koreanbj');
var hsexRouter = require('./routes/hsex');
const paypalRouter = require('./routes/paypal');
var cc18Router = require('./routes/18cc');
var cliphunterRouter = require('./routes/cliphunter');
const categoryRouter = require('./routes/category');
const axios =require('axios')
const mjw = require('./routes/mjw');
const frends = require('./db/console');
const porn18 = require('./db/18cc');
const porn5filter=require('./db/tagAll')
const porn5filter_en=require('./db/tagAllTran_en.json')
const javNav = require('./db/towCat');
const cliphunterNav = require('./db/cliphunter.json');
const pornNav = require('./db/porn5filter');
var app = express();
const mongoose = require('mongoose');
var cors = require('cors')
const controller = require('./mongod/controller');
const siteNav = require('./mongod/siteNav');
const toy = require('./db/toy');
const porn5Nav=require('./util/util').default
const gNav = require('./nav.json');
//netstat -aon | find "6432"  taskkill /F /pid 15640
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎
app.set('view engine', 'html');
//设置一下对于html格式的文件，渲染的时候委托ejs的渲染方面来进行渲染
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const client_id='';
// brew services start mongodb/brew/mongodb-community
//https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
///bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
mongoose.connect('mongodb://localhost:27017/porn5f', {
    useNewUrlParser: true,
    useUnifiedTopology: true  }).then(res => console.log('porn5f'))
const allHost=['porncvd','localhost']
app.use( async (req,res,next) => {
    if(req.url.indexOf('.m3u8') > -1 && allHost.findIndex(v => v.indexOf(req.host)) > -1){
        let siteUrl=req.query.siteUrl,m3u8Url=siteUrl+req.url.replace(/\?.+/gi,'');
        porn18.getVideoM3u8(m3u8Url).then(responseGet =>{
            let send,response=responseGet
            if(response.toString().indexOf('.ts') > -1){
                send= response.toString().replace(/\.ts/gi,'.ts?siteUrl='+siteUrl)
            }else if(response.toString().indexOf('.m3u8') > -1){

                send=response.toString().replace(/\.m3u8/gi,'.m3u8?siteUrl='+siteUrl)
            }
            return res.send(send)
        })

        // needle.get(m3u8Url, function(error, response) {
        //     if (error && response.statusCode != 200){
        //         return res.send('error')
        //     }
        //     let send
        //     if(response.body.toString().indexOf('.ts') > -1){
        //         send= response.body.toString().replace(/\.ts/gi,'.ts?siteUrl='+siteUrl)
        //     }else if(response.body.toString().indexOf('.m3u8') > -1){
        //
        //         send=response.body.toString().replace(/\.m3u8/gi,'.m3u8?siteUrl='+siteUrl)
        //     }
        //     return res.send(send)
        // });
        return  false
    }
    if(req.url.indexOf('.ts') > -1 && allHost.findIndex(v => v.indexOf(req.host)) > -1){
        let siteUrl=req.query.siteUrl,m3u8Url=siteUrl+req.url.replace(/\?.+/gi,'');
        // needle.get(m3u8Url, function(error, response) {
        //     console.log(error)
        //     if (!error && response.statusCode == 200){
        //         res.send(response.body)
        //     }else{
        //         res.send('error')
        //     }
        //
        // });
        porn18.getVideoM3u8(m3u8Url).then(response =>{
            res.send(response)
        })

        return  false
    }
    if(req.url.indexOf('/cc18/') > -1){
        return  res.redirect('/')
    }
    let arr = accepts(req).languages()
    res.locals.gNav=gNav
    res.locals.ip= req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let off=false
    let result={}
    let disable=['zh-cn','ko-kr']
    // if(Array.isArray(arr) && arr.filter(v => disable.includes(v.toLowerCase())).length){
    //     if(req.url.indexOf('rememberme') > -1 || req.cookies.rememberme){
    //         res.cookie('rememberme', 1, { expires:  new Date(Date.now() + 100000000*100000),path: '/' , httpOnly: false});
    //     }else{
    //         return  res.send(500)
    //     }
    // }
    res.locals.porn5Nav=porn5Nav
    res.locals.curSite=''
    res.locals.siteNav=siteNav
    res.locals.siteTag=siteNav.exclusive
    res.locals.siteHost=siteNav.host
    res.locals.avday='avday'
    res.locals.porn5filter=porn5filter
    res.locals.porn5filter_en=porn5filter_en
    res.locals.navAll=javNav.nav
    res.locals.cliphunterNav=cliphunterNav
    res.locals.tplBase=''
    res.locals.tplcliphunter='/cliphunter'
    res.locals.thudam=''
    res.locals.tplLang=global.porn
    res.locals.HOST=global.HOST
    res.locals.navSize=global.porn ? 8 : 8
    res.locals.pornNav=pornNav
    res.locals.ordersList=config.ordersList
    res.locals.ordersListpC=configPC.ordersList
    res.locals.shopSiteid='siteid=268'
    res.locals.toy=toy
    
    // let deviceAgent = req.headers["user-agent"].toLowerCase();
 
    
    // if(!deviceAgent.match(/(iphone|ipod|ipad|android|symbianos|windows phone)/)){
    //     res.locals.ordersList=configPC.ordersList
    // }  
    res.locals.client_id=client_id
    res.locals.listVip=[]
    res.locals.orders_id=req.cookies.orders_id ||''
    if(!global.porn &&(req.url.indexOf('english')>-1 || req.url.indexOf('thudam')>-1 || req.url.indexOf('cliphunter')>-1)){
        res.redirect('/')
        return  false
    }
    console.log(res.locals.tplLang,12323)
    res.locals.meta={
        "title": "porncvd - 素人av/免費A片/流出/性愛自拍/素人/成人無碼/免費成人/台灣自拍",
        "keywords": "上萬免費在線A片，最新番號中文字幕、無碼流出、Hentai、色情動漫、JAV、國產自拍、做愛av、素人av、免費A片、流出、性愛自拍、素人、成人無碼、免費成人、台灣自拍，出處你懂的",
        "desc": "上萬免費在線A片，最新番號中文字幕、無碼流出、Hentai、色情動漫、JAV、國產自拍、做愛av、素人av、免費A片、流出、性愛自拍、素人、成人無碼、免費成人、台灣自拍，出處你懂的",
        "title_zh": "porncvd - 素人av/免费A片/流出/性爱自拍/素人/成人无码/免费成人/台湾自拍",
        "keywords_zh": "上万免费在线A片，最新番号中文字幕、无码流出、Hentai、色情动漫、JAV、国产自拍、做爱av、素人av、免费A片、流出、性爱自拍、素人、成人无码、免费成人、台湾自拍，出处你懂的",
        "desc_zh": "上万免费在线A片，最新番号中文字幕、无码流出、Hentai、色情动漫、JAV、国产自拍、做爱av、素人av、免费A片、流出、性爱自拍、素人、成人无码、免费成人、台湾自拍，出处你懂的",
        "title_en":'porncvd-Amateur AV/Free Porn/Outflow/Sex Selfie/Amateur/Uncensored Adult/Free Adult/Taiwan Selfie',
        "keywords_en": 'Tens of thousands of free online porn videos, the latest Chinese subtitles, uncensored streaming, Hentai, porn anime, JAV, domestic selfies, sex av, amateur av, free porn, streaming, sex selfies, amateur, adult uncensored, free adult, Taiwan Selfie, you know the source',
        "desc_en": 'Tens of thousands of free online porn videos, the latest Chinese subtitles, uncensored streaming, Hentai, porn anime, JAV, domestic selfies, sex av, amateur av, free porn, streaming, sex selfies, amateur, adult uncensored, free adult, Taiwan Selfie, you know the source',
    }
    if(+process.env.PORT === 6414){
        res.locals.meta={
            "title": "porncvd - 素人av/免费A片/流出/性爱自拍/素人/成人无码/免费成人/台湾自拍",
            "keywords": "上万免费在线A片，最新番号中文字幕、无码流出、Hentai、色情动漫、JAV、国产自拍、做爱av、素人av、免费A片、流出、性爱自拍、素人、成人无码、免费成人、台湾自拍，出处你懂的",
            "desc": "上万免费在线A片，最新番号中文字幕、无码流出、Hentai、色情动漫、JAV、国产自拍、做爱av、素人av、免费A片、流出、性爱自拍、素人、成人无码、免费成人、台湾自拍，出处你懂的",
        }
    }
    res.locals.page=[]
    res.locals.filter=[]
    res.locals.frends=frends
    next();
});
//cliphunterRouter koreanbjRouter cc18Router
app.use('/category', categoryRouter);
app.use('/cc18', cc18Router);
app.use('/hsex', hsexRouter);
app.use('/koreanbj', koreanbjRouter);
app.use('/xnxx', xnxxRouter);
app.use('/cliphunter', cliphunterRouter);
app.use('/porn5f', porn5fRouter);
app.use('/manga', mangaRouter);
app.use('/thudam', thudamRouter);
app.use('/', indexRouter);
app.use('/users',cors(), usersRouter);
app.use('/mjw', mjw);
app.use('/paypal', paypalRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(async  (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page

  if(process.env.NODE_ENV !== 'development'){
      let video={}
      controller.init('javsModel','aggregate',[
          { $sample: { size:50 } }
      ]).then(data =>{
          video.docs=data.result
          res.render('boot',{...video});
      })
      return false
  }
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
