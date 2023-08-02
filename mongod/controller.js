const catsModel = require('./model/cats');
const newsModel = require('./model/news');
const javsModel = require('./model/javs');
const ordersModel = require('./model/orders');
const model={catsModel,newsModel,javsModel,ordersModel}
const ejs = require('ejs')
const config= require('./config');
const {responeTpl} = config;
const Crawler = require("crawler");
const path = require('path');
const fs = require('fs');
const ways=['find','updateAll','findOne','paginate','create','aggregate','updateMany','remove','aggregate']
const date =() =>{
    var date = new Date();
    var nowMonth = date.getMonth() + 1;
    var strDate = date.getDate();
    var seperator = "-";
    if (nowMonth >= 1 && nowMonth <= 9) {
        nowMonth = "0" + nowMonth;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;
    return nowDate
}

const comCotroller = {
    async init(modelName='',way='',query={},option={},upsert={}){
        const initModel=this.getModel(modelName);
        if(initModel.code === 400){
            return responeTpl
        }

        if(!ways.includes(way)){
            return {
                ...responeTpl,
                code:400,
                msg:'不存在方法'
            }
        }
        let data={ ...responeTpl,}
        if(way === 'find'){
            data = await this.find(initModel,query,option)
        }
        if(way === 'paginate'){
            data = await this.paginate(initModel,query,option)
        }
        if(way === 'findOne'){
            data = await this.findOne(initModel,query,option)
        }
        if(way === 'updateMany'){
            data = await this.updateMany(initModel,query,option,upsert)
        }

        if(way === 'create'){
            data = await this.create(initModel,query,option)
        }
        if(way === 'remove'){
            data = await this.remove(initModel,query,option)
        }
        if(way === 'aggregate'){
            data = await this.aggregate(initModel,query,option)
        }
        if(way === 'updateAll'){
            data = await this.updateAll(initModel,query,option)
        }
        return  data
        //.findOne({book:bookJson.book,user:user._id,type:2,title: bookJson.title}).populate('books')
    },
    async updateMany(model,query,option,upsert){
        return new Promise((resolve, reject) => {
            model.updateOne(query,option,upsert,(e,d) =>{
                if(e){

                    return resolve({
                        ...responeTpl,
                        code:400,
                    })
                }
                resolve({
                    ...responeTpl,
                    result:d
                })
            })
        })
    },
    async updateAll(model,query,option,upsert){
        return new Promise((resolve, reject) => {
            console.log(query,option)
            model.updateMany(query,option,(e,d) =>{
                if(e){

                    return resolve({
                        ...responeTpl,
                        code:400,
                    })
                }
                resolve({
                    ...responeTpl,
                    result:d
                })
            })
        })
    },
    async aggregate(model,query,option){
        return new Promise((resolve, reject) => {
            model.aggregate(query).exec((err, result) => {
                resolve({
                    ...responeTpl,
                    result
                })
            })
        })
    },
    async create(model,query,option){
        return new Promise((resolve, reject) => {
            model.create(query,(e,d) =>{
                if(e){
                    console.log(e)
                    return resolve({
                        ...responeTpl,
                        code:400,
                    })
                }
                resolve({
                    ...responeTpl,
                    result:d
                })
            })
        })
    },
    async findOne(model,query,option){
        return new Promise((resolve, reject) => {
            model.findOne(query,(e,d) =>{
                if(e){

                    return resolve({
                        ...responeTpl,
                        code:400,
                        result:{}
                    })
                }
                resolve({
                    ...responeTpl,
                    result:d
                })
            })
        })
    },
    async paginate(model,query,option){
        let data =await model.paginate(query,option)
        let sub=[],size=3;
        data.range=[{
            href:'',
            class:'active',
            text:data.page
        }]
        for(let num=data.page +1; num <= data.page+size; num ++){
            if(num <= data.totalPages){
                data.range.push({
                    href:option.prelink ? option.prelink.replace('pageTpl',num) : '',
                    text:num
                })
            }
        }
        for(let num=data.page -size; num < data.page; num ++){
            if(num >0){
                sub.push({
                    href:option.prelink ? option.prelink.replace('pageTpl',num) : '',
                    text:num
                })
            }
        }
        data.range=[...sub,...data.range]
        if(data.range.findIndex(v =>v.text == data.totalPages) < 0){
            data.range.push({
                href:option.prelink ? option.prelink.replace('pageTpl',data.totalPages) : '',
                text:data.totalPages
            })
        }
        if(data.range.findIndex(v =>v.text == 1) < 0){
            data.range.unshift({
                href:option.prelink ? option.prelink.replace('pageTpl',1) : '',
                text:1
            })
        }
        return {
            ...responeTpl,
            result:data
        }
    },
    async remove(model,query,option){
    return new Promise((resolve, reject) => {
        model.remove(query,(e,d) =>{
            if(e){

                return resolve({
                    ...responeTpl,
                    code:400,
                    result:{}
                })
            }

            resolve({
                ...responeTpl,
                result:d
            })
        })
    })
},
    getModel(modelName){
        if(model[modelName]){
            return model[modelName]
        }
        return {
            ...responeTpl,
            code:400,
            msg:'不存在数据'
        }
    },
    async find(model,query){
        return new Promise((resolve, reject) => {
            model.find(query,(e,d) =>{
                if(e){
                    return resolve({
                        ...responeTpl,
                        code:400,
                    })
                }
                resolve({
                    ...responeTpl,
                    result:d
                })
            })
        })
    },

    async muchImg(linkArr){
        let pic=[]
        var c = new Crawler({
            encoding:null,
            jQuery:false,// set false to suppress warning message.
            callback:function(err, res, done){
                if(err){
                    console.error(err.stack);
                }else{
                    let day=date()
                   let upload= path.join(__dirname,`../public/upload/`) ;
                    fs.createWriteStream(`${upload}/${res.options.filename}`).write(res.body);
                    pic.push(`/upload/${res.options.filename}`)
                }
                done();
            }
        });
        c.queue(linkArr);
        return new Promise((resolve, reject) => {
            c.on('drain', () => {
                resolve(pic)
                console.log('img ---- ok')
            });
        })
    },
    async delay(millisecond){
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, millisecond*1000)
        })
    },
    async renderFile(path,data){
        return new Promise(resolve => {
            ejs.renderFile(path, data, {}, function(err, str){
                console.log(err)
                if(err){
                    resolve('')
                }else{
                    resolve('')
                }
            });
        })
    }
}
module.exports = comCotroller;
