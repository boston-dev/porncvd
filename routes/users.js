var express = require('express');
const spankbang = require('../mongod/spankbang');
var router = express.Router();
const short = require('short-uuid');
const middle = require('../middle/index')
const fs = require('fs')
const path=require('path')
const { lang_login, lang_login_en, lang_reg, lang_reg_en } = require('../mongod/config.json')
const lang = { lang_login, lang_login_en, lang_reg, lang_reg_en }
const svgCaptcha = require("svg-captcha");
const { promises } = require('dns');
router.get('/captcha', function(req, res) {
    var captcha = svgCaptcha.create({
        size: 4, // 验证码长度
        width: 160,
        height: 60,
        fontSize: 50,
        ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#eee' // 验证码图片背景颜色
    });
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
});
router.get('/login.html',middle.checkNotLogin, function(req, res, next) {
	
    res.render('login', { data: Object.assign({ type: 'login' }, lang), ...req.query  });
});
router.post('/ajaxlogin.html',middle.checkNotLogin, async(req, res, next) =>{
	let { username, password, code } = req.body
	let errorMsg = '',redirectUrl='/user/login.html?errorMsg='
	code = code || ''
	const { ip, globalConfig, globalController,isDEV } = res.locals
    if (!req.session.captcha || code.toLowerCase() != req.session.captcha.toLowerCase()) {
        errorMsg = '验证码错误'
    }
	if (!(username && password)) {
        errorMsg = '用户名密码必填'
    }
	if (errorMsg) {
        return res.redirect(redirectUrl+ errorMsg)
    }
	
	let findUser= await globalController.init('usersModel','findOne',{username,password:middle.md5(password)})
	if(findUser.code !== 20000){
		errorMsg='没有此用户'
	}else{
		if (!findUser.data.show) {
			errorMsg='用户已被禁用'
		}
	}
	if (errorMsg) {
        return res.redirect(redirectUrl+ errorMsg)
    }
	let {_id,email,source,img,admin}=findUser.data
	req.session.user = {_id,username:findUser.data.username,email,source,ip:findUser.data.ip,img,admin}
	res.redirect(req.query.from || '/')
});
router.get('/reg.html',middle.checkNotLogin, function(req, res, next) {
    res.render('login', { data: Object.assign({ type: 'reg' }, lang, ), ...req.query });
});
router.post('/ajaxreg.html',middle.checkNotLogin, async(req, res, next) => {
	const { ip, globalConfig, globalController,isDEV } = res.locals
    let { username, password, code } = req.body
	let createUser={username, password}
    let errorMsg = '',redirectUrl='/user/reg.html?errorMsg='
    code = code || ''
    if (!req.session.captcha || code.toLowerCase() != req.session.captcha.toLowerCase()) {
        errorMsg = '验证码错误'
    }
    if (!(username && password)) {
        errorMsg = '用户名密码必填'
    }
    if (!(username.length > 4 && username.length <= 25)) {
        errorMsg = '用户名长度必须在4-25位之间'
    }
    if (errorMsg) {
        return res.redirect(redirectUrl+ errorMsg)
    }
	let checkUser= await globalController.init('usersModel','find',{username})
	if(checkUser.data.length){
		return res.redirect(redirectUrl+'用户名已存在')
	}
	if(!isDEV){
	  let checkData= await globalController.init('usersModel','find',{ip})
	  if(checkData.data.length >= 2){
		  return res.redirect(redirectUrl + '请勿频繁注册')
	  }
		createUser.ip=ip
	}
	console.log(createUser,middle.md5(password))
	createUser.password=middle.md5(password)
	console.log(createUser)
	let result=await globalController.init('usersModel','create',createUser)
	if(!result.code==20000){
		return res.redirect(redirectUrl + result.message)
	}
	let {_id,email,source,img,admin}=result.data
	req.session.user = {_id,username:result.data.username,email,source,ip:result.data.ip,img,admin}
	res.redirect(req.query.from || '/')
});
router.get('/logout',async (req,res) =>{
	req.session.user  = null;
	res.redirect('/')
  });
router.get('/',middle.checkNotLogin, function(req, res, next) {
    res.render('login', { data: Object.assign({ type: 'reg' }, lang) });
});
router.post('/login',middle.checkNotLogin, async(req, res, next) => {

    const { globalController, globalConfig } = res.locals
    let { responeTpl } = globalConfig
    const { username, password } = req.body
    let userData = { username, password }
    userData.password = middle.md5(userData.password);
    console.log(userData)
    let { data } = await globalController.init('usersModel', 'findOne', userData)
    console.log(data)
    if (data && data._id) {
        let { username, email, _id } = data
        let msgData = { username, email, _id }
        msgData.token = middle.setToken(msgData)
        return res.send({
            ...responeTpl,
            result: msgData
        })
    }
    res.send({
        ...responeTpl,
        code: 50014,
        message: '用户不存在'
    })

    res.send(Object.assign(responeTpl, { data: { token: '123456' } }))
});
router.post('/resource', async (req, res, next) => {
	const { globalController, globalConfig } = res.locals
	let obj=req.body
	if(!obj.url){
	 return  res.send('播放链接不存在')
	}
	let result=  await globalController.init('javsModel','findOne',{'id':obj.id,site:obj.site})
	console.log(result,'-------','resource')
    if(!result.result){
	  result= await globalController.init('javsModel','create',obj)
      console.log(result,'-------','!result.result')
	}else{
	  result= await globalController.init('javsModel','updateMany',{'id':obj.id},{$set:obj})
	}
   
	res.send(result)
  });
