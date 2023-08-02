const Crawler = require("crawler");
const host='https://18porn.cc'
const axios = require('axios');
const http = axios.create({
    timeout: 60000,
})
http.interceptors.response.use(res => {
    return res.data
})
const fs = require('fs');
const htmlToText = require('html-to-text');
const baseUrl='/cc18'
const pagination = require('pagination');
const cheerio = require('cheerio');

const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/18porn\.cc|18porn/gi,'pornavd')
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
    return  str.replace(/http.+\.(com|tv)/gi,'')
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
    async cat (uri=host){
        let list={docs:[],meta:{},range:[]},_this=this;
        console.log(uri.indexOf('.com') > -1 ? uri : host+uri,'list')
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:uri.indexOf('.com') > -1 ? uri : host+uri,
                //jQuery:false,
                timeout:3500,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$
                        if(!$('body').html()) return  false
                        let listArr=$('body').html().match(/\[\{[^\]]+\}]/gi)
                        if(listArr && !list.docs.length){
                            //
                            listArr=JSON.parse(listArr[0])

                            listArr.forEach(v =>{
                                list.docs.push({
                                    href:baseUrl+v.u,
                                    title:purHtml(v.tf),
                                    img:v.i,
                                    num:v.n
                                })
                            })
                            // writeData(list.docs)
                        }


                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
    async list (uri=host){
        let list={docs:[],meta:{},range:[]},_this=this;
        let resUri = uri.indexOf('.cc') > -1 ? uri : host+uri
        console.log(resUri,'list')
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:resUri,
                method: 'GET',
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$
                        $('[href^="/video/"]').each(function () {
                            let href=$(this).attr('href')
                            let img=$(this).find('img').attr('data-src') || $(this).find('img').attr('src')
                            if( href && href.indexOf('/video/') > -1 && img){
                                list.docs.push({
                                    href:baseUrl+resHref($(this).attr('href')),
                                    title:$(this).find('.video-title').text(),
                                    img:host+$(this).find('img').attr('data-src')
                                })
                            }
                        })
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) || purHtml($('[name="description"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }
                        $('.pagination li').each(function () {
                            list.range.push({
                                text:$(this).find('a').text(),
                                class:$(this).hasClass('active') ? 'active' : '',
                                href:$(this).find('a').attr('href') ? baseUrl+$(this).find('a').attr('href'):'javascript:;'
                            })
                        })
                        $('.tags a').each(function () {
                            if(!list.porn5filter){
                                list.porn5filter=[]
                            }
                            list.porn5filter.push({
                                title:$(this).text(),
                                href:baseUrl+resHref($(this).attr('href'))
                            })
                        })

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
    getNav($){
        let nav=[],not=[
            '/categories',
            '/torrents',
            '/go/websites',
            '/app',
            '/go/telegram',
            '/telegram/group',
            '/telegram/video',
            '/go/api-doc']
        $('#navbar > [data-nav] a').each(function () {
            let href=$(this).attr('href')
            if(href && !not.includes(href) && href.indexOf('http') < 0){
                nav.push({
                    title:$(this).text(),
                    href
                })
            }

        })
        return nav
    },
    async detail(uri='/video/31614'){
        let list={docs:[],meta:{},video:{thumb:[],docs:[],tags:[]}},_this=this;
        console.log(host+uri)
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:host+uri,
                method: 'GET',
                timeout:3500,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{

                        let $ = res.$
                        Object.assign(list.video,{
                            title:purHtml($('h3.big-title-truncate').text()) || purHtml($('title').text()),
                            desc:purHtml($('[name="description"]').attr('content')),
                            img:$('#my-video').attr('poster')
                        })
                        let src=$('source').attr('src')
                        if(src){
                           let hlsUrl=src.split('/videos/')
                            list.video.url='/videos/'+hlsUrl[1]+'?siteUrl='+hlsUrl[0]
                            list.video.siteUrl=hlsUrl[0]
                        }

                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }

                        $('[href^="/video/"]').each(function () {
                          let href=$(this).attr('href')
                          let img=$(this).find('img').attr('data-src') || $(this).find('img').attr('src')
                          if( href && href.indexOf('/video/') > -1 && img){
                              list.video.docs.push({
                                  href:baseUrl+resHref($(this).attr('href')),
                                  title:$(this).find('.video-title').text(),
                                  img:host+$(this).find('img').attr('data-src')
                              })
                          }
                      })
                        $('.tags a').each(function () {
                            if(!list.porn5filter){
                                list.porn5filter=[]
                            }
                            list.porn5filter.push({
                                title:$(this).text(),
                                href:baseUrl+resHref($(this).attr('href'))
                            })
                        })
                    }
                   // writeData(list,'detail')
                    done();
                    resolve(list)
                }
            }]);
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
/*thudam.detail('/video/9112.html').then(res =>{
  console.log(res)
})*/
module.exports = thudam;
