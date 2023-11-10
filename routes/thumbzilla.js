const express = require('express');
const router = express.Router();
const fs = require('fs')
const spankbang = require('../mongod/spankbang');
const path=require('path');
const e = require('express');
/* GET home page. */
router.post('/m3u8', async (req, res, next) => {
  const {file,img,m3u8,uri}=req.body
  const { ip, globalConfig, globalController,isDEV,gNav } = res.locals
	let result= await globalController
	.init(
		'articlesModel',
		'findOne',
		{uri},
	)
	if(result.code == 20000){
		return res.send({
      ...result,
      code:600,
      message:'已存在',
    })
	}
  let uploadPath =path.join(__dirname,`../upload/${file}/`) ;
  const url=`/${file}/index.m3u8`
  let imgFix=img.match(/(.jpg|.png|.gif|.jpeg|.webp)/gi)
    if(!imgFix){
       return res.send({code:'400',msg:'图片后缀获取失败'})
    }
    imgFix=imgFix[0]
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
  const m3u8Name='R5sZ5WbDH0o7K'
  fs.writeFile(`${uploadPath}/${m3u8Name}.m3u8`, m3u8,  function(err) {
      if (err) {
          return console.error(err);
      }
    console.log("数据写入成功！");
  });
  await  spankbang.downTs([
      {
          name:`${uploadPath}/index${imgFix}`,
          uri:img,
      },
  ])
  let createRes=await globalController.init('articlesModel','create',{
    ...req.body,
    url:`/${file}/${m3u8Name}.m3u8`,
    img:`/${file}/index${imgFix}`,
  }) 
   res.send(createRes)
});
router.post('/checkData', async (req, res, next) => {
  let {uri}=req.body
  const { globalController} = res.locals
  let result= await globalController
	.init(
		'articlesModel',
		'findOne',
		{uri},
	)
	if(result.code == 20000){
		return res.send({
      ...result,
      code:600,
      message:'已存在',
    })
	}
  res.send({code:200})
})
router.post('/createData', async (req, res, next) => {
  const { globalController} = res.locals
  let createRes=await globalController.init('articlesModel','create',{
    ...req.body,
  }) 
  res.send(createRes)
})
router.post('/savem3u8', async (req, res, next) => {
  let {file,img,m3u8,uri,videoUrl}=req.body
  const { ip, globalConfig, globalController,isDEV,gNav } = res.locals
	let result= await globalController
	.init(
		'articlesModel',
		'findOne',
		{uri},
	)
	if(result.code == 20000){
		return res.send({
      ...result,
      code:600,
      message:'已存在',
    })
	}
  let uploadPath =path.join(__dirname,`../upload/${file}/`) ;
  const m3u8Name='R5sZ5WbDH0o7K'
  if(!videoUrl){
    fs.writeFile(`${uploadPath}/${m3u8Name}.m3u8`, m3u8,  function(err) {
        if (err) {
            return console.error(err);
        }
      console.log("数据写入成功！");
    });
  }
  videoUrl=videoUrl || `/${file}/${m3u8Name}.m3u8`
  let createRes=await globalController.init('articlesModel','create',{
    ...req.body,
    url:videoUrl,
  }) 
   res.send(createRes)
});
router.post('/downTs', async (req, res, next) => {
  const {file,name}=req.body
  let uploadPath =path.join(__dirname,`../upload/${file}/`) ;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
  const fileNme=(name ||req.files.ts.name)
  console.log(req.files.ts)
 fs.writeFile(`${uploadPath}${fileNme}` ,req.files.ts.data,  function(err) {
  res.send(`/${file}/${fileNme}`) 
  if (err) {
        return console.error(err);
    }
    console.log("数据写入成功！");
  
  });
 
});
router.post('/muchts', async (req, res, next) => {
  const {data,file}=req.body
  const uploadPath =path.join(__dirname,`../upload/${file}/`) ;
 const fixData= data.map(v => {
   return {
      ...v,
      name:uploadPath+v.name,
    }
  });
  spankbang.downTs(fixData).then(result=>{
    res.send({code:200})
  })
});
router.post('/secondts', async (req, res, next) => {
  const {data,file}=req.body
  const uploadPath =path.join(__dirname,`../upload/${file}/`) ;
 const fixData= data.map(v => {
   return {
      ...v,
      name:uploadPath+v.name,
    }
  });
  spankbang.downTs(fixData).then(result=>{
    res.send({code:200})
  })
});

router.post('/downMp4', async (req, res, next) => {
    const {url,file,name}=req.body
    const uploadPath =path.join(__dirname,`../upload/${file}/`) ;
    const saveFilePath =path.join(__dirname,`../upload/${file}/${name}`) ;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    spankbang.downloadmP4({url,saveFilePath}).then(()=>{
      spankbang.m3u8Client({url,uploadPath,saveFilePath}).then(result=>{
        res.send(result)
      })
    })
})
module.exports = router;
