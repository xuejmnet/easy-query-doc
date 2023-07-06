import{_ as n,W as s,X as a,a0 as t}from"./framework-7a1bedf3.js";const p={},o=t('<h1 id="子查询" tabindex="-1"><a class="header-anchor" href="#子查询" aria-hidden="true">#</a> 子查询</h1><p><code>easy-qeury</code>提供支持子查询包括<code>exists</code>、<code>not exists</code>、<code>in</code>、<code>not in</code></p><h2 id="exists" tabindex="-1"><a class="header-anchor" href="#exists" aria-hidden="true">#</a> EXISTS</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?</span>\n <span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> subQueryable <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> x <span class="token operator">=</span> easyQuery\n        <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">exists</span><span class="token punctuation">(</span>subQueryable<span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>q <span class="token operator">-&gt;</span> q<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`stars`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`create_time` <span class="token constant">FROM</span> `t_topic` t <span class="token class-name">WHERE</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `t_blog` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="not-exists" tabindex="-1"><a class="header-anchor" href="#not-exists" aria-hidden="true">#</a> NOT EXISTS</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?</span>\n<span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> subQueryable <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> x <span class="token operator">=</span> easyQuery\n        <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">notExists</span><span class="token punctuation">(</span>subQueryable<span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>q <span class="token operator">-&gt;</span> q<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`stars`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`create_time` <span class="token constant">FROM</span> `t_topic` t <span class="token constant">WHERE</span> <span class="token class-name">NOT</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `t_blog` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">100</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="in" tabindex="-1"><a class="header-anchor" href="#in" aria-hidden="true">#</a> IN</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?</span>\n<span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> idQueryable <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致</span>\n<span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyQuery\n        <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">in</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> idQueryable<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`stars`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`create_time` <span class="token constant">FROM</span> `t_topic` t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`id` <span class="token constant">IN</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">FROM</span> `t_blog` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">123</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">0</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="not-in" tabindex="-1"><a class="header-anchor" href="#not-in" aria-hidden="true">#</a> NOT IN</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?</span>\n<span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> idQueryable <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyQuery\n        <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">notIn</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> idQueryable<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`stars`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`title`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`create_time` <span class="token constant">FROM</span> `t_topic` t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`id` <span class="token class-name">NOT</span> <span class="token constant">IN</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">FROM</span> `t_blog` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">4</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">100</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',10),e=[o];function c(l,u){return s(),a("div",null,e)}const k=n(p,[["render",c],["__file","sub-query.html.vue"]]);export{k as default};
