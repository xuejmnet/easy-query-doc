import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-c7a120de.js";const p={},o=t('<h1 id="表达式复用" tabindex="-1"><a class="header-anchor" href="#表达式复用" aria-hidden="true">#</a> 表达式复用</h1><p>针对复杂表达式很多时候我们需要复用表达式,而不是重复定义,我们可以使用<code>easy-query</code>提供的<code>cloneQueryable</code>方法来克隆一个一模一样的,<br> 因为<code>where</code>、<code>order</code>、<code>select</code>等会让当前表达式的内容是追加上去的而不是重新生成一个新的</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//首先我们定义一个表达式</span>\n<span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> sql <span class="token operator">=</span> easyQuery\n        <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">innerJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">groupBy</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">columnSum</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getScore</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token comment">//克隆一个新的</span>\n<span class="token class-name">Queryable</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> blogEntityQueryable <span class="token operator">=</span> sql<span class="token punctuation">.</span><span class="token function">cloneQueryable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token comment">//对其添加select常量</span>\n<span class="token class-name">String</span> countSql <span class="token operator">=</span> sql<span class="token punctuation">.</span><span class="token function">cloneQueryable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token string">&quot;COUNT(1)&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT COUNT(1) FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2&quot;</span><span class="token punctuation">,</span> countSql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token comment">//对其limit</span>\n<span class="token class-name">String</span> limitSql <span class="token operator">=</span> sql<span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 2 OFFSET 2&quot;</span><span class="token punctuation">,</span> limitSql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token comment">//在对原先的进行操作发现select和limit并没有赋值上去,所以cloneQueryable生效</span>\n<span class="token class-name">String</span> sql1 <span class="token operator">=</span> blogEntityQueryable<span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">Long</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">columnCount</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT COUNT(t2.`id`) AS `id` FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',3),c=[o];function e(l,u){return s(),a("div",null,c)}const r=n(p,[["render",e],["__file","reuse.html.vue"]]);export{r as default};