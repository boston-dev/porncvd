const controller = require('../mongod/controller');
const config = require('../mongod/config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const { responeTpl } = config
const code = require("svg-captcha");



const middle = {
    createCode() {
        return code.create({
            size: 4,
            ignoreChars: "0o1iIl",
            noise: 3,
            color: true,
            background: "#fff",
            fontSize: 60
        });
    },
    setToken(user) {
        return new Promise((resolve, reject) => {
            const token = jwt.sign(user, config.secret, { expiresIn: '1d' });
            resolve(token);
        })
    },
    verToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.secret, (err, info) => {
                if (err) {
                    resolve({
                        ...responeTpl,
                        code: 301,
                        msg: '信息无效'
                    });
                    return false
                }
                resolve({
                    ...responeTpl,
                    msg: '信息有效',
                    data: {
                        ...info,
                    }
                });
            })

        })
    },
    async initData(req, res, next) {
        res.locals.meta = {

        }
        next();
    },
    async checkAdmin(req, res, next) {
        if (req.session.user && req.session.user.admin === 1) {
            next();
        } else {
            return res.redirect('/');
        }
    },
    async checkLogin(req, res, next) {
        if (req.session.user) {
            const { globalMiddle, globalController, globalConfig } = res.locals
            let result = await globalController.init('usersModel', 'findOne', {
                _id: req.session.user._id
            })
			
            if (result.code !== 20000) {
				req.session.user  = null;
                return res.redirect('/user/login.html');
            }
            if (result.data.disable) {
				//req.session.user  = null;
                //return  res.redirect('/user/login.html?errorMsg=账号已被禁用');
				return  res.redirect('https://www.youtube.com');
            }
            next();
        } else {
            return res.redirect('/user/login.html');
        }
    },
    checkNotLogin(req, res, next) {
        //要求下面的路由必须未登录后才能访问
        if (req.session.user) {
            return res.redirect('/')
        } 
		next();
    },
    replaceNull(str = '', d = 'lr') {
        if (typeof str !== "string") {
            return str
        }
        if (d == 'lr') {
            //去除两头空格:
            return str.replace(/\s+/g, "")
        }
        if (d == 'l') {
            //去除左空格
            return str.replace(/^\s+|\s+$/g, "");
        }
        if (d == 'l') {
            //去除右空格
            return str.str.replace(/^\s/, '');
        }
        if (d == 'all') {
            //去除所有空格
            return str.replace(/(\s$)/g, "");
        }
    },
    md5(str) {
        return crypto.createHash('md5')
            .update(str).digest('hex'); //hex十六进制
    },
    dataType(d, type) {
        //type=String Number Boolean Undefined Null Object Function Array Date RegExp
        console.log(Object.prototype.toString.call(d), `[object ${type}]`)
        return Object.prototype.toString.call(d) === `[object ${type}]`
    },
    getCurrDate() {
        let date = new Date();
        let sep = "-";
        let year = date.getFullYear(); //获取完整的年份(4位)
        let month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
        let day = date.getDate(); //获取当前日
        if (month <= 9) {
            month = "0" + month;
        }
        if (day <= 9) {
            day = "0" + day;
        }
        let currentdate = year + sep + month + sep + day;
        return currentdate;
    },
	sliceArray(array, size){
		var result = []
		for (let x = 0; x < Math.ceil(array.length / size); x++) {
			let start = x * size
			let end = start + size
			result.push(array.slice(start, end))
		}
		return result
	}
}
module.exports = middle