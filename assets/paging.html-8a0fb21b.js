import{_ as n,W as s,X as a,a2 as t}from"./framework-3c1374b9.js";const p={},o=t('<h1 id="分页" tabindex="-1"><a class="header-anchor" href="#分页" aria-hidden="true">#</a> 分页</h1><p><code>EasyQuery</code>提供了非常建议的分页查询功能,方便用户进行数据结果的分页查询</p><h2 id="简单分页" tabindex="-1"><a class="header-anchor" href="#简单分页" aria-hidden="true">#</a> 简单分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>   <span class="token class-name">PageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> topicPageResult <span class="token operator">=</span> easyQuery\n                <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> t_topic t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`id` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`stars`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`create_time` <span class="token constant">FROM</span> t_topic t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`id` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">LIMIT</span> <span class="token number">20</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">20</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="join分页" tabindex="-1"><a class="header-anchor" href="#join分页" aria-hidden="true">#</a> join分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">PageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> page <span class="token operator">=</span> easyQuery\n                <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">innerJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">columnAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">columnIgnore</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`create_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`update_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`create_by`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`update_by`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`deleted`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`content`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`url`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`star`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`publish_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`score`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`status`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`order`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`is_top`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`top` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`title` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span><span class="token punctuation">)</span> t2\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t2<span class="token punctuation">.</span>`create_time`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`update_time`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`create_by`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`update_by`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`deleted`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`content`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`url`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`star`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`publish_time`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`score`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`status`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`order`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`is_top`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`top` <span class="token constant">FROM</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`create_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`update_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`create_by`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`update_by`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`deleted`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`content`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`url`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`star`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`publish_time`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`score`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`status`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`order`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`is_top`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`top` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`title` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span><span class="token punctuation">)</span> t2 <span class="token class-name">LIMIT</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="group分页" tabindex="-1"><a class="header-anchor" href="#group分页" aria-hidden="true">#</a> group分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">PageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> page <span class="token operator">=</span> easyQuery\n                <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">innerJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">groupBy</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span><span class="token operator">-&gt;</span>t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">columnSum</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getScore</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span><span class="token function">SUM</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span>`score`<span class="token punctuation">)</span> <span class="token constant">AS</span> `score` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`title` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">GROUP</span> <span class="token constant">BY</span> t1<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span> t2\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t2<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t2<span class="token punctuation">.</span>`score` <span class="token constant">FROM</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span><span class="token function">SUM</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span>`score`<span class="token punctuation">)</span> <span class="token constant">AS</span> `score` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`title` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">GROUP</span> <span class="token constant">BY</span> t1<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span> t2 <span class="token constant">LIMIT</span> <span class="token number">20</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">20</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',8),c=[o];function e(l,u){return s(),a("div",null,c)}const k=n(p,[["render",e],["__file","paging.html.vue"]]);export{k as default};
