const Crawler = require("crawler");
const config = require("./config");
const htmlToText = require('html-to-text');
const {responeTpl}=config
const path = require('path');
const http=require("./http");
const chineseConv = require('chinese-conv');
const site='porn5f'
const host='https://www.porn5f.com'
const io = require("socket.io-client");
//http://localhost:6432 https://porncvd.com
const socket = io.connect('https://porncvd.com');
const  ourName='porncvd'
const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/[\t\v\n\r\f]/g, "")
    str=str.replace(/]article_adlist-->/g, "")
    str=str.replace(/五樓自拍/g, "")
    str=str.replace(/-/g, "")
    str=str.replace(/[a-z\.]+\.[a-z]+/gi,'')
    if(!s){
        str=htmlToText.fromString(str)
    }
    str= chineseConv.tify(str)
    return str
}
const fs = require('fs');
socket.on('connect', function (res) {
    console.log(res)
})
socket.on('message', (res) => {
    console.log('message',res.code)
})
const pup = new Crawler({
    maxConnections: 3,
    timeout:3300,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

const ajaxPup = {
    async getDetail(url = host) {
        return new Promise((resolve, reject) => {
            pup.queue([{
                uri: url ,
                retries:2,
                retryTimeout:500,
                callback:  (error, res, done) => {
                    if (error) {
                        resolve({
                            ...responeTpl,
                            code:400
                        })
                    } else {
                        const $ = res.$,result=[];
                        $ && $('[href^="/video"]').each(function () {
                            if ($(this).attr('href') &&
                                $(this).attr('href').match(/\/video\/[0-9]+\//gi) &&
                                !$(this).find('.vip-text-icon').length) {
                                let str=$(this).attr('href').split('/')
                                result.push({
                                    id:str[2],
                                    //href:`/${str[1]}/${str[2]}porn5f/`,
                                    uri:`${host}/${str[1]}/${str[2]}/`,
                                    href:`${host}/${str[1]}/${str[2]}/`,
                                })
                            }
                        })
                        resolve({
                            ...responeTpl,
                            result
                        })
                    }
                    done();
                }
            }]);
        })
    },
    htmlToText(v=''){
        let str= htmlToText.fromString(v)
        str=str.replace(/^\s*|\s*$/g,"")
        str=str.replace(/(Jav Dove)| 五樓自拍/gi,ourName)
        return chineseConv.tify(str)
    },
    getPage($){
        let page=[],_this=this;
        $('.hidden-xs .pagination li').each(function () {
            let href={}
            if($(this).find('a').attr('href') && $(this).find('a').attr('href').indexOf('javascript') < 0){
                href.href=$(this).find('a').attr('href').replace(/.+\.com/gi,'')
                href.href=href.href.replace(/.+\.xyz/gi,'')
                href.href='/porn5f'+href.href
            }
            if( _this.htmlToText($(this).text())){
                page.push({
                    title: _this.htmlToText($(this).text()),
                    ...href,
                    class:$(this).attr('class')
                })
            }

        })
        return page
    },
    async getList(url = host) {
        let list={list:{docs:[]},slide:[]}, _this=this;

        return new Promise((resolve, reject) => {
            pup.queue([{
                uri: url.indexOf('.com') > -1 ?  url : host+url,
                retries:2,
                retryTimeout:500,
                callback:  (error, res, done) => {
                    if (error) {
                        console.log(error);
                    } else {
                        const $ = res.$;
                        list.page= this.getPage($)
                        list.meta={
                            title:_this.htmlToText($('title').text()),
                            keywords: _this.htmlToText($('[name="keywords"]').attr('content')),
                            desc:_this.htmlToText($('[name="description"]').attr('content'))
                        }
                        $('.col-video').each(function () {
                            if(!$(this).find('.vip-text-icon').length){
                                let  _id=$(this).find('a').attr('href').split('/')[2],
                                    idType=_id+'porn5f',
                                    href=$(this).find('a').attr('href').replace(_id,idType);

                                list.list.docs.push({
                                    _id,
                                    id:_id,
                                    title:$(this).find('img').attr('alt'),
                                    img:$(this).find('img').attr('data-original') || $(this).find('img').attr('src'),
                                    vod:1,
                                    list:[],
                                    site:1,
                                    href,
                                    view:_this.htmlToText($(this).find('.stat-views').text().replace(/[^0-9]/gi,'')),
                                    time:_this.htmlToText($(this).find('.film-time').text())
                                })
                            }
                        })
                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
    async ajaxTpl(url = host) {
        return new Promise((resolve, reject) => {
            pup.queue([{
                uri: url ,
                callback:  (error, res, done) => {
                    if (error) {
                        resolve({
                            ...responeTpl,
                            code:400
                        })
                    } else {
                        const $ = res.$
                        resolve({
                            ...responeTpl,
                            $
                        })
                    }
                    done();
                }
            }]);
        })
    },
    async tran(param){
        return await http.post(`http://localhost:3009/users/tran`,{param}).then(result =>{
            return {
                ...responeTpl,
                result:result.data
            }
        }).catch(e => {
            console.log(e)
            return {
                ...responeTpl,
                code:400
            }
        })
    },
    async clearDetail(linkArr=[]){
        let result=[]

        for (const [idx, item] of linkArr.entries()) {
            console.log(`${idx}---${linkArr.length}--${item.uri}`)
         let res=  await this.ajaxTpl(item.uri)
            if(res.code == 200){
                let { $ } = res
                Object.assign(item,{
                    title:$("title").text(),
                    keywords:$('[name="keywords"]').attr('content'),
                    desc:$('[name="description"]').attr('content'),
                    site,
                    img:$('#vplayer').attr('poster'),
                    date:new Date().getTime()
                })
               // let data =await this.tran({
               //     title:$("title").text(),
               //     keywords:$('[name="keywords"]').attr('content'),
               //     desc:$('[name="description"]').attr('content'),
               //  })
               //  if(data.code == 200){
               //      result.push(Object.assign(item,{site,img:$('#vplayer').attr('poster'),time:new Date().getTime()},data.result))
               //  }
            }
        }
        return {
            ...responeTpl,
            result:linkArr
        }
    },

    async muchPage(linkArr){
        let result=[]
        var c = new Crawler({
            maxConnections : 10,
            retries:2,
            retryTimeout:500,
            // This will be called for each crawled page
            callback : function (error, res, done) {
                if(error){
                    console.log(error);
                }else{
                    let $ = res.$;
                    if( $ && $('#vplayer').attr('poster')){
                        let filename=$('#vplayer').attr('poster').replace(/\?.+/gi,'').replace(/.+media\//gi,'').replace(/\/+/gi,'-')
                        result.push({
                            title:purHtml($("title").text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content')),
                            site,
                            img:$('#vplayer').attr('poster'),
                            uri:$('#vplayer').attr('poster'),
                            filename,
                            date:new Date().getTime(),
                            id:$('[id^="vote_like_"]').attr('id').replace(/[^0-9]/gi,''),
                            site:'porn5f',
                            href: res.options.href
                        })
                    }

                }
                done();
            }
        });
        c.queue(linkArr);
        return new Promise((resolve, reject) => {
            c.on('drain', () => {
                resolve(result)
            });
        })

    },
    async muchImg(linkArr){
        var c = new Crawler({
            encoding:null,
            jQuery:false,// set false to suppress warning message.
            callback:function(err, res, done){
                if(err){
                    console.error(err.stack);
                }else{
                    fs.createWriteStream(res.options.filename).write(res.body);
                }

                done();
            }
        });

        c.queue(linkArr);
        return new Promise((resolve, reject) => {
            c.on('drain', () => {
               console.log('img ---- ok')
            });
        })
    },
    async initDetail(url,cat){
       let res= await this.getDetail(url)
       if(res.code !== 200) return  false
       let linkArr=res.result

       let list= await this.muchPage(linkArr)
        list.forEach(v =>{
            v.cat=cat
        })
        console.log(list)
       /* console.log('翻译去---')
        let tran={}
        list.forEach(v =>{
            tran[`title-${v.id}`]=v.title
            tran[`keywords-${v.id}`]=v.keywords
            tran[`desc-${v.id}`]=v.desc
        })
        let tranResult =await this.tran(tran)

        for (let key in tranResult.result){
           let arr= key.split('-')
            list.forEach(v =>{
                console.log(tranResult.result[key])
                if(v.id == arr[1]){
                    v[arr[0]]=tranResult.result[key]
                }
            })
        }*/
        // {
        //     title: '可以讓我充電嗎？10 428SUKE-065 -',
        //     keywords: '中出, 素人, 顏射, 巨乳, 企劃片, 學生妹, 720p, ローション・オイル, オモチャ',
        //     desc: '在這裡要跟大家分享推薦的成人性愛短片是屬於「素人片廠」分類裡的「可以讓我充電嗎？10\n' +
        //       '428SUKE-065」免費A片，劇情包含中出、素人、顏射、巨乳、企劃片、學生妹、720p、ローション・オイル和オモチャ等AV成人影片和自拍性愛癖好主題，在2021年4月29日上傳於pornlikeporn的線上免費看自拍A片。',
        //     site: 'porn5f',
        //     img: 'https://www.porn5f.com/media/videos/tmb2/67662/10.jpg?v=0',
        //     uri: 'https://www.porn5f.com/media/videos/tmb2/67662/10.jpg?v=0',
        //     filename: 'videos-tmb2-67662-10.jpg',
        //     date: 1621431751408,
        //     id: '67662'
        //   }
       // await this.muchImg(list)
        console.log('发送插入数据库')
       socket.emit('message',list)
    }
}
module.exports = ajaxPup;
//ajaxPup.initDetail('https://www.porn5f.com/search/videos/asia?search_query=%E5%90%8E%E5%85%A5','/videos/cowgirl-riding')
