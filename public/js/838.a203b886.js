"use strict";(self["webpackChunksugar_day"]=self["webpackChunksugar_day"]||[]).push([[838],{3838:function(t,e,s){s.r(e),s.d(e,{default:function(){return n}});s(7658);var a=function(){var t=this,e=t._self._c;return e("div",[t.video.url?e("el-row",{attrs:{gutter:10}},[e("el-col",{staticClass:"mb-12",attrs:{xs:24}},[e("h1",{staticClass:"video-title"},[t._v(t._s(decodeURIComponent(t.video.title)))]),e("PlayerVideo",{staticClass:"m-b-8",attrs:{video:t.video}}),e("p",{staticClass:"flex-wrap d-flex"},t._l(t.video.tag,(function(s,a){return e("el-tag",{key:a,attrs:{size:"medium"},on:{click:function(e){return t.$router.push(`/cat/${s}/`)}}},[t._v(t._s(s))])})),1)],1)],1):t._e(),e("LayoutList",{attrs:{docs:t.video.docs}})],1)},i=[],r=s(3181),o={name:"DetailView",data(){return{id:this.$route.params.id,path:this.$route.path,video:{}}},methods:{async queryApplyInfo(){const[t,e]=await r.Z.queryApplyInfo(this.path);t||(this.video={...e.video,url:`${e.video.url}`})}},async created(){await this.queryApplyInfo()}},u=o,l=s(1001),d=(0,l.Z)(u,a,i,!1,null,"14d93647",null),n=d.exports}}]);
//# sourceMappingURL=838.a203b886.js.map