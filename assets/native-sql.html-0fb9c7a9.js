import{_ as s,W as a,X as n,a2 as t}from"./framework-6199cc12.js";const e={},p=t(`<h1 id="select" tabindex="-1"><a class="header-anchor" href="#select" aria-hidden="true">#</a> select</h1><p><code>easy-query</code>的不但支持表达式的强类型sql,也支持手写sql来实现crud</p><h2 id="查询sqlquery" tabindex="-1"><a class="header-anchor" href="#查询sqlquery" aria-hidden="true">#</a> 查询sqlQuery</h2><p>强类型结果返回</p><h3 id="无参数强类型返回" tabindex="-1"><a class="header-anchor" href="#无参数强类型返回" aria-hidden="true">#</a> 无参数强类型返回</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> blogEntities <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlQuery</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT * FROM t_blog t&quot;</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> <span class="token operator">*</span> <span class="token constant">FROM</span> t_blog t
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">100</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="有参数强类型返回" tabindex="-1"><a class="header-anchor" href="#有参数强类型返回" aria-hidden="true">#</a> 有参数强类型返回</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> blogEntities <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlQuery</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT * FROM t_blog t where t.id=?&quot;</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">Collections</span><span class="token punctuation">.</span><span class="token function">singletonList</span><span class="token punctuation">(</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> <span class="token operator">*</span> <span class="token constant">FROM</span> t_blog t where t<span class="token punctuation">.</span>id<span class="token operator">=</span><span class="token operator">?</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="查询sqlquerymap" tabindex="-1"><a class="header-anchor" href="#查询sqlquerymap" aria-hidden="true">#</a> 查询sqlQueryMap</h2><p><code>Map</code>返回默认<code>key</code>忽略大小写</p><h3 id="无参数map返回" tabindex="-1"><a class="header-anchor" href="#无参数map返回" aria-hidden="true">#</a> 无参数Map返回</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Map</span><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> blogs <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlQueryMap</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT * FROM t_blog t&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 
 <span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> <span class="token operator">*</span> <span class="token constant">FROM</span> t_blog t
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">100</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="有参数map返回" tabindex="-1"><a class="header-anchor" href="#有参数map返回" aria-hidden="true">#</a> 有参数Map返回</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Map</span><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> blogs <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlQueryMap</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT * FROM t_blog t  where t.id=?&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Collections</span><span class="token punctuation">.</span><span class="token function">singletonList</span><span class="token punctuation">(</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> <span class="token operator">*</span> <span class="token constant">FROM</span> t_blog t  where t<span class="token punctuation">.</span>id<span class="token operator">=</span><span class="token operator">?</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="执行" tabindex="-1"><a class="header-anchor" href="#执行" aria-hidden="true">#</a> 执行</h2><h3 id="无参数" tabindex="-1"><a class="header-anchor" href="#无参数" aria-hidden="true">#</a> 无参数</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> newContent<span class="token operator">=</span> <span class="token constant">UUID</span><span class="token punctuation">.</span><span class="token function">randomUUID</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlExecute</span><span class="token punctuation">(</span><span class="token string">&quot;update t_blog set content=&#39;&quot;</span><span class="token operator">+</span>newContent <span class="token operator">+</span><span class="token string">&quot;&#39; where id=&#39;1&#39;&quot;</span><span class="token punctuation">)</span>


<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> update t_blog set content<span class="token operator">=</span>&#39;<span class="token number">3</span>af23d78<span class="token operator">-</span><span class="token number">86f</span><span class="token number">1</span><span class="token operator">-</span><span class="token number">48</span>b1<span class="token operator">-</span>bc51<span class="token operator">-</span>ce0e0f63113d&#39; where id<span class="token operator">=</span><span class="token char">&#39;1&#39;</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="有参数" tabindex="-1"><a class="header-anchor" href="#有参数" aria-hidden="true">#</a> 有参数</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">String</span> newContent<span class="token operator">=</span> <span class="token constant">UUID</span><span class="token punctuation">.</span><span class="token function">randomUUID</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">sqlExecute</span><span class="token punctuation">(</span><span class="token string">&quot;update t_blog set content=? where id=?&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Arrays</span><span class="token punctuation">.</span><span class="token function">asList</span><span class="token punctuation">(</span>newContent<span class="token punctuation">,</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> update t_blog set content<span class="token operator">=</span><span class="token operator">?</span> where id<span class="token operator">=</span><span class="token operator">?</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token number">0d</span><span class="token number">93119</span>a<span class="token operator">-</span><span class="token number">9e57</span><span class="token operator">-</span><span class="token number">4d</span><span class="token number">71</span><span class="token operator">-</span>a67b<span class="token operator">-</span><span class="token function">58d24823a88b</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">1</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,19),o=[p];function c(l,r){return a(),n("div",null,o)}const u=s(e,[["render",c],["__file","native-sql.html.vue"]]);export{u as default};
