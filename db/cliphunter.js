const Crawler = require("crawler");
const host='https://www.cliphunter.com'
const fs = require('fs');
const htmlToText = require('html-to-text');
const baseUrl='/cliphunter'
const pagination = require('pagination');
const cheerio = require('cheerio');
const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/Cliphunter/gi,'porncvd')
    str=str.replace(/[\t\v\n\r\f]/g, "")
    str=str.replace(/]article_adlist-->/g, "")
    if(!s){
        str=htmlToText.fromString(str)
    }
    str=str.replace(/\[javascript:;\]/g, "")
    return str
}
const resHref=function (str) {
    if(typeof str != "string") return str
    return  str.replace(/http+.com/gi,'')
}
const pup = new Crawler({
    maxConnections : 30000,
    retries:2,
    retryTimeout:600,
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
const thudam={
    getNav($){
        let nav=[]
        let arr=['/random/','/search/q_C98']
        $('.top-menu > li').each(function (k,v) {
            if(k > 1){
                $(this).remove()
            }
        })
        $('.top-menu .sub-menu a ').each(function (k,v) {
            nav.push({
                title:purHtml($(this).text()),
                href:baseUrl+$(this).attr('href')
            })
        })
        return {nav}
    },
    getPage($){
        let page=[]
        $('.simple-pagination .pre').closest('li').remove()
        $('.simple-pagination .next').closest('li').remove()
        $('.simple-pagination > li').each(function () {
            page.push({
                text:purHtml($(this).text()),
                class:$(this).find('.current').length ? 'active' :'',
                href:$(this).find('.current').length ? 'javascript:;' :baseUrl+$(this).find('a').attr('href')
            })
        })

        return {page}
    },
    htmlTpl($){
        let  video={docs:[]}
        $('.moviethumbs > [mid]').each(function (k,v) {
            if($(this).find('.pop-execute').attr('href')){
                let json={
                    href:baseUrl+$(this).find('.pop-execute').attr('href'),
                    title:purHtml($(this).find('.vttl').text()),
                    img:$(this).find('img').attr('src'),
                }
                video.docs.push(json)
            }
        })
        return video
    },
    async list (uri=host){
        let list={docs:[],meta:{}},_this=this;
        console.log(uri.indexOf('.com') > -1 ? uri : host+uri,'list')
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:uri.indexOf('.com') > -1 ? uri : host+uri,
                //jQuery:false,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$

                        $('.moviethumbs > [mid]').each(function (k,v) {
                            if($(this).find('.pop-execute').attr('href')){
                                let json={
                                    href:baseUrl+$(this).find('.pop-execute').attr('href'),
                                    title:purHtml($(this).find('.vttl').text()),
                                    img:$(this).find('img').attr('src'),
                                }
                                list.docs.push(json)
                            }

                        })
                        Object.assign(list)
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) || purHtml($('[name="description"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }
                        if($('.fibonacci_pagination').length){
                            //maxPages="980" curPage="3" /\/$/gi.test("/categories/All/")
                            let limit=36,cont=$('.fibonacci_pagination')[0].attribs;
                            let link=uri.replace(/\?.+/gi,'')
                            link=link.replace(/[0-9]+$/gi,'')
                            link=/\/$/gi.test(link) ? link : link+'/'
                            var paginator = new pagination.SearchPaginator({
                                prelink:link,
                                current:  cont.curpage,
                                rowsPerPage: limit,
                                totalResult: cont.maxpages*limit
                            });
                            let page =paginator.getPaginationData()

                            if( !page.range.includes(1)){
                                page.range.unshift(1)
                            }
                            if( !page.range.includes(page.pageCount)){
                                page.range.push(page.pageCount)
                            }
                            list.range=[]
                            page.range.forEach(v =>{
                                list.range.push({
                                    href:baseUrl+link+v,
                                    class:v == cont.curpage ? 'active' : '',
                                    text:v,
                                })
                            })

                        }

                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
   async getRate(uri){
       let list={docs:[],meta:{},video:{thumb:[],docs:[],tags:[]},nav:[]},_this=this;
       return  new Promise((resolve, reject) => {
           rawBody.queue([{
               uri:host+uri,
               encoding:null,
               callback: function (error, res, done) {
                   if(error){
                       console.log(error);
                   }else{
                       let result=JSON.parse(res.body.toString())
                       let $ = cheerio.load(result.html);
                       list= _this.htmlTpl($)
                   }
                   done();
                   resolve(list)
               }
           }]);
       })
    },
    async detail(uri){
        let list={docs:[],meta:{},video:{thumb:[],docs:[],tags:[]},nav:[]},_this=this;
        console.log(host+uri)
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:host+uri,
                encoding:null,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$

                        Object.assign(list.video,{
                            title:purHtml($('meta[name="twitter:title"]').attr('content')),
                            desc:purHtml($('meta[name="twitter:description"]').attr('content')),
                            img:$('meta[name="twitter:image"]').attr('content'),
                        })
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) || purHtml($('[name="description"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }
                      let str= $('html').html().match(/gexoFiles.+\}\};/gi)
                        if(str){
                            let gexoFiles;
                            try {
                                eval(str[0])
                                console.log(gexoFiles)
                                for (let key in gexoFiles) {
                                    if(key.indexOf('720') > -1 || key.indexOf('360') > -1){
                                        Object.assign(list.video,gexoFiles[key])
                                    }

                                }
                            }catch (e) {

                            }
                        }
                        $('.moviethumbs > [mid]').each(function (k,v) {
                            if($(this).find('.pop-execute').attr('href')){
                                let json={
                                    href:baseUrl+$(this).find('.pop-execute').attr('href'),
                                    title:purHtml($(this).find('.vttl').text()),
                                    img:$(this).find('img').attr('src'),
                                }
                                list.video.docs.push(json)
                            }

                        })
                        //movId title page count
                        if($('.movieTags > a').length){

                            list.video.relate={tags:[],page:1,count:28,movId: $('[name="og:url"]').attr('content').replace(/[^0-9]/gi,'')}
                            $('.movieTags > a').each(function () {
                                let json={
                                    href:baseUrl+$(this).attr('href'),
                                    title:purHtml($(this).text()),
                                }
                                list.video.tags.push($(this).text())
                                list.video.relate.tags.push(purHtml($(this).text()))
                            })

                        }

                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
}
// thudam.detail('https://api.simply-hentai.com/v3/album/awahime-foam-princess?si=0&path=%2Fseries%2F1-naruto&locale=zh').then(res =>{
// console.log(res)
// })
module.exports = thudam;
