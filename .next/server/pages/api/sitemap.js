"use strict";(()=>{var e={};e.id=0,e.ids=[0],e.modules={5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6762:(e,t)=>{Object.defineProperty(t,"M",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},8854:(e,t,a)=>{a.r(t),a.d(t,{config:()=>u,default:()=>i,routeModule:()=>c});var r={};a.r(r),a.d(r,{default:()=>l});var s=a(9947),o=a(325),n=a(6762);let l=(e,t)=>{t.setHeader("Content-Type","text/xml"),t.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate");let a=`<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://yashsiwach.space/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/about</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/projects</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/contact</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/resume</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  </urlset>`;t.write(a),t.end()},i=(0,n.M)(r,"default"),u=(0,n.M)(r,"config"),c=new s.PagesAPIRouteModule({definition:{kind:o.A.PAGES_API,page:"/api/sitemap",pathname:"/api/sitemap",bundlePath:"",filename:""},userland:r})},325:(e,t)=>{Object.defineProperty(t,"A",{enumerable:!0,get:function(){return a}});var a=function(e){return e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE",e.IMAGE="IMAGE",e}({})},9947:(e,t,a)=>{e.exports=a(5600)}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=t(t.s=8854);module.exports=a})();