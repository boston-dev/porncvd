const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
//定义模型 确定数据库里表结构

const javsSchema = new mongoose.Schema({
    title:{type:String,default:''},
    title_en:{type:String,default:''},
    keywords:{type:String,default:''},
    keywords_en:{type:String,default:''},
    desc:{type:String,default:''},
    desc_en:{type:String,default:''},
    site:{type:String,default:''},
    img:{type:String,default:''},
    id:{type:String,default:''},
    tran:Number,
    uri:{type:String,default:''},
    url:{type:String,default:''},
    relate:{type:Array,default:[]},
    cat:{type:mongoose.Schema.Types.ObjectId,ref:'cats'},//所属分类
    date:{type:Number,default:new Date().getTime()},
    vipView:{type:Number,default:0},
    tag:{type:Array,default:[]},
    type:{type:String,default:''},
    path:{type:String,default:''},
    disable:{type:Number,default:0},
    source:{type:String,default:''},
});
javsSchema.index({ path: -1 });
javsSchema.index({ title: -1 });
javsSchema.index({ type: -1 });
javsSchema.index({ id: -1 ,site: -1});
javsSchema.index({ site: -1 });
javsSchema.index({ date: -1 });
javsSchema.index({ cat: -1 });
javsSchema.index({ vipView: -1 });
javsSchema.index({ tag: -1 });
javsSchema.index({ disable: -1 });
javsSchema.plugin(mongoosePaginate);
//再定义model inosmi.ru
const javsModel = mongoose.model('javs',javsSchema);

module.exports = javsModel;

