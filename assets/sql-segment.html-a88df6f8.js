import{_ as e,W as a,X as r,a0 as c}from"./framework-7a1bedf3.js";const s={},t=c('<h1 id="自定义sql片段" tabindex="-1"><a class="header-anchor" href="#自定义sql片段" aria-hidden="true">#</a> 自定义SQL片段</h1><p><code>easy-query</code>默认提供了数据库自定义<code>SQL</code>片段,其中 <a href="/easy-query-doc/guide/query/case-when">《CaseWhen》</a> 就是有数据库自定义片段来自行实现api</p><p>如何设计api完全可以看用户自行实现。</p><h2 id="分组求第一条" tabindex="-1"><a class="header-anchor" href="#分组求第一条" aria-hidden="true">#</a> 分组求第一条</h2><p><code>OVER(Partition By ... Order By ...)</code> 采用pgsql语法来实现</p>',5),d=[t];function o(n,i){return a(),r("div",null,d)}const l=e(s,[["render",o],["__file","sql-segment.html.vue"]]);export{l as default};
