import{_ as p}from"./plugin-vue_export-helper-c27b6911.js";import{r as o,o as e,c,a as n,b as s,d as t,e as l}from"./app-9ce6239a.js";const u={},i=l('<h1 id="大数据流式查询返回" tabindex="-1"><a class="header-anchor" href="#大数据流式查询返回" aria-hidden="true">#</a> 大数据流式查询返回</h1><p><code>easy-query</code>提供了大数据流式返回,针对大数据量的数据无法一次在内存中获取,那么可以通过使用当前方法返回对应的结果集,通常用于<code>excel</code>或者部分文件写入功能,并且支持分表分库</p><div class="hint-container warning"><p class="hint-container-title">注意</p><blockquote><p>需要配合java8的<code>try resource</code>或者<code>try finally close</code>来关闭资源,并且需要自行处理<code>SQLException</code>,和<code>mybatis</code>不同的是期间无需开始事务也可以使用<br> 如果您是mysql、pgsql那么请查看文档底部问题<br> mysql数据库那么需要默认在连接字符串添加配置信息<code>useCursorFetch=true</code>,譬如<code>jdbc:mysql://127.0.0.1:3306/eq_db?useCursorFetch=true</code><br> pgsql数据库那么需要满足<code>fechSize设置需要 &gt; 0</code>、<code>jdbc连接字符串不能加 preferQueryMode =simple</code>、<code>需要设置autocommit为false</code></p></blockquote></div><div class="hint-container tip"><p class="hint-container-title">注意</p><blockquote><p>如果本次采用toStreamResult那么将不会支持<code>include</code>和<code>fillMany</code>和<code>fillOne</code>的api</p></blockquote></div><h1 id="tostreamresult" tabindex="-1"><a class="header-anchor" href="#tostreamresult" aria-hidden="true">#</a> toStreamResult</h1><h2 id="api" tabindex="-1"><a class="header-anchor" href="#api" aria-hidden="true">#</a> API</h2><table><thead><tr><th>参数</th><th>作用</th><th>描述</th></tr></thead><tbody><tr><td>fetchSize</td><td>设置每次拉取的大小</td><td>用来放置流式拉取一次性拉取过多数据用户可以自行设置</td></tr><tr><td><code>SQLConsumer&lt;Statement&gt;</code></td><td>设置<code>statement</code>的参数属性</td><td>比如<code>fetchSize</code>、<code>fetchDirection</code>等等</td></tr></tbody></table><h2 id="案例" tabindex="-1"><a class="header-anchor" href="#案例" aria-hidden="true">#</a> 案例</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token keyword">try</span><span class="token punctuation">(</span><span class="token class-name">JdbcStreamResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> streamResult <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">le</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getStar</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">orderByAsc</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getCreateTime</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toStreamResult</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">{</span>\n\n            <span class="token class-name">LocalDateTime</span> begin <span class="token operator">=</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2020</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>\n            <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">BlogEntity</span> blog <span class="token operator">:</span> streamResult<span class="token punctuation">.</span><span class="token function">getStreamIterable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token class-name">String</span> indexStr <span class="token operator">=</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>indexStr<span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>indexStr<span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getCreateBy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>begin<span class="token punctuation">.</span><span class="token function">plusDays</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getCreateTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>indexStr<span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getUpdateBy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>begin<span class="token punctuation">.</span><span class="token function">plusDays</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getUpdateTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;title&quot;</span> <span class="token operator">+</span> indexStr<span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getTitle</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token comment">//            Assert.assertEquals(&quot;content&quot; + indexStr, blog.getContent());</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;http://blog.easy-query.com/&quot;</span> <span class="token operator">+</span> indexStr<span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getUrl</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>i<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> blog<span class="token punctuation">.</span><span class="token function">getStar</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">BigDecimal</span><span class="token punctuation">(</span><span class="token string">&quot;1.2&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">compareTo</span><span class="token punctuation">(</span>blog<span class="token punctuation">.</span><span class="token function">getScore</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>i <span class="token operator">%</span> <span class="token number">3</span> <span class="token operator">==</span> <span class="token number">0</span> <span class="token operator">?</span> <span class="token number">0</span> <span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span> blog<span class="token punctuation">.</span><span class="token function">getStatus</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">BigDecimal</span><span class="token punctuation">(</span><span class="token string">&quot;1.2&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">multiply</span><span class="token punctuation">(</span><span class="token class-name">BigDecimal</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span>i<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">compareTo</span><span class="token punctuation">(</span>blog<span class="token punctuation">.</span><span class="token function">getOrder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>i <span class="token operator">%</span> <span class="token number">2</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getIsTop</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>i <span class="token operator">%</span> <span class="token number">2</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getTop</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">,</span> blog<span class="token punctuation">.</span><span class="token function">getDeleted</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                i<span class="token operator">++</span><span class="token punctuation">;</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">SQLException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> `id`<span class="token punctuation">,</span>`create_time`<span class="token punctuation">,</span>`update_time`<span class="token punctuation">,</span>`create_by`<span class="token punctuation">,</span>`update_by`<span class="token punctuation">,</span>`deleted`<span class="token punctuation">,</span>`title`<span class="token punctuation">,</span>`content`<span class="token punctuation">,</span>`url`<span class="token punctuation">,</span>`star`<span class="token punctuation">,</span>`publish_time`<span class="token punctuation">,</span>`score`<span class="token punctuation">,</span>`status`<span class="token punctuation">,</span>`order`<span class="token punctuation">,</span>`is_top`<span class="token punctuation">,</span>`top` <span class="token constant">FROM</span> `t_blog` <span class="token constant">WHERE</span> `deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> `star` <span class="token operator">&lt;=</span> <span class="token operator">?</span> <span class="token constant">ORDER</span> <span class="token constant">BY</span> `create_time` <span class="token constant">ASC</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">100</span><span class="token punctuation">(</span><span class="token class-name">Integer</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">6</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="fetch" tabindex="-1"><a class="header-anchor" href="#fetch" aria-hidden="true">#</a> fetch</h1><h2 id="api-1" tabindex="-1"><a class="header-anchor" href="#api-1" aria-hidden="true">#</a> API</h2><table><thead><tr><th>参数</th><th>作用</th><th>描述</th></tr></thead><tbody><tr><td><code>Function&lt;Stream&lt;T&gt;,TR&gt;</code></td><td>拉取器</td><td>用来返回处理迭代结果</td></tr><tr><td>fetchSize</td><td>设置每次拉取的大小</td><td>用来放置流式拉取一次性拉取过多数据用户可以自行设置</td></tr><tr><td><code>SQLConsumer&lt;Statement&gt;</code></td><td>设置<code>statement</code>的参数属性</td><td>比如<code>fetchSize</code>、<code>fetchDirection</code>等等</td></tr></tbody></table><h2 id="案例-1" tabindex="-1"><a class="header-anchor" href="#案例-1" aria-hidden="true">#</a> 案例</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>    <span class="token class-name">Optional</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> traceId1 <span class="token operator">=</span> easyProxyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">TopicProxy</span><span class="token punctuation">.</span><span class="token function">createTable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">filterConfigure</span><span class="token punctuation">(</span><span class="token class-name">NotNullOrEmptyValueFilter</span><span class="token punctuation">.</span><span class="token constant">DEFAULT</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">t</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                    <span class="token keyword">return</span> o<span class="token punctuation">.</span><span class="token function">findFirst</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> `id`<span class="token punctuation">,</span>`stars`<span class="token punctuation">,</span>`title`<span class="token punctuation">,</span>`create_time` <span class="token constant">FROM</span> `t_topic` <span class="token constant">WHERE</span> `id` <span class="token operator">=</span> <span class="token operator">?</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n\n<span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> traceId1 <span class="token operator">=</span> easyProxyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">TopicProxy</span><span class="token punctuation">.</span><span class="token function">createTable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span><span class="token function">t</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">fetch</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                <span class="token keyword">return</span> o<span class="token punctuation">.</span><span class="token function">peek</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">setTitle</span><span class="token punctuation">(</span>traceId<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">collect</span><span class="token punctuation">(</span><span class="token class-name">Collectors</span><span class="token punctuation">.</span><span class="token function">toSet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token punctuation">}</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> `id`<span class="token punctuation">,</span>`stars`<span class="token punctuation">,</span>`title`<span class="token punctuation">,</span>`create_time` <span class="token constant">FROM</span> `t_topic` <span class="token constant">WHERE</span> `id` <span class="token operator">=</span> <span class="token operator">?</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="问题" tabindex="-1"><a class="header-anchor" href="#问题" aria-hidden="true">#</a> 问题</h1><h2 id="mysql不生效" tabindex="-1"><a class="header-anchor" href="#mysql不生效" aria-hidden="true">#</a> mysql不生效</h2>',16),k={href:"https://blog.csdn.net/dkz97/article/details/116355022",target:"_blank",rel:"noopener noreferrer"},r=n("h2",{id:"pgsql不生效",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#pgsql不生效","aria-hidden":"true"},"#"),s(" pgsql不生效")],-1),d={href:"https://blog.csdn.net/dkz97/article/details/115643516",target:"_blank",rel:"noopener noreferrer"},m=n("h2",{id:"相关搜索",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#相关搜索","aria-hidden":"true"},"#"),s(" 相关搜索")],-1),b=n("p",null,[n("code",null,"流式结果"),s(),n("code",null,"流式查询"),s(),n("code",null,"迭代返回"),s(),n("code",null,"游标查询")],-1);function v(h,f){const a=o("ExternalLinkIcon");return e(),c("div",null,[i,n("p",null,[n("a",k,[s("https://blog.csdn.net/dkz97/article/details/116355022"),t(a)])]),r,n("p",null,[n("a",d,[s("https://blog.csdn.net/dkz97/article/details/115643516"),t(a)])]),m,b])}const q=p(u,[["render",v],["__file","stream-query.html.vue"]]);export{q as default};