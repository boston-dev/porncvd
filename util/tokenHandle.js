const jwt = require('jsonwebtoken')
import util from '../util/util'
let tokenHandle={
    signkey:'nuxt-90', // 密匙
    setToken(user) {
        // username:'sdsdsd',
        // _id:'sdsd8986',
        // ip:'1478'
        if(process.env.NODE_ENV === 'development'){
            delete user.ip
        }
        return new Promise((resolve,reject)=>{
            const token = jwt.sign(user,this.signkey,{ expiresIn:'64d' });
            resolve(token);
        })
    },
    verToken(keyJson){
        return new Promise((resolve,reject)=>{
             jwt.verify(keyJson.token,this.signkey, (err, info) => {
                 let {jsonTpl}=util
                 // || (info.ip && info.ip !== keyJson.ip)
                 if (err){
                     resolve({
                         ...jsonTpl,
                         code:301,
                         msg:'信息无效'
                     });
                     return false
                 }
                 resolve({
                     ...jsonTpl,
                     code:200,
                     msg:'信息有效',
                     result:{
                         ...info,
                     }
                 });
             })

        })
    }
}
export default  tokenHandle
