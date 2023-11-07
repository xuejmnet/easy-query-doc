import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-f0d5c1b6.js";const e={},p=t('<h1 id="条件比较" tabindex="-1"><a class="header-anchor" href="#条件比较" aria-hidden="true">#</a> 条件比较</h1><p><code>easy-query</code>的查询、修改、删除核心过滤方法就是<code>WherePredicate</code>和<code>SqlPredicate</code>两种是同一种东西,条件比较永远是<code>column</code> <code>compare</code> <code>value</code>,column永远在左侧</p><h2 id="api" tabindex="-1"><a class="header-anchor" href="#api" aria-hidden="true">#</a> API</h2><div class="hint-container tip"><p class="hint-container-title">说明!!!</p><blockquote><p>代理模式下<code>where</code>的第一个参数是<code>filter</code>过滤器,第二个参数开始才是真正的表</p></blockquote></div><table><thead><tr><th>方法</th><th>sql</th><th>描述</th></tr></thead><tbody><tr><td>gt</td><td>&gt;</td><td>列 大于 值</td></tr><tr><td>ge</td><td>&gt;=</td><td>列 大于等于 值</td></tr><tr><td>eq</td><td>=</td><td>列 等于 值</td></tr><tr><td>ne</td><td>&lt;&gt;</td><td>列 不等于 值</td></tr><tr><td>le</td><td>&lt;=</td><td>列 小于等于 值</td></tr><tr><td>lt</td><td>&lt;</td><td>列 小于 值</td></tr><tr><td>likeMatchLeft</td><td>like word%</td><td>列左匹配</td></tr><tr><td>likeMatchRight</td><td>like %word</td><td>列右匹配</td></tr><tr><td>like</td><td>like %word%</td><td>列包含值</td></tr><tr><td>notLikeMatchLeft</td><td>not like word%</td><td>列 不匹配左侧</td></tr><tr><td>notLikeMatchRight</td><td>not like %word</td><td>列 不匹配右侧</td></tr><tr><td>notLike</td><td>not like %word%</td><td>列不包含值</td></tr><tr><td>isNull</td><td>is null</td><td>列 为null</td></tr><tr><td>isNotNull</td><td>is not null</td><td>列 不为null</td></tr><tr><td>in</td><td>in</td><td>列 在集合内部,集合为空返回False</td></tr><tr><td>notIn</td><td>not in</td><td>列 不在集合内部,集合为空返回True</td></tr><tr><td>rangeOpenClosed</td><td>&lt; x &lt;=</td><td>区间 (left..right] = {x | left &lt; x &lt;= right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeOpen</td><td>&lt; x &lt;</td><td>区间 (left..right) = {x | left &lt; x &lt; right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeClosedOpen</td><td>&lt;= x &lt;</td><td>[left..right) = {x | left &lt;= x &lt; right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeClosed</td><td>&lt;= x &lt;=</td><td>[left..right] = {x | left &lt;= x &lt;= right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>columnFunc</td><td>自定义</td><td>自定义函数包裹column</td></tr><tr><td>exists</td><td>存在</td><td>使用子查询queryable</td></tr><tr><td>notExists</td><td>不存在</td><td>使用子查询queryable</td></tr></tbody></table><h2 id="动态条件" tabindex="-1"><a class="header-anchor" href="#动态条件" aria-hidden="true">#</a> 动态条件</h2><p><code>eq</code>、<code>ge</code>、<code>isNull</code>、<code>isNotNull</code>...... 一些列方法都有对应的重载,其中第一个参数<code>boolean condition</code>表示是否追加对应的条件,并且<code>where</code>一样存在重载</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">SysUser</span> sysUser <span class="token operator">=</span>  easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123xxx&quot;</span><span class="token punctuation">)</span>\n                        <span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">,</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getPhone</span><span class="token punctuation">,</span><span class="token string">&quot;133&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token comment">//表达式like第一个参数为false所以不会添加phone的like条件到sql中</span>\n                        <span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> `id`<span class="token punctuation">,</span>`create_time`<span class="token punctuation">,</span>`username`<span class="token punctuation">,</span>`phone`<span class="token punctuation">,</span>`id_card`<span class="token punctuation">,</span>`address` <span class="token constant">FROM</span> `easy<span class="token operator">-</span>query<span class="token operator">-</span>test`<span class="token punctuation">.</span>`t_sys_user` <span class="token constant">WHERE</span> `id` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">123xxx</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">0</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="null-pointer" tabindex="-1"><a class="header-anchor" href="#null-pointer" aria-hidden="true">#</a> null pointer</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n<span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> phone<span class="token operator">=</span><span class="token keyword">null</span><span class="token punctuation">;</span>\n<span class="token class-name">SysUser</span> sysUser <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123xxx&quot;</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span>phone<span class="token operator">!=</span><span class="token keyword">null</span><span class="token operator">&amp;&amp;</span>phone<span class="token punctuation">.</span><span class="token function">containsKey</span><span class="token punctuation">(</span><span class="token string">&quot;phone&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getPhone</span><span class="token punctuation">,</span>phone<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&quot;phone&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token comment">//虽然我们对phone进行了判断非null并且包含对应的phone的key,但是因为第二个参数是直接获取值会导致phone.get(&quot;phone&quot;)的phone还是null所以会报错空指针异常</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="动态条件2" tabindex="-1"><a class="header-anchor" href="#动态条件2" aria-hidden="true">#</a> 动态条件2</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> phone<span class="token operator">=</span><span class="token keyword">null</span><span class="token punctuation">;</span>\n<span class="token class-name">SysUser</span> sysUser <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;123xxx&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>phone<span class="token operator">!=</span><span class="token keyword">null</span><span class="token operator">&amp;&amp;</span>phone<span class="token punctuation">.</span><span class="token function">containsKey</span><span class="token punctuation">(</span><span class="token string">&quot;phone&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token operator">::</span><span class="token function">getPhone</span><span class="token punctuation">,</span>phone<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">&quot;phone&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token comment">//where与where之间采用and链接</span>\n                    <span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> `id`<span class="token punctuation">,</span>`create_time`<span class="token punctuation">,</span>`username`<span class="token punctuation">,</span>`phone`<span class="token punctuation">,</span>`id_card`<span class="token punctuation">,</span>`address` <span class="token constant">FROM</span> `easy<span class="token operator">-</span>query<span class="token operator">-</span>test`<span class="token punctuation">.</span>`t_sys_user` <span class="token constant">WHERE</span> `id` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">123xxx</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">0</span>\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',12),o=[p];function c(l,i){return s(),a("div",null,o)}const d=n(e,[["render",c],["__file","where.html.vue"]]);export{d as default};