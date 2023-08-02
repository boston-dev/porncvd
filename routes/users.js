var express = require('express');
//https://developer.paypal.com/docs/archive/checkout/how-to/server-integration/
var router = express.Router();
var cors = require('cors')
const controller = require('../mongod/controller');
const nodemailer = require('../db/nodemailer');
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: process.env.NODE_ENV === 'development' ? "sandbox" : 'live', //sandbox or live
  client_id:
      process.env.NODE_ENV === 'development'?
    "AbRKegK2GX17hlrUCrn0EKN4hFhOSmHHH1OHG9Uw_nVWPktDJqrSLdi8JLAeJ0QDYm1u95b5ENme28he":
     "AfswxMZmjC9gryI3YN0PdnRM_CLJ_NYShLoaVEMhse0i4GxHm4wh6DvjU3pZWoUlzCuacj0BLbl94KHP"
     ,
  client_secret:
      process.env.NODE_ENV === 'development'?
          "EEluyZU1HUUt8opsaKj8kbeLTEB_6GW_bgwyDAV3pbxbcRLIcQF43d_O1cR5y59aBIU73pFbnf23Jx2v":
          "EHHs-91f0zoAcL18j05ZdZp_9ObaFufvJtuKsZs7wVxgswKVjAWBtqr2uIlCEry-dmZnLBB1gBnwpBOV"
});