router.get('/zone-:id.html', function(req, res, next) {
	const { ip, globalConfig, globalController,isDEV } = res.locals
	let { id } = req.params
	globalController.init('articlesModel','paginate',{user:id},{
        page: req.query.page || 1,
        limit:52,
        sort: { date: -1 },
        prelink:`/user/zone-${id}.html?page=pageTpl`,
    }).then(result =>{

        if(req.query.ajax){
            return  res.send( result.data);
        }
		res.render('list',result.data);
    })
});  
router.post('/m3u8', async (req, res, next) => {
    if(!req.body.url){
        return res.send({code:400})
    }
    let filename=short.generate()
    let uploadPath =path.join(__dirname,`../public/${filename}/`) ;
   spankbang.init(req.body.url,filename,uploadPath)
   res.send(Object.assign({name:`/${filename}/index.m3u8`},{site:process.env.SITE}))
})
router.post('/m3u8-save', async (req, res, next) => {
    let {m3u8Url,img,uri,name}=req.body
    if(!(m3u8Url && img && uri)){
        return res.send({code:400})
    }
    const { ip, globalConfig, globalController,isDEV,gNav } = res.locals
	let result= await globalController
	.init(
		'articlesModel',
		'findOne',
		{uri},
	)
	if(result.code == 20000){
		return res.send(result)
	}
    let imgFix=img.match(/(.jpg|.png|.gif)/gi)
    if(!imgFix){
       return {code:'400',msg:'图片后缀获取失败'} 
    }
    imgFix=imgFix[0]
    let filename=name || short.generate()
    let uploadPath =path.join(__dirname,`../public/${filename}/`) ;
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
    await  spankbang.downTs([
        {
            name:`${uploadPath}/index.m3u8`,
            uri:m3u8Url,
        },
        {
            name:`${uploadPath}/index${imgFix}`,
            uri:img,
        },
    ])
    let site=process.env.SITE
    let data={
        uri,
        url:`${site}/${filename}/index.m3u8`,
        img:`${site}/${filename}/index${imgFix}`
    }
    let createRes=await globalController.init('articlesModel','create',data) 
   res.send({
    code:20000,
    data
   })
})
router.post('/spank-save', async (req, res, next) => {
    let {m3u8Url,img,uri,name}=req.body
    if(!(m3u8Url && img && uri)){
        return res.send({code:400})
    }
    const { ip, globalConfig, globalController,isDEV,gNav } = res.locals
	let result= await globalController
	.init(
		'articlesModel',
		'findOne',
		{uri},
	)
	if(result.code == 20000){
		return res.send(result)
	}
    let imgFix=img.match(/(.jpg|.png|.gif)/gi)
    if(!imgFix){
       return {code:'400',msg:'图片后缀获取失败'} 
    }
    imgFix=imgFix[0]
    let filename=name || short.generate()
    let uploadPath =path.join(__dirname,`../public/${filename}/`) ;
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
    await  spankbang.downTs([
        {
            name:`${uploadPath}/index.m3u8`,
            uri:m3u8Url,
        },
        {
            name:`${uploadPath}/index${imgFix}`,
            uri:img,
        },
    ])
    let site=process.env.SITE
    let data={
        uri,
        url:`${site}/${filename}/index.m3u8`,
        img:`${site}/${filename}/index${imgFix}`
    }
    spankbang.m3u8Array(m3u8Url).then(result =>{
        console.log(result)
    })
    let createRes=await globalController.init('articlesModel','create',data) 
   res.send({
    code:20000,
    data
   })
})
router.post('/m3u8-img-save', async (req, res, next) => {
    let {m3u8Url,img,name}=req.body
    if(!(m3u8Url && img)){
        return res.send({code:400})
    }
    let imgFix=img.match(/(.jpeg|.jpg|.png|.gif|.webp)/gi)
    if(!imgFix){
       return {code:'400',msg:'图片后缀获取失败'} 
    }
    imgFix=imgFix[0]
    let filename=name || short.generate()
    let uploadPath =path.join(__dirname,`../public/${filename}/`) ;
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    }
    await  spankbang.downTs([
        {
            name:`${uploadPath}/index.m3u8`,
            uri:m3u8Url,
        },
        {
            name:`${uploadPath}/index${imgFix}`,
            uri:img,
        },
    ])
    let site=process.env.SITE
    let data={
        url:`${site}/${filename}/index.m3u8`,
        img:`${site}/${filename}/index${imgFix}`
    }
   res.send({
    code:20000,
    data
   })
})
router.post('/img-save', async (req, res, next) => {
    let {img,name,m3u8Url}=req.body
    if(!(img && name)){
        return res.send({code:400})
    }
    let imgFix=img.match(/(.jpg|.png|.gif|.webp)/gi)
    if(!imgFix){
       return {code:'400',msg:'图片后缀获取失败'} 
    }
    imgFix=imgFix[0]
    let uploadPath =path.join(__dirname,`../public/`) ;
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
    await  spankbang.downTs([
        {
            name:`${uploadPath}/${name}`,
            type:'img',
            uri:img,
        },
        {
            name:`${uploadPath}/${name}`,
            type:'url',
            uri:m3u8Url,
        },
    ])
    let site=process.env.SITE
    let data={
        img:`${site}/${name}`
    }
   res.send({
    code:20000,
    data
   })
})
router.get('/datas', async (req, res, next) => {
    let result=await spankbang.apiData()
    res.send(result)
})
module.exports = router;
