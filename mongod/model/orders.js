const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const config = require('../config.json');
//定义模型 确定数据库里表结构
const catsSchema = new mongoose.Schema({
    id: {type:String,required: true},
    email_address: {type:String,required: true},
    price: {
        type:Number,
        required: true
    },
    currency_code: {type:String,required: true},
    date:{type:Number,default:null},
    dateEnd:{type:Number,default:null},
    long:{type:Number,required: true},
    ip: {type:String,default:''},
});
catsSchema.index({ token: -1 });
catsSchema.index({ ip: -1 });
catsSchema.index({ id: -1 });
catsSchema.plugin(mongoosePaginate);
//再定义model
const catsModel = mongoose.model('orders',catsSchema);

module.exports = catsModel;

// validate: {
//     validator: function(v) {
//         if(config.ordersList.findIndex(item => +item.price === +v) > -1){
//             return true
//         }
//         return false
//     },
//     message: '价格错误'
// }