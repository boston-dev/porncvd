const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
//定义模型 确定数据库里表结构
const newsSchema = new mongoose.Schema({
    title:String,
    keywords:String,
    desc:String,
    site:String,
    img:String,
    id:String,
    href:String,
    cat:{type:mongoose.Schema.Types.ObjectId,ref:'cats'},//所属分类
    time:{type:Number,default:new Date().getTime()},
});
newsSchema.index({ title: -1 });
newsSchema.index({ id: -1 ,site: -1});
newsSchema.index({ site: -1 });
newsSchema.index({ time: -1 });
newsSchema.plugin(mongoosePaginate);
//再定义model inosmi.ru
const newsModel = mongoose.model('news',newsSchema);

module.exports = newsModel;

