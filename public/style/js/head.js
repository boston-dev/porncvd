var isPhone=navigator.userAgent.match(/Android|webOS|iPhone|iPod|iPad|BlackBerry|Mobile/i)!=null;var isWechat=navigator.userAgent.match(/MicroMessenger/i)!=null;var isPad=navigator.userAgent.match(/PAD|iPad/i)!=null;var isPlay=location.search;var play_type="",poster="",vid="",pid="",id="",sTime="",next_url="";var ref=window.location.href;!(function(doc,win){var el=doc.documentElement;function setSize(){var w=el.clientWidth;if(!w)return;w=w>480?480:w;w=w<320?320:w;el.style.fontSize=(100*(w/1080)).toFixed(3)+'px';}
if(!doc.addEventListener)return;setSize();win.addEventListener('resize',setSize,false);win.addEventListener('pageshow',function(e){if(e.persisted){setSize();}},false);})(document,window);