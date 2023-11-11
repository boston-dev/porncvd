const config = require('./mongod/config');
const configPC = require('./mongod/configPC');
var thumbzillaRouter = require('./routes/thumbzilla');
const chineseConv = require('chinese-conv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
global.sity=(str) =>{
    // if(!str){
    //     return ''
    // }
    // str= chineseConv.sify(str) 
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
const genreNav = require('./mongod/genreNav.json');
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
app.use(fileUpload());
const whitelist = ['18porn.cc','porncvd.com', 'avdcd.com', 'porn7f.com','uscvd.com','dsdsd.xyz','localhost','avday.tv']
const hostFix=['www','lily','api','jp','uk','ch','dome','av']
app.use(function (req, res, next) {
    const origin = req.headers.origin
    if (origin && whitelist.findIndex(v => origin.includes(v)) < 0) {
        res.status(403).end();
        return
    }
    const allowedOrigins =[]
    whitelist.forEach(v => {
        hostFix.forEach(h => {
            allowedOrigins.push(`http://${h}.${v}`)
            allowedOrigins.push(`https://${h}.${v}`)
        })
    })
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Expose-Headers', 'def');
    if (req.method == 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'content-type, abc');
      res.setHeader('Access-Control-Max-Age', '-1');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin' + ', ' + req.headers['access-control-request-headers']);
      res.status(200).end();
    } else {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('def', '123');
      next();
    }
  }); 
 app.use(async (req, res, next) => {
    if(req.path.endsWith('.txt')){
        const uploadPath =path.join(__dirname,`./upload/${req.path}`) ;
        fs.readFile(uploadPath, (err, data) => {
            if (err) {
            console.error('Error:', err);
            res.status(500).send('Error reading file');
            } else {
                const buff = Buffer.from(data, 'base64');
                // decode buffer as UTF-8
                const str = buff.toString('utf-8');
                res.send(str);
            }
        });
        return
    }
    next()
})   
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
mongoose.connect('mongodb://localhost:27017/zhLand', {
    useNewUrlParser: true,
    useUnifiedTopology: true  }).then(res => console.log('zhLand'))
app.use(async (req, res, next) => {
    Object.assign(res.locals, { globalController: controller, globalConfig: config })
    next()
})
app.use('/', indexRouter);
app.use('/users',cors(), usersRouter);
app.use('/thumbzilla',thumbzillaRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(async  (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
