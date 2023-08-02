const nodemailer = require("nodemailer");
//goole 降低安全权限，才可以发邮件
//https://accounts.google.com/b/0/DisplayUnlockCaptcha
//https://myaccount.google.com/lesssecureapps?pli=1&rapt=AEjHL4POvn3ZEa3cI0_FG5n-b30Wn3r1bG-NYVnl_M9hm7O61Aa13Q5JbcTRQXS8-zxV0ewDqItzLDZqBkBcOmiNj43j6sC1Jg
const mailer = {
    async main(opt){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:'bostonzhang725@gmail.com',
                pass: '/X123456'
            }
        });
        let mailOptions = {
            from:'bostonzhang725@gmail.com',
            to: `1660094871@qq.com;${opt.to}`,
            subject: opt.subject,
            text:opt.text
        };
       return  new Promise((resolve, reject) => {
           transporter.sendMail(mailOptions,  (e,info) =>{
               console.log(e,info)
               let data={
                   code:200,
                   msg:`发送邮件成功`,
                   result:{
                       email:mailOptions.to
                   }
               }
               if(e){
                   data.code=400
                   data.msg='发送邮件失败'
               }
               resolve(data)
           })
        })

    }
}
module.exports = mailer;

