
function delay(millisecond) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, millisecond*1000)
    })
}
const javdove = require("./javdove");
const porn5f = require("./porn5f-com");
let  run={
    async init(){
       await javdove.getPage()
        console.log('第一成功')
        //delay(1)
       let page=[
           'https://www.porn5f.com/'
       ]
        // let p=[`https://www.porn5f.com/search/videos/%E5%B0%91%E5%A5%B3?page=`]
        for(let num=1;num <= 3;num++){
            page.push(`https://www.porn5f.com/videos?o=bw&page=${num}`)
        }
        // page=page.reverse()
         for (const [idx, item] of page.entries()) {
            await porn5f.initDetail(item,'/videos/amateur')
             console.log(idx+'---'+page.length)
            await  delay(2)
             console.log(idx+'---'+'stop')
        }


       // await  delay(2)
        console.log('开始翻译')
        await javdove.getAjax()
    }
}
run.init()
