"use strict";(self["webpackChunksugar_day"]=self["webpackChunksugar_day"]||[]).push([[671],{3671:function(t,e,i){i.r(e),i.d(e,{default:function(){return c}});var s=function(){var t=this,e=t._self._c;return e("div",[t.video.url?e("el-row",{attrs:{gutter:10}},[e("el-col",{staticClass:"mb-12",attrs:{xs:24}},[e("h1",{staticClass:"video-title"},[t._v(t._s(t.video.title))]),e("PlayerVideo",{staticClass:"m-b-8",attrs:{video:t.video}}),e("p",{staticClass:"flex-wrap d-flex"},t._l(t.video.tag,(function(i,s){return e("el-tag",{key:s,attrs:{size:"medium"},on:{click:function(e){return t.open(i)}}},[t._v(t._s(i))])})),1)],1)],1):t._e(),e("LayoutList",{attrs:{docs:t.video.docs}})],1)},a=[],r=(i(560),i(3181)),o=i(1797),n={name:"DetailView",data(){return{id:this.$route.params.id,path:this.$route.path,video:{}}},methods:{open(t){window.location.href=`/cat/${t}`},async queryApplyInfo(){const[t,e]=await r.Z.queryApplyInfo(this.path);if(t)return;this.video={...e.video,url:`${e.video.url}`};let i=o.Z.getToken("view");i=i?JSON.parse(i):[],i.includes(this.video._id)||(i.push(this.video._id),o.Z.setToken("view",JSON.stringify(i)))}},async created(){await this.queryApplyInfo()}},l=n,u=i(1001),d=(0,u.Z)(l,s,a,!1,null,"15784a16",null),c=d.exports}}]);
//# sourceMappingURL=671.9afbd0b3.js.map