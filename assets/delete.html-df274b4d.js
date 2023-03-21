import{_ as n,W as s,X as a,a2 as e}from"./framework-3c1374b9.js";const p={},t=e(`<h2 id="删除" tabindex="-1"><a class="header-anchor" href="#删除" aria-hidden="true">#</a> 删除</h2><p><code>EasyQuery</code>提供了内置物理删除和逻辑删除,默认<code>EasyQuery</code>不支持<code>delete</code>命令 需要开启允许或者使用delete语句的时候允许。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>    <span class="token keyword">public</span> <span class="token class-name">EasyQueryConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
       <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">public</span> <span class="token class-name">EasyQueryConfiguration</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> deleteThrowError<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>deleteThrowError<span class="token operator">=</span>deleteThrowError<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建<code>EasyQuery</code>配置项的时候可以通过构造函数开启允许删除，默认不允许调用删除功能</p><p>数据库建表脚本</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">create</span> <span class="token keyword">table</span> t_topic
<span class="token punctuation">(</span>
    id <span class="token keyword">varchar</span><span class="token punctuation">(</span><span class="token number">32</span><span class="token punctuation">)</span> <span class="token operator">not</span> <span class="token boolean">null</span> <span class="token keyword">comment</span> <span class="token string">&#39;主键ID&#39;</span><span class="token keyword">primary</span> <span class="token keyword">key</span><span class="token punctuation">,</span>
    stars <span class="token keyword">int</span> <span class="token operator">not</span> <span class="token boolean">null</span> <span class="token keyword">comment</span> <span class="token string">&#39;点赞数&#39;</span><span class="token punctuation">,</span>
    title <span class="token keyword">varchar</span><span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span>  <span class="token boolean">null</span> <span class="token keyword">comment</span> <span class="token string">&#39;标题&#39;</span><span class="token punctuation">,</span>
    create_time <span class="token keyword">datetime</span> <span class="token operator">not</span> <span class="token boolean">null</span> <span class="token keyword">comment</span> <span class="token string">&#39;创建时间&#39;</span>
<span class="token punctuation">)</span><span class="token keyword">comment</span> <span class="token string">&#39;主题表&#39;</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>java实体对象</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@PrimaryKey</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_1-表达式删除" tabindex="-1"><a class="header-anchor" href="#_1-表达式删除" aria-hidden="true">#</a> 1.表达式删除</h2><ul><li>表达式主键删除</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">deletable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                    <span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;999&quot;</span><span class="token punctuation">)</span>
                    <span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Preparing<span class="token operator">:</span> DELETE FROM t_topic WHERE \`id\` <span class="token operator">=</span> <span class="token operator">?</span>
<span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Parameters<span class="token operator">:</span> <span class="token number">999</span><span class="token operator">(</span>String<span class="token operator">)</span>
<span class="token operator">&lt;</span><span class="token operator">=</span><span class="token operator">=</span> Total<span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>表达式删除</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">deletable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">,</span><span class="token string">&quot;title998&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                    <span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Preparing<span class="token operator">:</span> DELETE FROM t_topic WHERE \`title\` <span class="token operator">=</span> <span class="token operator">?</span>
<span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Parameters<span class="token operator">:</span> title998<span class="token operator">(</span>String<span class="token operator">)</span>
<span class="token operator">&lt;</span><span class="token operator">=</span><span class="token operator">=</span> Total<span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_2-实体删除" tabindex="-1"><a class="header-anchor" href="#_2-实体删除" aria-hidden="true">#</a> 2.实体删除</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">Topic</span> topic <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereId</span><span class="token punctuation">(</span><span class="token string">&quot;997&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;未找到当前主题数据&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//Topic topic=new Topic();</span>
<span class="token comment">//topic.setId(&quot;997&quot;);</span>
<span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">insertable</span><span class="token punctuation">(</span>topic<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Preparing<span class="token operator">:</span> DELETE FROM t_topic WHERE \`id\` <span class="token operator">=</span> <span class="token operator">?</span>
<span class="token operator">=</span><span class="token operator">=</span><span class="token operator">&gt;</span> Parameters<span class="token operator">:</span> <span class="token number">997</span><span class="token operator">(</span>String<span class="token operator">)</span>
<span class="token operator">&lt;</span><span class="token operator">=</span><span class="token operator">=</span> Total<span class="token operator">:</span> <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当当前方法或者配置不允许删除命令的时候程序将会抛出对应的异常<code>EasyQueryInvalidOperationException</code></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">deletable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;999&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">allowDeleteCommand</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当前对象如果支持软删除那么在生成对应命令的时候会生成UPDATE语句来实现软删除，对于是否允许删除命令将不会生效，因为允许删除命令仅对当前sql生成为<code>DELETE</code>语句才会生效判断</p>`,21),o=[t];function c(l,i){return s(),a("div",null,o)}const u=n(p,[["render",c],["__file","delete.html.vue"]]);export{u as default};
