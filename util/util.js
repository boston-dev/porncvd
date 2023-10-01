const xss = require("xss");
const crypto = require('crypto');
let util={
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
    jsonTpl:{
        code:200,
        msg:'',
        result:{

        }
    },
    md5 (v){
        if(typeof v != 'string'){
            return v
        }
        return  crypto.createHash('md5')
            .update(v).digest('hex');//hex十六进制
    },
    myXss:null,
    xssFn(v){
      if(this.myXss === null){
          this.myXss = new xss.FilterXSS();
      }
      if(typeof v != 'string'){
        return v
      }
      return this.myXss.process(v.trim());
    },
    reg:{
        email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    toTreeData(data,pid){
        function tree(id) {
            let arr = []
            data.filter(item=> {
                console.log(item.parentId +'---'+pid)
                return item.parentId === id;
        }).forEach(item => {
                arr.push({
                    _id: item._id,
                    title: item.title,
                    children: tree(item._id)
                })
            })
            return arr
        }
        return tree(pid)  // 第一级节点的父id，是null或者0，视情况传入
    },
    nav:[
        {
          title:'亞洲自拍',
          href:'/category/asia',
          path:[
            '/videos/asia?o=bw',
            '/videos/th?o=bw',
            '/videos/student?o=bw',
            '/videos/wife?o=bw',
            '/videos/lover?o=bw',
            '/videos/drunk?o=bw',
            '/videos/13-taiwan?o=bw',
            '/videos/14-china?o=bw',
            "/videos/output?o=bw&w=javdove",
            "/videos/stealthie?o=bw&w=javdove",
            "/videos/selfcam?o=bw&w=javdove",
            "/videos/korean?o=bw&w=javdove",
          ],
          site:'5f'
        },
        {
          title:'國產AV',
          href:'/category/domestic',
          path:[
            '/videos/uncensored?o=bw',
            '/videos/hd?o=bw',
            '/videos/domestic?o=bw',
            '/videos/17-cosplay?o=bw',
            '/videos/r18?o=bw',
            '/domestic?o=bw',
            '/videos/creator?o=bw',
            '/videos/carzy?o=bw',
            "/videos/domesticav?o=bw&w=javdove",
            "/videos/japanavgirls?o=bw&w=javdove",
          ],
          site:'5f'
        },
        {
            title:'日本AV',
            href:'/category/japan',
            path:[
                "/videos/gif?o=bw&w=javdove",
                "/videos/outdoor?o=bw&w=javdove",
                "/videos/portfolio?o=bw&w=javdove",
                "/videos/asmr?o=bw&w=javdove",
                "/videos/recommend?o=bw&w=javdove",
                "/videos/anal?o=bw&w=javdove",
                "/videos/cumshot?o=bw&w=javdove",
                "/videos/blowjob?o=bw&w=javdove",
                "/videos/masturbation?o=bw&w=javdove",
                "/videos/tiny-small?o=bw&w=javdove",
                "/videos/creampie?o=bw&w=javdove",
                "/videos/bbw-chubby?o=bw&w=javdove",
                "/videos/ol-officelady?o=bw&w=javdove",
                "/videos/chinese?o=bw&w=javdove",
                "/videos/cowgirl-riding?o=bw&w=javdove",
                "/videos/group-sex-3p?o=bw&w=javdove",
                "/videos/cosplay?o=bw&w=javdove",
                "/videos/javdove?o=bw&w=javdove",
                "/videos/fc2?o=bw&w=javdove",
                "/videos/lesbian?o=bw&w=javdove",
                "/videos/teen?o=bw&w=javdove",
                "/videos/squirting?o=bw&w=javdove",
                "/videos/big-ass?o=bw&w=javdove",
                "/videos/drama?o=bw&w=javdove",
                "/videos/ntr?o=bw&w=javdove",
                "/videos/massage?o=bw&w=javdove",
                "/videos/work?o=bw&w=javdove",
                "/videos/amateur?o=bw&w=javdove",
                "/videos/big-boobs?o=bw&w=javdove",
                "/videos/wife?o=bw&w=javdove",
                "/videos/mature-milf?o=bw&w=javdove",
            ],
            site:'5f'
          },
          {
            title:'无码',
            href:'/category/uncensored',
            path:[
                "/videos/uncensored?o=bw&w=javdove"
            ],
            site:'5f'
            },
        {
            title:'onlyfans专区',
            href:'/category/onlyfans',
            path:[
                "/videos/asiancouplewu?o=bw&w=javdove",
                "/videos/moii-twitter83?o=bw&w=javdove",
                "/videos/psychoporntw?o=bw&w=javdove",
                "/videos/caroandlace?o=bw&w=javdove",
                "/videos/newyearst6?o=bw&w=javdove",
                "/videos/bararungbung?o=bw&w=javdove",
                "/videos/yuahentai-2?o=bw&w=javdove",
                "/videos/shelley55611473?o=bw&w=javdove",
                "/videos/yumi-03?o=bw&w=javdove",
                "/videos/meikoui?o=bw&w=javdove",
                "/videos/mvlust?o=bw&w=javdove",
                "/videos/aeriessteele?o=bw&w=javdove",
                "/videos/fenseqingren?o=bw&w=javdove",
                "/videos/obokozu?o=bw&w=javdove",
                "/videos/onlyfans?o=bw&w=javdove",
            ],
            site:'5f'
          },
        {
            title:'自慰',
            href:'/category/masturbation',
            path:[
              '/videos/diy?o=bw',
              '/videos/boylove?o=bw'
            ],
            site:'5f'
          },
        {
        title:'歐美',
        href:'/category/eu',
        path:[
            '/videos/eu?o=bw',
            "/videos/western?o=bw&w=javdove"
        ],
        site:'5f'
        },
        {
          title:'動畫',
          href:'/category/cartoon',
          path:[
            '/videos/cartoon?o=bw',
            "/videos/hentai?o=bw&w=javdove"
          ],
          site:'5f'
        },
        {
          title:'SM調教',
          href:'/category/bdsm',
          path:[
            '/videos/16-bdsm?o=bw',
            "/videos/bdsm?o=bw&w=javdove",
          ],
          site:'5f'
        },
        {
          title:'台湾',
          href:'/category/taiwan',
          path:[
            '/videos/13-taiwan?o=bw',
          ],
          hidden:true,
          site:'5f'
        },
        {
          title:'大陆',
          href:'/category/area',
          hidden:true,
          path:[
            "/videos/14-china?o=bw",
          ],
          site:'5f'
        },
      ],
    shuffleArray(array){
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }       
}
export default  util
