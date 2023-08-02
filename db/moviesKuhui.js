const chineseConv = require('chinese-conv');
const http = require('./http');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');
const host='https://www.javdove.com'
const host5f='https://www.porn5f.com'
const siteName='Jav Dove'
const  ourName='porncvd'
const javNav = require('./jav');
const pornNav = require('./porn5f');
const Crawler = require("crawler");
//const Crawler = require("crawler");
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
const word='porn5f'
const kuhui={
    sleep(millisecond){
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, millisecond)
        })
        var  jav=[]
        $('.js-jav a').each(function () {
            let st=$(this).find('.title-truncate').text()
            jav.push({
                title:st,
                href:'/categories'+$(this).attr('href')
            })
        })
        console.save(jav, 'jav.json');
    },
    async createCat(){
        let doc= await  moviesModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: {signNameen:"$signNameen"},//{}内的是分组条件
                        count: { $sum: 1 }//类似于.count 但这是是管道函数　　所以还需要加上$sum关键词
                    },
                }
            ]
        );
      console.log(doc)
    },
    async findall(item){
        return new Promise( (resolve, reject) => {
            moviesModel.find({},(e,d) =>{
                if(!e){
                    console.log(d)
                    resolve(d)
                }else{
                    resolve()
                }
            })
        })
    },
    async findOneDb(item){
        return new Promise( (resolve, reject) => {
            moviesModel.findOne({site:item.site,id:item.id},(e,d) =>{
                if(!e){
                    console.log(d)
                    resolve(d)
                }else{
                    resolve()
                }
            })
        })
    },
    async update(item){
        delete item._id
       let status= await this.findOneDb(item)
       if(status){
        return new Promise( (resolve, reject) => {
            let josn={}
            for(let i in item){
                if(!item[i]){
                 delete item[i]
                }
            }
            moviesModel.updateOne({site:item.site,id:item.id},item,(e,d) =>{
                if(!e){
                    console.log(d)
                    resolve(d)
                }else{
                    resolve(400)
                }
            })
        })
       }
       return new Promise( (resolve, reject) => {
           if(item.area == '内地'){ item.area='中國大陸'}
           if(item.areaen == 'Mainland'){ item.areaen='China Mainland'}
         moviesModel.create(item,(e,d) =>{
                if(!e){
                    console.log(d)
                    resolve(d)
                }else{
                    resolve(400)
                }
            })
        })
    },
    updateArea(){
        moviesModel.updateMany({area:'內地'},{$set:{area:'中國大陸'} },(e,d) =>{
          console.log(d)
        })
        moviesModel.updateMany({areaen:'Mainland'},{$set:{areaen:'China Mainland'}},(e,d) =>{
            console.log(d)
          })
    },
    async detail(item){
      let art ={},lang=item.lang || 'en'
      await http.get(`http://freescatv.com/article/wd/${item._id}?ajax=1&site=2`).then(res =>{
        art=res.data
      }).catch(e => console.log('error detail '))
      if(Object.keys(art).length){
        await this.sleep(3000)
        let {title,keywords,description,area,signName} =art
       let trans= await translate.itemFn({title:`《${title}》`,keywords,description,area,signName})
       if(trans != 400){
        trans.title=trans.title.replace(/"|"/gi,'')
        for(let key in trans){
            art[`${key}${lang}`]=trans[key]
        }
        //await this.update(art)
        await http.post('https://api.porncvd.com/freestv/trant',art).then(res =>{
            console.log(res.data)
        })
       }

      }
    },
    htmlToText(v=''){
        let str= htmlToText.fromString(v)
        str=str.replace(/^\s*|\s*$/g,"")
        str=str.replace(/(Jav Dove)| 五樓自拍/gi,ourName)
        return chineseConv.tify(str)
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
    async kuhuivSuggest(w){
        let data={
            code: 0,
            msg: '数据列表',
            page: 1,
            pagecount: 1,
            limit: 10,
            total: 1,
            list:{docs:[ ]},
            nav:[],
            url: '/index.php/so/wd/mac_wd.html' }
        if(!w){
            return  data
        }
        w=chineseConv.sify(decodeURIComponent(w))
        console.log(`http://www.kuhuiv.com/so/page/1/wd/${encodeURIComponent(w)}.html`)
        await http.get(`http://www.kuhuiv.com/so/page/1/wd/${encodeURIComponent(w)}.html`).then(res =>{
            let $ = cheerio.load(res.data, {decodeEntities: false});
            let _this=this;
            data.nav= this.getNav(res)
            console.log($("a[href^='/show/']").length)
            $("a[href^='/show/']").each(function () {
                let id=$(this).attr('href').replace(/[^0-9]/gi,'');
                let $parent=$(this).closest('.player-info')
                let $img =$parent.find('img')

                let json={
                    id,
                    site:'2',
                    title:_this.htmlToText($(this).attr('title')) ,
                    href:$(this).attr('href'),
                    img:$img.attr('src'),
                    description:_this.htmlToText($img.attr('align'))
                }
                if($img.length){
                    data.list.docs.push(json)
                }

            })
        }).catch(e => console.log(e))
        return  data
    },
    getNav(res){
        return [...javNav,...pornNav]
    },
    async getIndex(){
        let list={docs:[],slide:[]}
        list.nav= this.getNav()
        let arr=[]
        await http.get(host).then(res =>{

            let $ = cheerio.load(res.data, {decodeEntities: false});
            let _this=this;
            $('.container > .well-filters').each(function () {
                let json={
                    title:_this.htmlToText($(this).find('h2').text()),
                    href:$(this).find('a').attr('href'),
                    docs:[]
                }
                list.docs.push(json)
            })
            $('.container > .overflow-y').each(function (k,v) {
                $(this).find('.col-video').each(function () {
                    if(!$(this).find('.vip-text-icon').length){
                        let  _id=$(this).find('a').attr('href').split('/')[2]
                        list.docs[k].docs.push({
                            _id,
                            id:_id,
                            title:$(this).find('img').attr('alt'),
                            img:$(this).find('img').attr('data-original') || $(this).find('img').attr('src'),
                            vod:1,
                            list:[],
                            site:1,
                            href:$(this).find('a').attr('href'),
                            view:_this.htmlToText($(this).find('.stat-views').text().replace(/[^0-9]/gi,'')),
                            time:_this.htmlToText($(this).find('.film-time').text())
                        })
                    }
                })

            })

        }).catch(e => console.log(e))

        return list
    },
    async getShowDetail(id){
        let video={video:{docs:[]},nav:[],show:[],meta:{},rank:[]}
        await http.post('https://api.porncvd.com/porn5f/detail',{id: id+"av"}).then(res =>{
            video=res.data.result
        }).catch(e => console.log(e))
        return  video
    },
   async getVideo(uri){
       let list={video:{docs:[]},meta:{}},_this=this,type='';
        return  new Promise((resolve, reject) => {
            pup.queue([{
                uri: uri,
                callback: async (error, res, done) => {
                    if (error) {
                        console.log(error);
                    } else {
                        let $ = res.$
                        Object.assign(list.video,{
                            title:_this.htmlToText($('title').text()),
                            img:$('#vplayer').attr('poster'),
                            desc:'',
                            url:$('#vplayer source ').attr('src'),
                        })
                        $('.col-video').each(function () {
                            if(!$(this).find('.vip-text-icon').length){
                                let  id=$(this).find('a').attr('href').split('/')[2],
                                    idType=id+type,
                                    href=$(this).find('a').attr('href').replace(id,idType);
                                list.video.docs.push({
                                    _id:id,
                                    id,
                                    title:_this.htmlToText($(this).find('img').attr('alt')) ,
                                    href,
                                    img:$(this).find('img').attr('data-original') || $(this).find('img').attr('src'),
                                    vod:1,
                                    list:[],
                                    site:1,
                                    view:_this.htmlToText($(this).find('.stat-views').text().replace(/[^0-9]/gi,'')),
                                    time:_this.htmlToText($(this).find('.film-time').text())
                                })
                            }
                        })
                        list.meta={
                            title:_this.htmlToText($('title').text()),
                            keywords: _this.htmlToText($('[name="keywords"]').attr('content')),
                            desc:_this.htmlToText($('[name="description"]').attr('content'))
                        }
                    }
                    done();
                    resolve(list)
                }
            }]);
        })
    },
    async getShow(href='http://www.kuhuiv.com/channel/tv.html'){
        let list={video:{docs:[]},nav:[],show:[],meta:{},rank:[]}
        let arr=[],_this= this,link={},type='',url;
        if(href.indexOf(word) > -1){
            type=word
            url=host5f+href.replace(word,'')
        }else{
            url=host+href
        }
        list.nav= this.getNav()
       let data=  await this.getVideo(url)
        Object.assign(list,data)
        if(!Object.keys(link).length && Array.isArray(list.show) && list.show.length && Array.isArray(list.show[0].docs)){
          let link= await this.getM3U8(list.show[0].docs[0].href)
          if(link.url){
              list.show[0].docs[0].href=link.url
              if(link.url_next){
                 list.show[0].docs[1].href=link.url
              }
              Object.assign(list.video,link)
          }
        }
        //item.href
        let rank=null;
        list.show.forEach((v,k) =>{
            v.docs.forEach(item =>{
                if(item.href == list.video.org){
                    rank=k
                    return false
                }
            })
            if(rank !== null ){
                return false
            }
        })
        if(rank !== null ){
            let one=list.show[rank]
            list.show.splice(rank,1)
            list.show.unshift(one)
        }
        return list
    },
    async getM3U8(url){
        let m3u8Json={}
        await http.get(host+url).then(res => {
            let $ = cheerio.load(res.data, {decodeEntities: false});
            let strJson=$('body').html().match(/{("flag"){1}[^{]+}/gi)
            m3u8Json=strJson ? JSON.parse(strJson[0]) : {}
            m3u8Json.id=$('[data-id]').attr('data-id')
            m3u8Json.org=url
        }).catch(e => console.log(e))
        return m3u8Json
    },
    getPage(res,type){
        let page=[],_this=this;
        let $ = cheerio.load(res.data, {decodeEntities: false});
        $('.hidden-xs .pagination li').each(function () {
            let href={}
            if($(this).find('a').attr('href') && $(this).find('a').attr('href').indexOf('javascript') < 0){
                href.href=$(this).find('a').attr('href').replace(/.+\.com/gi,'')
                href.href=href.href.replace(/.+\.xyz/gi,'')
                if(type){
                    href.href=href.href.replace(`${word}=1`,'')
                    href.href='/categories'+href.href+'&'+word+'=1'
                }
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
    getfilter(res){
        let filter=[]
        let $ = cheerio.load(res.data, {decodeEntities: false}),_this=this;
            let json={
                title:_this.htmlToText($(this).children('span').text()),
                docs:[]
            }
            $('.well-filters .hidden-xs .dropdown-menu:last a').each(function () {
                json.docs.push({
                    title:_this.htmlToText($(this).text()),
                    class:$(this).attr('class'),
                    href:$(this).attr('href'),
                })
            })
            filter.push(json)

        return filter
    },
    async getList(link){
        let list={list:{docs:[]},slide:[]}, _this=this;
        let url,type='';
        if(link.indexOf('categories') > -1){
            type=word
            url=host5f+link.replace('/categories','')
        }else{
            url=host+link
        }
        console.log(url)
        await http.get(url).then(res => {
            list.nav= this.getNav(res)
            list.page= this.getPage(res,type)
            list.filter=this.getfilter(res)
            let $ = cheerio.load(res.data, {decodeEntities: false});
            list.meta={
                title:_this.htmlToText($('title').text()),
                keywords: _this.htmlToText($('[name="keywords"]').attr('content')),
                desc:_this.htmlToText($('[name="description"]').attr('content'))
            }
            $('.col-video').each(function () {
                if(!$(this).find('.vip-text-icon').length){
                    let  _id=$(this).find('a').attr('href').split('/')[2],
                        idType=_id+type,
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
        }).catch(e => console.log(12))
        return  list
    },
    async clubList (url){
        //url=`${porn5fHost}/videos?search_query=${encodeURIComponent(params.id)}?page=${params.p}`

//         url = params.id == 'amateur_factory' ? `${porn5fHost}/videos/amateur-factory?page=${params.p}` : `${porn5fHost}/search/videos/${encodeURIComponent(params.id)}?page=${params.p}`
        await http.get(url).then(res =>{
            let $ = cheerio.load(res.data,{ decodeEntities: false });
            if(!$('.col-video').length){
                return false
            }
            let title =artIconv.artSplit($('title').text())
            Object.assign(index,{
                title:title,
                keywords:artIconv.artSplit($('[name="keywords"]').attr('content')),
                description:artIconv.artSplit($('[name="description"]').attr('content')),
                sign,
                totalDocs:$('.well').find('.text-white').eq($('.well').find('.text-white').length-1).text() || 1,
            })
            index.totalPage=Math.ceil(index.totalDocs/index.limit)
            $('.col-video').each(function () {
                if(!$(this).find('.vip-text-icon').length){
                    let  _id=$(this).find('a').attr('href').split('/')[2]
                    index.docs.push({
                        _id,
                        id:_id,
                        title:$(this).find('img').attr('alt'),
                        img:$(this).find('img').attr('data-original') || $(this).find('img').attr('src'),
                        vod:1,
                        list:[],
                        site:1,
                        href:`${porn5fHost}/video/${_id}/`,
                        view:artIconv.artSplit($(this).find('.stat-views').text().replace(/[^0-9]/gi,'')),
                        time:artIconv.artSplit($(this).find('.film-time').text())
                    })
                }
            })
        }).catch(e => console.log(e))
        return  index
    },
}
//kuhui.listPage()
module.exports = kuhui;
