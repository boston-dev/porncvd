const Crawler = require("crawler");
//https://myhentaigallery.com/
const host='https://en.bughentai.com'
const fs = require('fs');
const htmlToText = require('html-to-text');
const baseUrl='/manga'
const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/nyahentai/gi,'porncvd')
    str=str.replace(/[\t\v\n\r\f\n]/g, "")
    str=str.replace(/]article_adlist-->/g, "")
    if(!s){
        str=htmlToText.fromString(str)
    }
    str=str.replace(/\[javascript:;\]/g, "")
    return str
}
const pup = new Crawler({
    maxConnections : 10000,
    encoding:null,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$
            console.log($('title').text())
        }
        done();
    }
});
const thudam={
    getNav($){
        let nav=[]
        let arr=['/random/','/search/q_C98']
        $('.collapse .menu.left .desktop a').each(function () {
            if(arr.join(',').indexOf($(this).attr('href')) == -1){
                nav.push({
                    title:purHtml($(this).text()),
                    href:baseUrl+$(this).attr('href')
                })
            }

        })
        return {nav}
    },
    getPage($){
      let page=[]
        $('.pagination .previous').each(function () {
            page.push({
              text:'Previous',
              pre:1,
              href:baseUrl+$(this).find('a').attr('href')
            })
        })
        $('.pagination .page').each(function () {
            page.push({
                text:purHtml($(this).text()),
                href:baseUrl+$(this).find('a').attr('href')
            })
        })
        $('.pagination .next').each(function () {
            page.push({
                text:'Next',
                href:baseUrl+$(this).find('a').attr('href')
            })
        })
        $('.pagination .last').each(function () {
            page.push({
                text:'Last',
                href:baseUrl+$(this).find('a').attr('href')
            })
        })
        return {page}
    },
    async list (uri=host){
        console.log(host+uri)
        let list={docs:[],meta:{},nav:[]},_this=this;
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:host+uri,
                //jQuery:false,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                       let $ = res.$

                        $('.gallery ').each(function () {
                            list.docs.push({
                                href:baseUrl+$(this).find('a').attr('href'),
                                title:purHtml($(this).text()),
                                img:$(this).find('[data-src]').attr('data-src')
                            })
                        })
                        Object.assign(list,_this.getNav($),_this.getPage($))
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) ,
                            desc:purHtml($('[name="keywords"]').attr('content'))
                        }

                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
    async detail(uri){
        let list={docs:[],meta:{},video:{},nav:[]},_this=this;
        console.log(host+uri)
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:host+uri,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$
                        $('#related-container .cover').each(function () {
                           list.docs.push({
                               href:baseUrl+$(this).attr('href'),
                               title:$(this).find('img').attr('alt'),
                               img:$(this).find('img').attr('data-src')
                           })
                        })
                        Object.assign(list.video,{
                            title:$('#info h1').text(),
                            img:$('#cover img').attr('data-src'),
                            desc: purHtml($('#info').html()),
                            thumb:[]
                        })
                        $('#info h1').remove()
                        $('#info').find('.buttons').remove()
                        list.video.desc=purHtml($('#info').html())
                        $('#thumbnail-container .gallerythumb').each(function () {
                            let img=$(this).find('img').attr('data-src')
                            //https://t1.mspcdn.xyz/galleries/1902252/3t.jpg
                            // https://i1.bspcdn.xyz/galleries/1902252/3.jpg
                            let big=img.replace(/https:\/\/t1\.mspcdn\.xyz/gi,'https://i1.bspcdn.xyz')
                            big=big.replace(/t\./gi,'.')
                            list.video.thumb.push({
                                href:baseUrl+$(this).attr('href'),
                                title:$(this).find('img').attr('alt'),
                                img:$(this).find('img').attr('data-src'),
                                big
                            })
                        })
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) ,
                            desc:purHtml($('[name="keywords"]').attr('content'))
                        }
                        Object.assign(list,_this.getNav($))
                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
}
// thudam.detail('https://en.bughentai.com/').then(res =>{
//     console.log(res)
// })
module.exports = thudam;
