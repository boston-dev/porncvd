"use strict";(self["webpackChunksugar_day"]=self["webpackChunksugar_day"]||[]).push([[434],{3434:function(t,e,r){r.r(e),r.d(e,{default:function(){return c}});var s=function(){var t=this,e=t._self._c;return e("div",{staticClass:"result-list center-center"},[e("el-button",{attrs:{type:"primary",loading:!0}},[t._v("正在验证支付结果，请勿关闭页面")])],1)},u=[],a=(r(7658),r(3181)),n=r(1797),o={name:"ResultView",data(){return{show:!1}},computed:{},methods:{async queryApplyInfo(){const t=this.$route.query.trade_no,[e]=await a.Z.vaidOrder({trade_no:t});if(e)return void this.$router.push("/");t&&this.$store.commit("setTradeNo",t);const r=n.Z.getToken("buyId");r&&this.$router.push(`/javs/${r}.html`)}},created(){this.queryApplyInfo()}},i=o,d=r(1001),l=(0,d.Z)(i,s,u,!1,null,"73eafd46",null),c=l.exports}}]);
//# sourceMappingURL=434.05f11018.js.map