console.log( process.env.NODE_ENV === 'development' ? "sandbox" : 'live',123)
const host=process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : process.env.NODE_ENV.HOST
function GetQueryString(url,name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = url.match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
const config = require('../mongod/config.json');
/* GET users listing. */
router.get('/', function(req, res, next) {
 let client_id=
      process.env.NODE_ENV === 'development'?
    "AbRKegK2GX17hlrUCrn0EKN4hFhOSmHHH1OHG9Uw_nVWPktDJqrSLdi8JLAeJ0QDYm1u95b5ENme28he":
     "AfswxMZmjC9gryI3YN0PdnRM_CLJ_NYShLoaVEMhse0i4GxHm4wh6DvjU3pZWoUlzCuacj0BLbl94KHP";
  res.render('pay',{client_id});
});
router.post('/resource', async (req, res, next) => {
  let obj=req.body
  let result=  await controller.init('javsModel','findOne',{'id':obj.id})
  if(!result.result){
    result= await controller.init('javsModel','create',obj)
  }else{
    result= await controller.init('javsModel','updateMany',{'id':obj.id},{$set:obj})
  }

  res.send(result)
});
router.post("/pay", (req, res) => {
  if(!req.body.sku || !req.body.price){
   return res.send({
      code:400,
      msg:'错误'
    })
  }
  let currency=req.body.currency || "USD", saveDate={
    sku: req.body.sku,
    price: req.body.price,
    currency
  };
  if(process.env.NODE_ENV !== 'development'){
    saveDate.ip=res.locals.ip
  }
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `${host}/users/success`,
      cancel_url: `${host}/users/cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: req.body.sku,
              ...saveDate,
              quantity: 1,
            },
          ],
        },
        amount: {
          currency,
          total: req.body.price,
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, async (error, payment) => {
    if (error) {
     // throw error;
      return res.send({
        code:400,
        msg:'paypal错误',
        ...error
      })
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
         let token= GetQueryString(payment.links[i].href.replace(/.+\?/gi,''),'token')
         if(!token){
            return res.send({
              code:400,
              msg:'paypal错误'
            })
          }
         saveDate.token=token
         let result= await controller.init('ordersModel','create',saveDate)
         console.log(result)
          if(result.code !== 200){
            return res.send(result)
          }
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/success", async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  let data= await controller.init('ordersModel','findOne',{token})
  if(data.code !== 200 || !data.result){
    return res.send({
      code:400,
      msg:'paypal错误'
    })
  }
  let {result}=data
  if(result.finish){
    return res.send(result)
  }
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: result.currency,
          total: result.price,
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, async (
    error,
    payment
  ) =>{
    if (error) {
      //console.log(error.response);
      return res.send({
        code:400,
        msg:'paypal错误'
      })
     // throw error;
    } else {
      //console.log(JSON.stringify(payment));
      let idx=res.locals.ordersList.findIndex(item => item.price === result.price)
      if(idx < 0){
        return res.send({
          code:400,
          msg:'paypal错误,查询不到价格'
        })
      }
      let date=Date.now()
      let client= await controller.init('ordersModel','updateMany',{token},{
        date,
        dateEnd:date+3600000*res.locals.ordersList[idx].long,
        finish:true
      })
      res.send(client);
    }
  });
});

router.get("/cancel",async (req, res) => {
  const token = req.query.token;
  await controller.init('ordersModel','remove',{token})
  res.send("Cancelled")
});
router.post("/create",async (req, res) => {
  const details = req.body
  let idx=res.locals.ordersList.findIndex(item => details.purchase_units[0] && +details.purchase_units[0].amount.value === +item.price)
  if(idx < 0 || !req.cookies._gid){
    return res.send({
      code:400,
      msg:'paypal错误,查询不到价格'
    })
  }
  let long=res.locals.ordersList[idx].long, date=Date.now();
  let data={
    id:details.id,
    email_address:details.payer && details.payer.email_address || details.id,
    price:details.purchase_units[0] && details.purchase_units[0].amount.value,
    currency_code:details.purchase_units[0] && details.purchase_units[0].amount.currency_code,
    long,
    date,
    dateEnd:date+86400000*long
  }
  if(process.env.NODE_ENV !== 'development'){
    data.ip=res.locals.ip
  }
  let docs= await controller.init('ordersModel','findOne',{id:details.id})
  if(docs.result && docs.result._id){
    return res.send(docs)
  }
  let result= await controller.init('ordersModel','create',data)
  result=JSON.parse(JSON.stringify(result))
  result.result.end=long
  if(result.code === 200 && result.result && result.result._id){
    res.cookie('orders_id', result.result.id, { expires:  new Date(Date.now() + 100000000*100000),path: '/' , httpOnly: false});
  }
  if(data.email_address && data.email_address.indexOf('@') > -1){
    console.log(data.email_address,`VIP ${long}day ,訂單號(orders)為 ${data.id}`)
    nodemailer.main({
      to:data.email_address,
      subject:`下单成功`,
      text:`VIP ${long}day ,訂單號(orders)為 ${data.id}`
    })
  }
  let msg=res.locals.tplLang ? `The payment is successful, VIP ${long} days, the order number has been sent to the mailbox: ${data.email_address}`:
      `支付成功，VIP ${long}天，訂單號已發送至郵箱：${data.email_address}`;
  result.msg=msg
  res.send(result)
});
router.post("/vaid",async (req, res) => {
  let id=req.body.id || req.cookies.orders_id
  console.log(req.body,666)
  if(req.body.m === 'false'){
    res.locals.ordersList=res.locals.ordersListpC
  }
  if(!id || !req.cookies._gid){
    return  res.render('include/pay.html');
  }
  id=id.trim()
  let docs= await controller.init('ordersModel','findOne',{id})
  docs=JSON.parse(JSON.stringify(docs))
  let {result}=docs

  if(result && result._id){
    let end=docs.result.dateEnd-Date.now()
    if(end > 0){
      end=end/86400000
      Object.assign(docs.result,{
        end:(end+'').match(/[0-9]+\.[0-9]/gi)[0]
      })
      res.cookie('orders_id', result.id, { expires:  new Date(Date.now() + 100000000*100000),path: '/' , httpOnly: false});
      return res.send(docs)
    }
  }
  res.cookie('orders_id', '', {expires: new Date(0)});
  return  res.render('include/pay.html');

});
router.get("/game.html",async (req, res) => {
 res.render('game')
});
router.get("/pay.html",async (req, res) => {
  res.render('pay')
});
router.post("/success.html",async (req, res) => {
  console.log(req.body)
  res.send(req.query)
});
router.get("/checkOrder.html",async (req, res) => {
  let docs= await controller.init('ordersModel','paginate',req.query)
  res.send(docs)
});
router.post("/checkOrder.html",async (req, res) => {
   let {query}=req.body
  let docs= await controller.init('ordersModel','paginate',query || {})
  res.send(docs)
});
module.exports = router;
