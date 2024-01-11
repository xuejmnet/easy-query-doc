import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-d62cd0af.js";const p={},o=t('<h1 id="数据库函数" tabindex="-1"><a class="header-anchor" href="#数据库函数" aria-hidden="true">#</a> 数据库函数</h1><p>框架默认提供了部分数据库函数,并且支持适配所有的数据库.包括常见的字符串函数和时间格式化函数,包括数学函数等</p><table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody><tr><td>nullDefault</td><td>如果列为null则返回参数值</td></tr><tr><td>subString</td><td>如果列为null则返回参数值</td></tr><tr><td>count</td><td>统计数量返回long</td></tr><tr><td>intCount</td><td>统计数量返回int</td></tr><tr><td>min</td><td>最小值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>concat</td><td>链接多个列或者值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>max</td><td>最大值</td></tr><tr><td>avg</td><td>平均值</td></tr><tr><td>abs</td><td>绝对值</td></tr><tr><td>round</td><td>四舍五入</td></tr><tr><td>dateTimeFormat</td><td>时间格式格式化 格式化参数为语言java的格式化</td></tr><tr><td>dateTimeSQLFormat</td><td>时间格式格式化 格式化参数为语言数据库的格式化</td></tr><tr><td>concat</td><td>多列以字符串形式相加</td></tr><tr><td>now</td><td>当前时间</td></tr><tr><td>utcNow</td><td>当前UTC时间</td></tr></tbody></table><h2 id="返回列函数" tabindex="-1"><a class="header-anchor" href="#返回列函数" aria-hidden="true">#</a> 返回列函数</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token class-name">String</span> sql1 <span class="token operator">=</span> easyClient<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">sqlFunc</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT IFNULL(t.`id`,?) FROM `t_topic` t WHERE t.`id` = ?&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="条件函数" tabindex="-1"><a class="header-anchor" href="#条件函数" aria-hidden="true">#</a> 条件函数</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token class-name">String</span> sql <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">,</span> <span class="token string">&quot;456&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = IFNULL(`title`,?)&quot;</span><span class="token punctuation">,</span> sql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token class-name">String</span> sql <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span>\n            <span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">orderByDesc</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getCreateTime</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">sqlFuncAs</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">dateTimeFormat</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getCreateTime</span><span class="token punctuation">,</span> <span class="token string">&quot;yyyy-MM-dd&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT DATE_FORMAT(t.`create_time`,&#39;%Y-%m-%d&#39;) AS `title` FROM `t_topic` t WHERE t.`id` = ? ORDER BY t.`create_time` DESC&quot;</span><span class="token punctuation">,</span> sql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',7),c=[o];function e(u,l){return s(),a("div",null,c)}const d=n(p,[["render",e],["__file","sql-func-v1.html.vue"]]);export{d as default};
