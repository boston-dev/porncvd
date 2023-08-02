const Crawler = require("crawler");
//https://myhentaigallery.com/ https://pixhentai.com/ www.luscious.net
const host='https://www.javdove.com'
const fs = require('fs');
const htmlToText = require('html-to-text');
const chineseConv = require('chinese-conv');
const baseUrl='/hentaicrot'
const axios =require('axios')
const http = axios.create({
    timeout: 60000,
})
function delay(millisecond) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, millisecond*1000)
    })
}
//http://localhost:6432 https://porncvd.com
const website='https://porncvd.com'
const io = require("socket.io-client");
const socket = io.connect(website);
socket.on('connect', function (res) {
    console.log(res)
})
socket.on('message', (res) => {
    console.log('message',res.code)
})
const purHtml=function(str,s){
    if(typeof str != "string") return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/Jav Dove/gi,'porncvd')
    str=str.replace(/[\t\v\n\r\f]/g, "")
    str=str.replace(/]article_adlist-->/g, "")
    if(!s){
        str=htmlToText.fromString(str)
    }
    str= chineseConv.tify(str)
    str=str.replace(/\[javascript:;\]/g, "")
    return str
}
const resHref=function (str) {
    if(typeof str != "string") return str
    return  str.replace(/.+.com/gi,'')
}
const pup = new Crawler({
    maxConnections : 30000,
    retries:2,
    retryTimeout:600,
    encoding:null,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$

        }
        done();
    }
});
function writeData(value) {
    var str = JSON.stringify(value, "", "\t");
    fs.writeFile('towCat.json', str, function (err) {
        if (err) {
            console.error(err);
        }

    })
}
const thudam={
    getVideo(uri){
        let list={url:''},_this=this;
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri: uri,
                callback: async (error, res, done) => {
                    if (error) {
                        console.log(error);
                    } else {
                        let $ = res.$
                        list.url=$('#vplayer source ').attr('src')
                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
    async tran(data){
        let tran={},orgdata=data;
        data.forEach(v =>{
            tran[`title-${v._id}`]=v.title
            tran[`keywords-${v._id}`]=v.keywords
            tran[`desc-${v._id}`]=v.desc
        })
        let save=['title_en','keywords_en','desc_en','_id']
        return  await http.post(`http://localhost:3009/users/tran`,{param:tran}).then(result =>{
            for (let key in result.data){
                let arr= key.split('-')
                orgdata.forEach((v,k) =>{
                    if(v._id == arr[1]){
                        v[`${arr[0]}_en`]=result.data[key]
                    }
                    for(let key in v){
                        if(!save.includes(key)){
                            delete v[key]
                        }
                    }

                })
            }
            return orgdata
        }).catch(e => {
            console.log(e)
            return {}
        })
    },
    getNav(uri){
        let list={docs:[],meta:{},nav:[]},_this=this;
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri: host + uri,
                callback: async (error, res, done) => {
                    if (error) {
                        console.log(error);
                    } else {
                        let $ = res.$
                        let send={}
                        $('.classification-wrap > a').each(function () {
                            list.nav.push({
                                title:purHtml($(this).attr('title')),
                                href:purHtml($(this).attr('href')),
                            })
                            send[`title_${purHtml($(this).attr('href'))}`]=purHtml($(this).attr('title'))
                        })
                        list.meta = {
                            title: purHtml($('title').text()),
                            keywords: purHtml($('[name="description"]').attr('content')) || purHtml($('[name="keywords"]').attr('content')),
                            desc: purHtml($('[name="description"]').attr('content'))
                        }
                       let meta=await _this.tran(list.meta)
                        for(let keys in meta){
                            list.meta[`${keys}_en`]=meta[keys]
                        }
                       let nav =await _this.tran(send)
                        for(let keys in nav){
                            let sign=keys.replace(/.+_/gi,'')
                            list.nav.forEach(v =>{
                                if(v.href == sign){
                                    v['title_en']= nav[keys]
                                }
                            })
                        }
                        writeData(list)
                    }
                    done();

                    resolve(list)
                }
            }]);
        })
    },
   async getPage(){
      let page=[host]
       //244
      for (let num =1;num <= 3;num ++){
          page.push(`${host}/videos?page=${num}`)
      }
     let detail=await this.muchImg(page)
     let arr=await this.getDetail(detail)
       for (const [idx, obj] of arr.entries()) {
           console.log(idx+'-----'+arr.length,obj.title)
           socket.emit('message',{data:obj})
           await delay(0.6)
       }
      return  false
     let data=this.sliceArray(arr,100)

       for (const [idx, obj] of data.entries()) {
           let send={}
           obj.forEach(v =>{
               send[`title_en${v.id}`]=v.title
               send[`desc_en${v.id}`]=v.desc
               send[`keywords_en${v.id}`]=v.keywords
           })
           let tranResult=  await this.tran(send)
           for(let keys in tranResult){
               let str= keys.replace(/[^0-9]/gi,''),sign=keys.replace(/[0-9]/gi,'');
               arr.forEach(v =>{
                   if(v.id == str){
                       v[sign]=tranResult[keys]
                       v['date']=new Date().getTime()
                       socket.emit('message',{data:v})
                       return  false
                   }
               })
           }
          await delay(0.5)
           console.log(obj.length+'--------------'+idx+'---完成',arr.length)
       }

    },
    sliceArray:function (array, size) {
        var result = []
        for (var x = 0; x < Math.ceil(array.length / size); x++) {
            var start = x * size
            var end = start + size
            result.push(array.slice(start, end))
        }
        return result
    },
    async muchImg(linkArr){
        let detail=[]
        var c = new Crawler({
            encoding:null,
            retries:2,
            retryTimeout:500,
            callback:function(err, res, done){
                if(err){
                    console.error(err.stack);
                }else{
                    let $ = res.$
                    $(".col-video").each(function () {

                        detail.push({
                            id:$(this).find('a').attr('href').split('/')[2],
                            title:purHtml($(this).find('.video-title').text()),
                            uri:host+$(this).find('a').attr('href').replace(/\/[^\/]+$/gi,''),
                            img:$(this).find('img').attr('src') || $(this).find('img').attr('data-original')
                        })
                    })

                }
                done();
            }
        });
        c.queue(linkArr);
        return new Promise((resolve, reject) => {
            c.on('drain', () => {
                resolve(detail)
                console.log('列表收集完成 ---- ok')
            });
        })
    },
    async getDetail(linkArr){
        let pic=[]
        var c = new Crawler({
            encoding:null,
            retries:2,
            retryTimeout:500,
            callback:function(err, res, done){
                if(err){
                    console.error(err.stack);
                }else{
                    let $ = res.$
                    if($('.tag').eq(0).attr('href')){

                        let relate=[]
                        $(".col-video").each(function () {
                            relate.push($(this).find('a').attr('href').split('/')[2])
                        })
                        console.log($('.tag').eq(0).attr('href'),relate)
                        let json=  Object.assign({
                            title: purHtml($('title').text()),
                            cat:$('.tag').eq(0).attr('href').replace(/\/search|\?.+|.+\.com/gi,''),
                            keywords: purHtml($('[name="description"]').attr('content')) || purHtml($('[name="keywords"]').attr('content')),
                            desc: purHtml($('[name="description"]').attr('content')),
                            relate,
                            date:new Date().getTime(),
                        },res.options)
                        pic.push(json)
                    }

                }
                done();
            }
        });
        c.queue(linkArr);
        return new Promise((resolve, reject) => {
            c.on('drain', () => {
                resolve(pic)
                console.log('详情遍历完成 ---- ok')
            });
        })
    },
    async getAjax(num){
     let docs=[]
     await  http.post(`${website}/nav/translateData.html`, {
          query:{tran: {$exists: false}},
          options:{
              page: 1,
              limit:100,
              sort: { date: -1 },
          },
      }).then(res => {
        docs= res.data.docs
         delete  res.data.docs
         console.log(res.data)
      })

     if(docs.length > 15){
         let tranData= await thudam.tran(docs)

       socket.emit('message',{tran:tranData})
     }

     delay(1)
      if(docs.length){
          arguments.callee(docs.length)
      }else{
          console.log('翻译完成')
      }
    },
    async toy(uri='https://new.dp-toy.com/?all=1&pagetype=newitem'){
        let list=[],_this=this;
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:uri,
                method: 'GET',
                timeout:3500,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$
                        $('.team-show-up.extra .img').each(function(){
                            var $parent=$(this).closest('.list-y')
                            list.push({
                                img:$(this).find('img').attr('src'),
                                title:$(this).find('a').attr('title'),
                                href:$(this).find('a').attr('href'),
                                del:$parent.find('.price del').text(),
                                price:$parent.find('.price b').text(),
                            }) 
                        })
                    }
                    done();
                    console.log(list)
                    resolve(list)
                }
            }]);
        })
    },

}
module.exports = thudam;
