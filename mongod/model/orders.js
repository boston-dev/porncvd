const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const config = require('../config.json');
//定义模型 确定数据库里表结构
const catsSchema = new mongoose.Schema({
    pid:{type:String,default:''},
    trade_no:{type:String,default:''},
    out_trade_no:{type:String,default:''},
    type:{type:String,default:''},
    name:{type:String,default:''},
    money:{type:Number,default:0},
    trade_status:{type:String,default:''},
    param:{type:String,default:''},//用户ip
    date:{type:Number,default:new Date().getTime()},
});
catsSchema.index({ date: -1 });
catsSchema.plugin(mongoosePaginate);
//再定义model
const catsModel = mongoose.model('orders',catsSchema);

module.exports = catsModel;