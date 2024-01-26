const m3u = require('m3u8-reader')
const fs = require('fs');
const Crawler = require("crawler");
const pacote = () =>{}
//console.log(m3u(fs.readFileSync('master.m3u8', 'utf8')))
const sleep = (m) => new Promise((resolve) => setTimeout(resolve, m))
const short = require('short-uuid');
const path=require('path')
const pup = new Crawler({
    maxConnections : 30000,
    retries:2,
    timeout:2000,
    retryTimeout:4000,
});
const m3u8down={
    async apiData(uri=`https://bet-xx.com/static/game.json?t=${new Date().getTime()}`){
        return new Promise((resolve) =>{
             pup.queue([{
                 uri,
                 encoding:null,
                 jQuery:false,// set false to suppress warning message.
                 callback:function(err, res, done){
                     if(err){
                         console.error(err.stack);
                     }else{
                         resolve(res.body)
                     }
                     done();
                 }
             }]);
         })
     },
    async m3u8Array(uri){
        return new Promise((resolve) =>{
             pup.queue([{
                 uri,
                 encoding:null,
                 jQuery:false,// set false to suppress warning message.
                 callback:function(err, res, done){
                     if(err){
                         console.error(err.stack);
                     }else{
                         resolve(m3u(res.body.toString()).filter(v => typeof v == 'string'))
                     }
                     done();
                 }
             }]);
         })
     },
   async getM3u8(uri){
       return new Promise((resolve) =>{
            pup.queue([{
                uri,
                encoding:null,
                jQuery:false,// set false to suppress warning message.
                callback:function(err, res, done){
                    if(err){
                        console.error(err.stack);
                    }else{
                        resolve(res.body.toString())
                    }
                    done();
                }
            }]);
        })
    },
    write(file,cont){
        return new Promise((resolve) =>{
            fs.writeFile(file, cont, (err) => {
                if (err) {
                    resolve({
                        code:500,
                        err
                    })
                    return
                }
                resolve({
                    code:200,
                    file
                })
            })
            
        })  
    },
   async init(uri,filename,uploadPath){
       let m1 = await this.getM3u8(uri)
       let m3u8_1=m3u(m1).find(v => typeof v == 'string')
       let m2 = await this.getM3u8(m3u8_1)
       
       if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      let m3u8_2=m3u(m2).map(v => {
        if(typeof v == 'string'){
            let name=v.match(/hls_.+\.ts/gi,'')
            let org=name[0]
            return {
                uri:v,
                name:uploadPath+name[0],
                org
            }
        }
        return false
      })
      m3u8_2=m3u8_2.filter(v=> v)
      //await
     this.downTs(m3u8_2)
    m3u8_2.forEach(v => {
        let regExp =new RegExp('https.+'+v.org+'.+,[0-9]+', 'gi')
        m2=m2.replace(regExp,v.org)
    });
    let writeRes= await this.write(`${uploadPath}index.m3u8`,m2)
    return {
        name:`/${filename}/index.m3u8`,
        code:200,
    }
   },
   downTs(linkArr){
    const obj={}
    var c = new Crawler({
        encoding:null,
        jQuery:false,// set false to suppress warning message.
        retries:3,
        rateLimit: 1,
        maxConnections: 1,
        //maxConnections:12,
        retryTimeout:2.1*1000*60,
        userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        callback:async (err, res, done)=>{
            if(err){
                console.log('err',err);
                done();
                return
            }

            fs.writeFileSync(res.options.name, res.body,  "binary");
            // fs.createWriteStream(res.options.name).write(res.body);
            // await sleep(2000)
            // fs.writeFile("test.txt", b,  "binary",function(err) { });
            console.log(linkArr.length+'--'+linkArr.findIndex(v => v.uri == res.options.uri))
            done();
        }
    });
    c.queue(linkArr);
    return new Promise((resolve, reject) => {
        c.on('drain', () => {
            resolve({code:200})
        });
    })
   },
   downloadmP4({url,uploadPath,saveFilePath}){
    return new Promise((resolve, reject) => {
        pacote.tarball(url).then(data => {
            console.log('got ' + data.length + ' bytes of tarball data')
            fs.writeFileSync(saveFilePath, data);
            resolve()
        })
    })
   },
   m3u8Client({url,uploadPath,saveFilePath}){
    return new Promise((resolve, reject) => {
        ffmpeg(saveFilePath)
        .videoCodec('libx264') // 设置视频编解码器
        // .audioCodec('libfaac') // 设置 音频解码器
        .format('hls') // 输出视频格式
        .outputOptions('-hls_list_size 0') //  -hls_list_size n:设置播放列表保存的最多条目，设置为0会保存有所片信息，默认值为5
        .outputOption('-hls_time 5') // -hls_time n: 设置每片的长度，默认值为2。单位为秒 index.m3u8
        .output(`${uploadPath}index.m3u8`) // 输出文件
        .on('progress', (progress) => { // 监听切片进度
          const { frames, currentFps, currentKbps, targetSize, timemark } = progress;
          console.log(`${(currentFps/frames)*100}%--${timemark}`);
        })
        .on('end', () => { // 监听结束
          fs.unlinkSync(saveFilePath);
          console.log("视频切片完成");
          resolve({code:200})
        })
        .run(); // 执行
    })
   }  
}
module.exports = m3u8down;
//m3u8down.init('https://hls-uranus.sb-cd.com/hls/1/2/12671737-,1080p,.mp4.urlset/master.m3u8?secure=gVnu5LGd6BoOyaM8X0VE3w,1671506840&m=48&d=1&_tid=12671737')
