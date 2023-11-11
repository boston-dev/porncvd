const mongoose = require('mongoose');
const javsModel = require('./mongod/model/javs');
const ordersModel = require('./mongod/model/orders');
const catsModel = require('./mongod/model/cats');
const controller = require('./mongod/controller');
mongoose.connect('mongodb://localhost:27017/zhLand', {
    useNewUrlParser: true,
    useUnifiedTopology: true  }).then(res => console.log('zhLand'))
controller.init('javsModel','remove',{
},{disable:1}).then(result =>{
    console.log(result)
})