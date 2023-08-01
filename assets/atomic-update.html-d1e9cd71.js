import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as a,c as s,e as t}from"./app-61f0a099.js";const e={},c=t(`<p><code>easy-query</code>提供了原子列更新,主要是针对当前数据的库存或者金额等数据进行原子更新,需要配合track更新,无法单独使用,譬如我有一个库存冗余字段,那么在更新的时候如果是对象更新那么将会生成原子sql(可以自定义)比如<code>update set column=column+1 where id=xxx and column&gt;=xxx</code></p><div class="hint-container warning"><p class="hint-container-title">说明!!!</p><blockquote><p>仅entity对象更新有效,如果是表达式更新那么还是按表达式更新来处理，并且需要当前上下文开启追踪模式不然无法使用</p></blockquote></div><h2 id="valueupdateatomictrack" tabindex="-1"><a class="header-anchor" href="#valueupdateatomictrack" aria-hidden="true">#</a> ValueUpdateAtomicTrack</h2><p>原子更新接口,需要自行实现</p><h3 id="系统默认实现" tabindex="-1"><a class="header-anchor" href="#系统默认实现" aria-hidden="true">#</a> 系统默认实现</h3><table><thead><tr><th>默认实现</th><th>默认</th><th>描述</th></tr></thead><tbody><tr><td>DefaultValueUpdateAtomicTrack</td><td>✅</td><td>不处理</td></tr><tr><td>IntegerNotValueUpdateAtomicTrack</td><td>❌</td><td>非null的int更新,如果旧值比新值大生成<code>update table set column=column-x where id=xx and column&gt;=x</code>,如果新值比旧值大<code>update table set column=column+x where id=xx</code></td></tr><tr><td>LongNotValueUpdateAtomicTrack</td><td>❌</td><td>非null的int更新,如果旧值比新值大生成<code>update table set column=column-x where id=xx and column&gt;=x</code>,如果新值比旧值大<code>update table set column=column+x where id=xx</code></td></tr></tbody></table><h2 id="例子" tabindex="-1"><a class="header-anchor" href="#例子" aria-hidden="true">#</a> 例子</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic_value_atomic&quot;</span><span class="token punctuation">)</span>
<span class="token annotation punctuation">@ToString</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">TopicValueUpdateAtomicTrack</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>valueUpdateAtomicTrack <span class="token operator">=</span> <span class="token class-name">IntegerNotValueUpdateAtomicTrack</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> topicType<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
<span class="token punctuation">}</span>


<span class="token comment">//SpringBoot 直接使用@EasyQueryTrack aop</span>

<span class="token class-name">TrackManager</span> trackManager <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">getRuntimeContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getTrackManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">try</span> <span class="token punctuation">{</span>
    trackManager<span class="token punctuation">.</span><span class="token function">begin</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// id=123 stars=99</span>
    <span class="token class-name">TopicValueUpdateAtomicTrack</span> topicValueUpdateAtomicTrack <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">TopicValueUpdateAtomicTrack</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">asTracking</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//设置98 前后变更 1</span>
    topicValueUpdateAtomicTrack<span class="token punctuation">.</span><span class="token function">setStars</span><span class="token punctuation">(</span><span class="token number">98</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">long</span> l <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">updatable</span><span class="token punctuation">(</span>topicValueUpdateAtomicTrack<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//UPDATE \`t_topic_value_atomic\` SET \`stars\` = \`stars\`- ? WHERE \`id\` = ? AND \`stars\` &gt;= ?</span>
    <span class="token comment">//UPDATE \`t_topic_value_atomic\` SET \`stars\` = \`stars\`- 1 WHERE \`id\` = &#39;123&#39; AND \`stars\` &gt;= 1</span>
<span class="token punctuation">}</span><span class="token keyword">finally</span> <span class="token punctuation">{</span>
    trackManager<span class="token punctuation">.</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,8),p=[c];function o(i,l){return a(),s("div",null,p)}const r=n(e,[["render",o],["__file","atomic-update.html.vue"]]);export{r as default};
