if(!self.define){let s,e={};const n=(n,l)=>(n=new URL(n+".js",l).href,e[n]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=n,s.onload=e,document.head.appendChild(s)}else s=n,importScripts(n),e()})).then((()=>{let s=e[n];if(!s)throw new Error(`Module ${n} didn’t register its module`);return s})));self.define=(l,r)=>{const i=s||("document"in self?document.currentScript.src:"")||location.href;if(e[i])return;let o={};const u=s=>n(s,i),c={module:{uri:i},exports:o,require:u};e[i]=Promise.all(l.map((s=>c[s]||u(s)))).then((s=>(r(...s),o)))}}define(["./workbox-d6430d1c"],(function(s){"use strict";s.setCacheNameDetails({prefix:"sugar-day"}),self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"/css/434.f10da7be.css",revision:null},{url:"/css/746.d6837942.css",revision:null},{url:"/css/792.a26dab6a.css",revision:null},{url:"/css/89.3a17297f.css",revision:null},{url:"/css/app.84fe3f30.css",revision:null},{url:"/css/chunk-vendors.c237ab63.css",revision:null},{url:"/fonts/element-icons.f1a45d74.ttf",revision:null},{url:"/fonts/element-icons.ff18efd1.woff",revision:null},{url:"/index.html",revision:"6c0de5b3ff5e65631d6af0e79100a4cd"},{url:"/js/434.05f11018.js",revision:null},{url:"/js/746.bd00bd89.js",revision:null},{url:"/js/792.78e52c6f.js",revision:null},{url:"/js/89.35e2d887.js",revision:null},{url:"/js/app.0e5cfd58.js",revision:null},{url:"/js/chunk-vendors.693025e0.js",revision:null},{url:"/manifest.json",revision:"be9781465bb42fdddabb7a4d6e8f1cb8"},{url:"/robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map
