const axios =require('axios')
const fs =require('fs')
const tagAll =require('./tagAll')
const http = axios.create({
    timeout: 60000,
})
let tran={},tag=[]
tagAll.forEach(function (v,k) {
    tran[`${k}`]=v
})
console.log(tagAll)
http.post(`http://localhost:3009/users/tran`,{param:tran}).then(result =>{
    tagAll.forEach(function (v,k) {
        tag[k]=result.data[`${k}`]
    })
    fs.writeFile('./console_en.json', JSON.stringify(tag), function (err) {
        if (err) {
            console.error(err);
        }
        console.log('写入成功!');
    })
})
