"use strict";(self["webpackChunksugar_day"]=self["webpackChunksugar_day"]||[]).push([[1],{2079:function(e,t,s){s.r(t),s.d(t,{default:function(){return d}});var r=function(){var e=this,t=e._self._c;return t("div",{staticClass:"result-list center-center"},[t("el-button",{attrs:{type:"primary",loading:!0}},[e._v("正在验证支付结果，请勿关闭页面")]),t("el-dialog",{staticClass:"buy-vip-dialog",attrs:{title:"保存好订单号，丢失无法找回","modal-append-to-body":!0,"append-to-body":!0,visible:e.copyVisible,"close-on-click-modal":!1,width:e.isMobile?"98%":"40%"},on:{"update:visible":function(t){e.copyVisible=t}}},[t("div",[t("el-form",{ref:"ruleForm",staticClass:"demo-ruleForm",attrs:{"status-icon":""}},[t("el-form-item",{staticClass:"check-vip"},[t("el-input",{model:{value:e.orders.out_trade_no,callback:function(t){e.$set(e.orders,"out_trade_no","string"===typeof t?t.trim():t)},expression:"orders.out_trade_no"}}),t("el-button",{directives:[{name:"clipboard",rawName:"v-clipboard:copy",value:e.orders.out_trade_no,expression:"orders.out_trade_no",arg:"copy"},{name:"clipboard",rawName:"v-clipboard:success",value:e.onCopy,expression:"onCopy",arg:"success"},{name:"clipboard",rawName:"v-clipboard:error",value:e.onError,expression:"onError",arg:"error"}],attrs:{type:"primary"}},[e._v("复制")])],1)],1)],1)])],1)},o=[],i=(s(560),s(3181)),a=s(1797),n={name:"ResultView",data(){return{show:!1,copyVisible:!1,out_trade_no:this.$route.query.out_trade_no}},computed:{orders(){return this.$store.state.orders},isMobile(){return this.$store.state.isMobile}},methods:{sleep(e){return new Promise((t=>{setTimeout((()=>{t()}),1e3*e)}))},onCopy(e){this.$message({message:`复制成功：${e.text}`,type:"success"}),this.copyVisible=!1;const t=a.Z.getToken("buyId");t&&this.$router.push(`/javs/${t}.html`)},onError(){this.$message({message:"复制失败",type:"error"})},async queryApplyInfo(){const e=this.out_trade_no;if(!e)return void this.$router.push("/");const[t,s]=await i.Z.vaidOrder({out_trade_no:e});if(t)return this.$store.commit("clearOrders"),void this.$router.push("/");const{result:r}=s;this.$store.commit("setOrders",r),this.copyVisible=!0,this.$message({message:"您已开通VIP，可观看所有视频",type:"success"})}},async created(){await this.sleep(4),this.queryApplyInfo()}},u=n,l=s(1001),c=(0,l.Z)(u,r,o,!1,null,"00258ffa",null),d=c.exports}}]);
//# sourceMappingURL=1.06666dfa.js.map