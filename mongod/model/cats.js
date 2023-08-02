const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
//定义模型 确定数据库里表结构
const catsSchema = new mongoose.Schema({
    title: {type:String,default:''},
    title_en: {type:String,default:''},
    href: {type:String,default:''},
});
catsSchema.index({ title: -1 });
catsSchema.plugin(mongoosePaginate);
//再定义model
const catsModel = mongoose.model('cats',catsSchema);

module.exports = catsModel;

