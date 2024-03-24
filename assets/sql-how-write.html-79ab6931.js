import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-3fd52a64.js";const p={},o=t('<p>本章节主要是将一些复杂sql的编写方式用表达式展现出来</p><h2 id="案例一" tabindex="-1"><a class="header-anchor" href="#案例一" aria-hidden="true">#</a> 案例一</h2><p>查询对应的时间函数年份月份进行分组并且取3个月内的</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code> <span class="token keyword">SELECT</span>\n        <span class="token keyword">YEAR</span><span class="token punctuation">(</span>日期<span class="token punctuation">)</span> <span class="token keyword">AS</span> 年份，\n        <span class="token keyword">MONTH</span><span class="token punctuation">(</span>日期<span class="token punctuation">)</span> <span class="token keyword">AS</span> 月份\n        <span class="token function">SUM</span><span class="token punctuation">(</span>收入<span class="token punctuation">)</span> <span class="token keyword">AS</span> 月收入\n        <span class="token keyword">FROM</span>\n                your_table\n        <span class="token keyword">WHERE</span>\n        日期 <span class="token operator">&gt;=</span> CURDATE<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">-</span> <span class="token keyword">INTERVAL</span> <span class="token number">3</span> <span class="token keyword">MONTH</span>\n        <span class="token keyword">GROUP</span> <span class="token keyword">BY</span>\n        年份，月份\n        <span class="token keyword">ORDER</span> <span class="token keyword">BY</span>\n        年份，月份<span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Draft3</span><span class="token punctuation">&lt;</span><span class="token class-name">Integer</span><span class="token punctuation">,</span> <span class="token class-name">Integer</span><span class="token punctuation">,</span> <span class="token class-name">Integer</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n          <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">createTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">gt</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">_now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">plusMonths</span><span class="token punctuation">(</span><span class="token operator">-</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token comment">//WHERE 日期 &gt;= CURDATE()- INTERVAL 3 MONTH</span>\n          <span class="token punctuation">.</span><span class="token function">groupBy</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token class-name">GroupKeys</span><span class="token punctuation">.</span><span class="token constant">TABLE1</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">createTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">year</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> o<span class="token punctuation">.</span><span class="token function">createTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">month</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token comment">//GROUP BY 年份，月份</span>\n          <span class="token punctuation">.</span><span class="token function">orderBy</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n              o<span class="token punctuation">.</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">asc</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// ORDER BY 年份，月份;</span>\n              o<span class="token punctuation">.</span><span class="token function">key2</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">asc</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n          <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token class-name">Select</span><span class="token punctuation">.</span><span class="token constant">DRAFT</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span> <span class="token comment">//采用草稿类型</span>\n                  o<span class="token punctuation">.</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">//YEAR(日期) AS 年份，</span>\n                  o<span class="token punctuation">.</span><span class="token function">key2</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">//MONTH(日期) AS 月份</span>\n                  o<span class="token punctuation">.</span><span class="token function">sum</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">group</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">star</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>  <span class="token comment">//SUM(收入) AS 月收入</span>\n          <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span> <span class="token function">YEAR</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span> <span class="token constant">AS</span> `value1`<span class="token punctuation">,</span><span class="token function">MONTH</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span> <span class="token constant">AS</span> `value2`<span class="token punctuation">,</span><span class="token function">SUM</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`star`<span class="token punctuation">)</span> <span class="token constant">AS</span> `value3` <span class="token constant">FROM</span> `t_blog` t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span>  t<span class="token punctuation">.</span>`create_time` <span class="token operator">&gt;</span> <span class="token function">date_add</span><span class="token punctuation">(</span><span class="token function">NOW</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> interval <span class="token punctuation">(</span><span class="token operator">?</span><span class="token punctuation">)</span> month<span class="token punctuation">)</span> <span class="token constant">GROUP</span> <span class="token class-name">BY</span> <span class="token function">YEAR</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">MONTH</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span> <span class="token constant">ORDER</span> <span class="token class-name">BY</span> <span class="token function">YEAR</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span> <span class="token constant">ASC</span><span class="token punctuation">,</span><span class="token function">MONTH</span><span class="token punctuation">(</span>t<span class="token punctuation">.</span>`create_time`<span class="token punctuation">)</span> <span class="token constant">ASC</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token operator">-</span><span class="token function">3</span><span class="token punctuation">(</span><span class="token class-name">Integer</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">4</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">0</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="案例二" tabindex="-1"><a class="header-anchor" href="#案例二" aria-hidden="true">#</a> 案例二</h2><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">select</span> a<span class="token punctuation">.</span>id<span class="token punctuation">,</span>a<span class="token punctuation">.</span>name\n<span class="token keyword">from</span> <span class="token keyword">table</span> a\n<span class="token keyword">where</span> <span class="token punctuation">(</span><span class="token keyword">select</span> <span class="token function">count</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">as</span> num <span class="token keyword">from</span> <span class="token keyword">table</span> b <span class="token keyword">where</span> b<span class="token punctuation">.</span>box_id<span class="token operator">=</span>a<span class="token punctuation">.</span>id <span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token number">0</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Draft2</span><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n\n                    <span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Long</span><span class="token punctuation">&gt;</span></span> longQuery <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">selectCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//创建子查询的count然后和0常量进行比较</span>\n\n                    <span class="token class-name"><span class="token namespace">o<span class="token punctuation">.</span></span>SQLParameter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span><span class="token number">0L</span><span class="token punctuation">)</span>\n                            <span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>longQuery<span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token class-name">Select</span><span class="token punctuation">.</span><span class="token constant">DRAFT</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>\n                        o<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                        o<span class="token punctuation">.</span><span class="token function">url</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n                <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AS</span> `value1`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`url` <span class="token constant">AS</span> `value2` <span class="token constant">FROM</span> `t_blog` t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> <span class="token operator">?</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">SELECT</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token constant">FROM</span> `t_topic` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">0</span><span class="token punctuation">(</span><span class="token class-name">Long</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="案例三" tabindex="-1"><a class="header-anchor" href="#案例三" aria-hidden="true">#</a> 案例三</h2><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">select</span> a<span class="token punctuation">,</span>b<span class="token punctuation">,</span>c<span class="token punctuation">,</span><span class="token punctuation">(</span><span class="token keyword">select</span> <span class="token function">count</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">from</span> a t1 <span class="token keyword">where</span> t<span class="token punctuation">.</span>id<span class="token operator">=</span>b<span class="token punctuation">.</span>id<span class="token punctuation">)</span> <span class="token keyword">as</span> xx <span class="token keyword">from</span> b\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Draft3</span><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Long</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                    o<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token class-name">Select</span><span class="token punctuation">.</span><span class="token constant">DRAFT</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>\n                        o<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                        o<span class="token punctuation">.</span><span class="token function">url</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n                        o<span class="token punctuation">.</span><span class="token function">subQuery</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">selectCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AS</span> `value1`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`url` <span class="token constant">AS</span> `value2`<span class="token punctuation">,</span><span class="token punctuation">(</span><span class="token class-name">SELECT</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token constant">FROM</span> `t_topic` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span> <span class="token constant">AS</span> `value3` <span class="token constant">FROM</span> `t_blog` t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> <span class="token operator">?</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">123</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',11),c=[o];function e(l,u){return s(),a("div",null,c)}const r=n(p,[["render",e],["__file","sql-how-write.html.vue"]]);export{r as default};