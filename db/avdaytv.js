const Crawler = require("crawler");
const host='https://18porn.cc'
const axios = require('axios');
const siteName=' http://localhost:30019'
const http = axios.create({
    timeout: 60000,
})
let delay= async (millisecond) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, millisecond*1000)
    })
}
http.interceptors.response.use(res => {
    return res.data
})
const fs = require('fs');
const htmlToText = require('html-to-text');
const baseUrl=''

const cheerio = require('cheerio');

const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/18porn\.cc|18porn|中文成人手機娛樂網站/gi,'pornavd')
    str=str.replace(/[\t\v\n\r\f]/g, "")
    str=str.replace(/]article_adlist-->/g, "")
    if(!s){
        str=htmlToText.fromString(str)
    }
    str=str.replace(/\[javascript:;\]/g, "")
    return str
}

const pup = new Crawler({
    maxConnections : 30000,
    retries:2,
    timeout:3500,
    retryTimeout:600,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$
            console.log($('title').text())
            var arr=[]
            $('#browse .categories a').each(function () {
                arr.push({
                    title:$(this).text(),
                    href:$(this).attr('href')
                })
            })
        }
        done();
    }
});
const rawBody = new Crawler({
    maxConnections : 30000,
    retries:2,
    retryTimeout:600,
    encoding:null,
    jQuery:false,// set false to suppress warning message.
    callback:function(err, res, done){
        if(err){
            console.error(err.stack);
        }else{
            //fs.createWriteStream(res.options.filename).write(res.body);
        }

        done();
    }
});
function writeData(value,name='xnxx.json') {
    var str = JSON.stringify(value, "", "\t");
    fs.writeFile(name, str, function (err) {
        if (err) {
            console.error(err);
        }

    })
}
const thudam={
    sliceArray(array, size) {
        var result = []
        for (var x = 0; x < Math.ceil(array.length / size); x++) {
            var start = x * size
            var end = start + size
            result.push(array.slice(start, end))
        }
        return result
    },
    async initPage(){
        //https://18porn.cc/?c=1&page=2
        let page=['']
        for(let i=1;i <= 1000;i++){
            page.push({uri:`https://avday.tv/list/long?page=${i}`,cat:1})
        }
        //page.push({uri:`https://18porn.cc`,cat:1})
        page=page.reverse()
        for (const [idx, item] of this.sliceArray(page,10).entries()) {
            await this.init(item)
            await delay(0.5)
            console.log('page',item)
        }

    },
    async init(page){
        let  detail =await this.muchImg(page)

        let data = await this.gotDetail(detail)
        this.sliceArray(data,10)
        for (const [idx, item] of this.sliceArray(data,10).entries()) {
            //http://localhost:30074
            await http.post('https://proxy.bvujarg.xyz/users/mongo.html',item).then(res =>{
               // console.log(res)
            })
            await  delay(0.3)
        }
        console.log('ok','init 10')
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

                    let cat = res.options.cat
                    $('.position-relative [href^="https://avday.tv/watch/"]').each(function () {
                        let href=$(this).attr('href')
                        let $imgDom= $(this).find('img')

                        if( href){
                            let hrefArr=href.split('/')
                            let id=hrefArr[hrefArr.length -1]
                            detail.push({
                                id,
                                cat:'',
                                uri:href,
                                title:$imgDom.attr('title'),
                                img:$imgDom.attr('data-cfsrc'),
                            })
                        }
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
    async getHls(url = host) {
        let src = []
        return new Promise((resolve, reject) => {
            pup.queue([{
                retries: 2,
                uri:url,
                retryTimeout: 500,
                headers:{Cookie:"avday_session=eyJpdiI6IjJVVEdDTFBDUjdRQTBqWlJXOWowNEE9PSIsInZhbHVlIjoiWDM5Y0R0NVFvMTJhUHVGYU96SlFKcFg0ais5Y2lvNjhGZWh3Mmw2bXhFcnQzVjVqS3RJZ3dMeGU5NzFqSFozSCIsIm1hYyI6IjgyODFiZGNmZTg5OTJhMzFmMTczMmQxZmEyOTIzMjkzNDZkY2UxZTI2M2Y4MzgzMTJhZDYwNGQ3NTY5MTE1ZjAifQ%3D%3D"},
                callback: (error, res, done) => {
                    if (error) {
                        resolve('')
                    } else {
                        let $ = res.$//$('#video-player source').attr('src',)
                        src=`${$('#video-player source').attr('src').replace('https://xvideo.awvvvvw.live','')}?siteUrl=https://video.awvvvvw.live`
                    }
                    resolve(src)
                    done();
                }
            }]);
        })
    },
    async gotDetail(linkArr){
        let pic=[]
        var c = new Crawler({
            encoding:null,
            rateLimit:30,
            retries:2,
            retryTimeout:500,
            callback: async (err, res, done) =>{
                if(err){
                    console.error(err.stack);
                }else{
                    let $ = res.$
                    let json={docs:[],tags:[],id:res.options.id,
                        title:res.options.title,
                        cat:'short',
                        img:res.options.img,site:'avday',date:new Date().getTime(),
                        keywords:$('[name="keywords"]').attr('content'),
                        desc:$('[name="description"]').attr('content')
                    }
                    let navConFig=[
                        {val:'長片',keys:'long'},
                        {val:'短片',keys:'short'},
                        {val:'獨家',keys:'exclusive'},
                    ]
                    navConFig.forEach(function (v){
                        if(v.val == $('.header-active').text()){
                            json.cat=v.keys
                            return  false
                        }
                    })

                    json.url=await this.getHls(res.options.uri)

                    pic.push(json)

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
    async getVideoM3u8(uri){
        let list='';
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri: uri,
                encoding:null,
                jQuery:false,
                callback: async (error, res, done) => {
                    if (error) {
                        console.log(error);
                    } else {
                        list=res.body
                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
}
thudam.initPage('https://avday.tv').then(res =>{
    console.log(res)
})
module.exports = thudam;


