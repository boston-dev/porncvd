const Crawler = require("crawler");
const host='https://www.xnxx.com'
const fs = require('fs');
const htmlToText = require('html-to-text');
const baseUrl='/xnxx'
const pagination = require('pagination');
const cheerio = require('cheerio');
const purHtml=function(str,s){
    if(!str) return  ''
    str=str.replace(/(<!--.*?-->)/g, '')
    str=str.replace(/href="[^"]+"/gi,'href="javascript:;"')
    str=str.replace(/\|.+/gi,'')
    str=str.replace(/xnxx|buratube/gi,'porncvd')
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
    timeout:3500,
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
function writeData(value) {
    var str = JSON.stringify(value, "", "\t");
    fs.writeFile('xnxx.json', str, function (err) {
        if (err) {
            console.error(err);
        }

    })
}
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
                        $('.thumb-block').each(function (k,v) {
                            let json={
                                href:baseUrl+$(this).find('a').attr('href'),
                                title:purHtml($(this).find('[title]').attr('title')),
                                img:$(this).find('img').attr('data-src'),
                                num:$(this).find('.qtt').text()
                            }
                            list.docs.push(json)
                        })
                        Object.assign(list)
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) || purHtml($('[name="description"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }
                        $('.pagination li').each(function () {
                            if(list.range.findIndex(v => v.text == $(this).text()) < 0 && !$(this).hasClass('no-page')){
                                list.range.push({
                                    text:$(this).text(),
                                    class:$(this).find('a').hasClass('active') ? 'active' : '',
                                    href:$(this).find('a').hasClass('active') ? 'javascript:;' : baseUrl+$(this).find('a').attr('href')
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
        console.log(uri.indexOf('.com') > -1 ? uri :host+uri )
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri:uri.indexOf('.com') > -1 ? uri :host+uri,
                encoding:null,
                timeout:3500,
                callback: function (error, res, done) {
                    if(error){
                        console.log(error);
                    }else{
                        let $ = res.$

                        Object.assign(list.video,{
                            title:purHtml($('meta[property="og:title"]').attr('content')),
                            desc:purHtml($('meta[name="description"]').attr('content')),
                            img:$('meta[property="og:image"]').attr('content'),
                        })
                        list.meta={
                            title:purHtml($('title').text()),
                            keywords:purHtml($('[name="keywords"]').attr('content')) || purHtml($('[name="description"]').attr('content')),
                            desc:purHtml($('[name="description"]').attr('content'))
                        }
                      let str= $('html').html().match(/html5player\.(setVideoHLS|setVideoUrlHigh)\('.+'\);/gi)
                       if(str){
                           str.forEach(v =>{
                               v=v.replace(/html5player\.(setVideoHLS|setVideoUrlHigh)\('|'\);/gi,'')
                               if(v.indexOf('.mp4') >-1){
                                   list.video.mp4=v
                               }
                               if(v.indexOf('.m3u8') >-1){
                                   list.video.url=v
                               }
                           })
                       }
                    let video_related=$('html').html().match(/video_related=.+\}\];/gi)
                       if(video_related){
                         eval(video_related[0])
                           console.log(video_related)
                       }
                      if(Array.isArray(video_related)){
                          video_related.forEach(v =>{
                              list.video.docs.push({
                                  id:v.id,
                                  title:purHtml(v.tf),
                                  href:baseUrl+v.u,
                                  img:v.i
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
}
/*thudam.list('/search/celebrity').then(res =>{
console.log(res)
})*/
module.exports = thudam;
