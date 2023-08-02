const axios =require('axios')
const request = require('request');
const PAYPAL_OAUTH_API = global.paypal && `${global.paypal.PAYPAL_API}/v1/oauth2/token/`;
const PAYPAL_ORDER_API = global.paypal && `${global.paypal.PAYPAL_API}/v2/checkout/orders/`;
const http = axios.create({
    timeout: 60000,
})
http.requestPost=async () =>{
   return  new Promise(resolve => {
        request.post({
            uri: PAYPAL_OAUTH_API,
            headers: {
                "Accept": "application/json",
                "Accept-Language": "en_US",
                "content-type": "application/x-www-form-urlencoded"
            },
            auth: {
                'user': global.paypal.client_id,
                'pass': global.paypal.client_secret,
            },
            form: {
                "grant_type": "client_credentials"
            }
        }, function(error, response, body) {
            let  data={
                code:400
            }
           // console.log(error,response.statusCode,12)
            if(!error){
                Object.assign(data,{
                    result:JSON.parse(body),
                    code:200
                })
            }
            resolve(data)
        });
    })
}
http.vaidOrder=async (orderId='6XF90343CM8026149') =>{
    let result = {}
    let authResult= await http.requestPost(PAYPAL_OAUTH_API)
    if(authResult.code !== 200) return  authResult
    result= authResult.result
    console.log(result)
    result = await http.get(PAYPAL_ORDER_API + orderId, {
        headers: {
            Accept:        `application/json`,
            Authorization: `Bearer ${ result.access_token }`
        }
    }).then(v =>{
        return {
            code:200,
            result:v.data
        }
    }).catch(v =>{
        return {
            code:400,
            result:v.data
        }
    })
    return result
}
module.exports = http;
