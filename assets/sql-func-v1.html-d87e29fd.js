import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-2e815e60.js";const p={},o=t('<h1 id="数据库函数" tabindex="-1"><a class="header-anchor" href="#数据库函数" aria-hidden="true">#</a> 数据库函数</h1><p>框架默认提供了部分数据库函数,并且支持适配所有的数据库.包括常见的字符串函数和时间格式化函数,包括数学函数等</p><h3 id="通用函数" tabindex="-1"><a class="header-anchor" href="#通用函数" aria-hidden="true">#</a> 通用函数</h3><table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody><tr><td>nullDefault</td><td>如果列为null则返回参数值</td></tr><tr><td>count</td><td>统计数量返回long</td></tr><tr><td>intCount</td><td>统计数量返回int</td></tr><tr><td>min</td><td>最小值</td></tr><tr><td>max</td><td>最大值</td></tr></tbody></table><h3 id="字符串函数" tabindex="-1"><a class="header-anchor" href="#字符串函数" aria-hidden="true">#</a> 字符串函数</h3><table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody><tr><td>nullEmpty</td><td>如果列为null则返回空值</td></tr><tr><td>subString</td><td>切割字符串,默认其实0</td></tr><tr><td>concat</td><td>链接多个列或者值</td></tr><tr><td>toLower</td><td>转成小写</td></tr><tr><td>toUpper</td><td>转成大写</td></tr><tr><td>trim</td><td>去掉前后空格</td></tr><tr><td>trimStart</td><td>去掉前面空格</td></tr><tr><td>trimEnd</td><td>去掉后面空格</td></tr><tr><td>replace</td><td>替换字符串</td></tr><tr><td>leftPad</td><td>往左补值</td></tr><tr><td>rightPad</td><td>往右补值</td></tr><tr><td>join</td><td>字符串多列join组合返回常用语group+逗号组合</td></tr><tr><td>length</td><td>字符串长度</td></tr><tr><td>compareTo</td><td>比较字符串大小</td></tr></tbody></table><h3 id="时间函数" tabindex="-1"><a class="header-anchor" href="#时间函数" aria-hidden="true">#</a> 时间函数</h3><table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody><tr><td>format</td><td>格式化日期支持java格式化</td></tr><tr><td>plus</td><td>增加时间</td></tr><tr><td>plusMonths</td><td>增加月份</td></tr><tr><td>plusYears</td><td>增加年份</td></tr><tr><td>dayOfYear</td><td>当前天数在一年中代表第几天</td></tr><tr><td>dayOfWeek</td><td>当前天数在一年中代表第几天 0-6星期日为0</td></tr><tr><td>year</td><td>返回年份</td></tr><tr><td>month</td><td>返回月份1-12</td></tr><tr><td>day</td><td>返回月份中的天数1-31</td></tr><tr><td>hour</td><td>返回小时0-23</td></tr><tr><td>minute</td><td>返回分钟0-59</td></tr><tr><td>second</td><td>返回秒数0-59</td></tr><tr><td>duration</td><td>返回间隔天/小时/.... a.duration(b,DateTimeDurationEnum.Days) a比b大多少天,如果a小于b则返回负数 两个日期a,b之间相隔多少天</td></tr><tr><td>plusYears</td><td>增加年份</td></tr><tr><td>plusYears</td><td>增加年份</td></tr><tr><td>plusYears</td><td>增加年份</td></tr><tr><td>plusYears</td><td>增加年份</td></tr><tr><td>_now</td><td>当前时间</td></tr><tr><td>_utcNow</td><td>当前UTC时间</td></tr></tbody></table><h2 id="返回列函数" tabindex="-1"><a class="header-anchor" href="#返回列函数" aria-hidden="true">#</a> 返回列函数</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token class-name">String</span> sql1 <span class="token operator">=</span> easyClient<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">sqlFunc</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT IFNULL(t.`id`,?) FROM `t_topic` t WHERE t.`id` = ?&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="条件函数" tabindex="-1"><a class="header-anchor" href="#条件函数" aria-hidden="true">#</a> 条件函数</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token class-name">String</span> sql <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">ifNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">,</span> <span class="token string">&quot;456&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = IFNULL(`title`,?)&quot;</span><span class="token punctuation">,</span> sql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token class-name">String</span> sql <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span>\n            <span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">orderByDesc</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getCreateTime</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">sqlFuncAs</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">fx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">dateTimeFormat</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getCreateTime</span><span class="token punctuation">,</span> <span class="token string">&quot;yyyy-MM-dd&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT DATE_FORMAT(t.`create_time`,&#39;%Y-%m-%d&#39;) AS `title` FROM `t_topic` t WHERE t.`id` = ? ORDER BY t.`create_time` DESC&quot;</span><span class="token punctuation">,</span> sql<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',12),c=[o];function e(u,l){return s(),a("div",null,c)}const r=n(p,[["render",e],["__file","sql-func-v1.html.vue"]]);export{r as default};
