let host='https://91mjw.com';
const cheerio = require('cheerio');
const http = require('./http');
const htmlToText = require('html-to-text');
const chineseConv = require('chinese-conv');
let mjw91={
    resHost(v){
      if(v){
         return v.replace(host,'')
      }
    },
    tify(a){
       return chineseConv.tify(a)
    },
    resCat(html){
        let $ = cheerio.load(html,{ decodeEntities: false });
        let page={ cat:[],}
        let _this=this;
        $('.header .nav > li').each(function(){
            let catTxt=$(this).children('a').text()
            if(catTxt && catTxt.indexOf('韩剧')){
            let txt=$(this).children('a').text()
            let json={
                text:txt,
                tify:_this.tify(txt),
                href:_this.resHost($(this).children('a').attr('href')),
                child:[]
            }
            if($(this).children('.sub-menu').length){
                $(this).find('.sub-menu a').each(function(){
                    let txt=$(this).text()
                    json.child.push({
                        text:$(this).text(),
                        tify:_this.tify(txt),
                        href:_this.resHost($(this).attr('href')),
                    })
                })
            }
            page.cat.push(json)
          }
        })
        return page
    },
    async index(){
        let page={
          slider:[],
          cat:[],
          list:[],
        }
        await http.get(host).then(res =>{
            let $ = cheerio.load(res.data,{ decodeEntities: false });
            let _this=this;
            Object.assign(page,this.resCat(res.data))
            $('#slider .carousel-inner a').each(function(){
                let txt=$(this).find('.carousel-caption').text()
                page.slider.push({
                    img:$(this).find('img').attr('attr'),
                    title:txt,
                    tify:_this.tify(txt),
                    href:_this.resHost($(this).attr('href')),
                })
            })
            $('.content > .m-movies').each(function(){
                let txt=$(this).children('.title').text()
                console.log(txt)
                let json={
                    title:txt,
                  tify:_this.tify(txt),
                  docs:[]
                }
                $(this).find('a[title]').each(function(){
                  let txt=$(this).attr('title')
                  json.docs.push({
                      title:txt,
                      tify:_this.tify(txt),
                      img:$(this).find('.thumb').attr('data-original'),
                      href:_this.resHost($(this).attr('href')),
                  })
                })
                page.list.push(json)
              })
        }).catch(e => console.log(e))
       return page
    },
    htmlToText(v=''){ 
        let str= htmlToText.fromString(v)
        return chineseConv.tify(str)
       },
   async getM3U8(url){
        let m3u8Json={}
        await http.get(url).then(res => {
            let $ = cheerio.load(res.data, {decodeEntities: false});
            let strJson=$('body').html().match(/{("flag"){1}[^{]+}/gi)
            m3u8Json=strJson ? JSON.parse(strJson[0]) : {}
        }).catch(e => console.log(e))
        return m3u8Json
    },   
    async kuhuivideo(id) {
        let video={}
        let _this=this;
        console.log(`http://www.kuhuiv.com/index.php/show/${id}.html`)
        await http.get(`http://www.kuhuiv.com/index.php/show/${id}.html`).then(res => {
            let $ = cheerio.load(res.data, {decodeEntities: false});
            $('.info-txt .w50 em').remove()
            video = {
                web_id: parseInt($('[data-id]').attr('data-id')),
                id:parseInt($('[data-id]').attr('data-id')),
                title: this.htmlToText($('.vodinfos > h1').text()),
                img: $('.vodimg >img').attr('data-original'),
                keywords:this.htmlToText($('[name="keywords"]').attr('content')),
                desc:this.htmlToText($('.brief').text()) ,
                description:this.htmlToText($('.brief').text()) ,
                signName:this.htmlToText($('.mcid').text()) , //mcid *片 *剧 综艺 动漫
                catName:this.htmlToText($('.info-txt .w50').eq(4).text()) ,
                user:this.htmlToText($('.info-txt .w50').eq(3).text()) ,
                area:this.htmlToText($('.info-txt .w50').eq(4).text()) ,
                year:this.htmlToText($('.info-txt .w50').eq(7).text()) ,
                list: [],
                site:2,
            }
            var description=''
            $('.info-txt').children().each(function(){
               if(!description){
                description=_this.htmlToText($(this).text()) 
               }else{
                description+=';'+_this.htmlToText($(this).text()) 
               }
            })
            if(video.signName.indexOf('劇') > -1){
                video.signName='電視劇'
            }
            video.description=description
            $('.playerlist').eq(0).find('a').each(function () {
                video.list.push({url: $(this).attr('href'), index: htmlToText.fromString($(this).text())})
            })
            if(video.area == '大陸'){
                video.area='中國大陸'
            }
            if (video.signName.indexOf('片') >= 0) {
                video.catName = video.signName
                video.signName = '電影'
            }
            let notFitter = ['img', 'list']
            for (let keys in video) {
                if (!notFitter.includes(keys)) {
                    video[keys] = htmlToText.fromString(video[keys])
                }
            }
        }).catch(e => console.log(e))

        if(Array.isArray(video.list) && video.list.length){
            let urlJson= await this.getM3U8('https://www.kuhuiv.com'+video.list[0].url)
            if(Object.keys(urlJson).length){
                video.list[0].url=urlJson.url
                if(urlJson.url_next){
                    video.list[1].url=urlJson.url_next
                }
            }
        }
        return  video
    },
}
module.exports = mjw91;
