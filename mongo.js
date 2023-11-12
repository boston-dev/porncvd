const mongoose = require('mongoose');
const javsModel = require('./mongod/model/javs');
const ordersModel = require('./mongod/model/orders');
const catsModel = require('./mongod/model/cats');
const controller = require('./mongod/controller');
mongoose.connect('mongodb://localhost:27017/zhLand', {
    useNewUrlParser: true,
    useUnifiedTopology: true  }).then(res => console.log('zhLand'))
controller.init('ordersModel','create',{
    pid:'123',
    trade_no:'123',
    out_trade_no:'123',
    type:'123',
    name:'123',
    money:123,
    trade_status:'123',
    param:'123',
    date:123,
}).then(result =>{
    console.log(result)
})