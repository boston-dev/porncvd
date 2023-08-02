const mongoose = require('mongoose');
const javsModel = require('./mongod/model/javs');
const ordersModel = require('./mongod/model/orders');
const catsModel = require('./mongod/model/cats');
const controller = require('./mongod/controller');
mongoose.connect('mongodb://localhost:27017/porn5f', {
    useNewUrlParser: true,
    useUnifiedTopology: true  }).then(res => console.log('porn5f'))

   

controller.init('javsModel','remove',{
  _id:{$in:['61e83057cacc450ab44ae489','647a66d411d1d527db0fc033','63d4bf22dad5e995cfc5c330','64b07c43d00dd42c10cb9be2','64b07c43d00dd42c10cb9be2']
}
},{disable:1}).then(result =>{
    console.log(result)
})