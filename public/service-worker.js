if(!self.define){let s,e={};const n=(n,l)=>(n=new URL(n+".js",l).href,e[n]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=n,s.onload=e,document.head.appendChild(s)}else s=n,importScripts(n),e()})).then((()=>{let s=e[n];if(!s)throw new Error(`Module ${n} didn’t register its module`);return s})));self.define=(l,r)=>{const i=s||("document"in self?document.currentScript.src:"")||location.href;if(e[i])return;let o={};const u=s=>n(s,i),c={module:{uri:i},exports:o,require:u};e[i]=Promise.all(l.map((s=>c[s]||u(s)))).then((s=>(r(...s),o)))}}define(["./workbox-d6430d1c"],(function(s){"use strict";s.setCacheNameDetails({prefix:"sugar-day"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"/css/488.bd22ffa3.css",revision:null},{url:"/css/808.1bb84175.css",revision:null},{url:"/css/825.c744e589.css",revision:null},{url:"/css/862.a26dab6a.css",revision:null},{url:"/css/app.b8fdf657.css",revision:null},{url:"/css/chunk-vendors.e047419f.css",revision:null},{url:"/fonts/element-icons.f1a45d74.ttf",revision:null},{url:"/fonts/element-icons.ff18efd1.woff",revision:null},{url:"/index.html",revision:"c3ca98b00bdfb93849f2b07c4ea86d38"},{url:"/js/488.001bf25f.js",revision:null},{url:"/js/808.1eec107c.js",revision:null},{url:"/js/825.72f6d533.js",revision:null},{url:"/js/862.2b69e98b.js",revision:null},{url:"/js/app.125e6e64.js",revision:null},{url:"/js/chunk-vendors.4d631e1c.js",revision:null},{url:"/manifest.json",revision:"be9781465bb42fdddabb7a4d6e8f1cb8"},{url:"/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map
