import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as a,c as s,e}from"./app-3bcf8e21.js";const t={},o=e(`<p><code>easy-query</code>提供了<code>PrimaryKeyGenerator</code>接口该接口可以由用户自行实现,具体功能就是可以自动对当前对象的主键进行赋值,比如你可以实现一个uuid的或者雪花id的 <code>2.0.43^</code></p><h2 id="primarykeygenerator" tabindex="-1"><a class="header-anchor" href="#primarykeygenerator" aria-hidden="true">#</a> PrimaryKeyGenerator</h2><table><thead><tr><th>方法</th><th>参数</th><th>描述</th></tr></thead><tbody><tr><td>getPrimaryKey</td><td>无</td><td>用来返回一个主键</td></tr><tr><td>setPrimaryKey</td><td>对象,key的columnMetadata</td><td>用来对对象进行设置主键(默认已经实现一个通用方法)</td></tr></tbody></table><p>执行顺序在<code>insert</code>的方法调用<code>executeRows</code>后将先执行对象的<code>PrimaryKeyGenerator.setPrimaryKey</code>然后执行拦截器,所以如果您不需要可以在拦截器里面对其进行从新设置或者清空</p><h2 id="如何使用" tabindex="-1"><a class="header-anchor" href="#如何使用" aria-hidden="true">#</a> 如何使用</h2><ul><li>当前对象必须是数据库对象<code>@Table</code></li><li>当前属性必须是主键<code>@Column(primaryKet=true)</code></li><li>当前属性不可以是生成列<code>@Column(generateKey=true)</code>不可以<code>generateKey=true</code></li><li>当前属性添加<code>@Column(primaryKet=true,primaryKeyGenerator=UUIDPrimaryKeyGenerator.class)</code></li><li>如果有多主键那么也是一样的用法</li></ul><h2 id="uuidprimarykeygenerator" tabindex="-1"><a class="header-anchor" href="#uuidprimarykeygenerator" aria-hidden="true">#</a> UUIDPrimaryKeyGenerator</h2><p>如何实现一个UUID的主键生成器</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Component</span> <span class="token comment">//如果您是springboot</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UUIDPrimaryKeyGenerator</span> <span class="token keyword">implements</span> <span class="token class-name">PrimaryKeyGenerator</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Serializable</span> <span class="token function">getPrimaryKey</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token constant">UUID</span><span class="token punctuation">.</span><span class="token function">randomUUID</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toString</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">replaceAll</span><span class="token punctuation">(</span><span class="token string">&quot;-&quot;</span><span class="token punctuation">,</span><span class="token string">&quot;&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token comment">//    /**</span>
<span class="token comment">//     * 如果需要判断之前是否有值</span>
<span class="token comment">//     * @param entity</span>
<span class="token comment">//     * @param columnMetadata</span>
<span class="token comment">//     */</span>
<span class="token comment">//    @Override</span>
<span class="token comment">//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {</span>
<span class="token comment">//        Serializable primaryKey = getPrimaryKey();</span>
<span class="token comment">//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);</span>
<span class="token comment">//        if(oldValue!=null)</span>
<span class="token comment">//        {</span>
<span class="token comment">//            columnMetadata.getSetterCaller().call(entity, primaryKey);</span>
<span class="token comment">//        }</span>
<span class="token comment">//    }</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_test&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UUIDPrimaryKey</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">,</span>primaryKeyGenerator <span class="token operator">=</span> <span class="token class-name">UUIDPrimaryKeyGenerator</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="雪花id" tabindex="-1"><a class="header-anchor" href="#雪花id" aria-hidden="true">#</a> 雪花id</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//初始化</span>
<span class="token class-name">Snowflake</span> snowflake <span class="token operator">=</span> <span class="token class-name">IdUtil</span><span class="token punctuation">.</span><span class="token function">createSnowflake</span><span class="token punctuation">(</span>workerId<span class="token punctuation">,</span>dataCenterId<span class="token punctuation">)</span>

<span class="token annotation punctuation">@Component</span> <span class="token comment">//如果您是springboot</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SnowflakePrimaryKeyGenerator</span> <span class="token keyword">implements</span> <span class="token class-name">PrimaryKeyGenerator</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Serializable</span> <span class="token function">getPrimaryKey</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span>snowflake<span class="token punctuation">.</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//因为long类型在js中会出现精度丢失</span>
    <span class="token punctuation">}</span>
<span class="token comment">//    /**</span>
<span class="token comment">//     * 如果需要判断之前是否有值</span>
<span class="token comment">//     * @param entity</span>
<span class="token comment">//     * @param columnMetadata</span>
<span class="token comment">//     */</span>
<span class="token comment">//    @Override</span>
<span class="token comment">//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {</span>
<span class="token comment">//        Serializable primaryKey = getPrimaryKey();</span>
<span class="token comment">//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);</span>
<span class="token comment">//        if(oldValue!=null)</span>
<span class="token comment">//        {</span>
<span class="token comment">//            columnMetadata.getSetterCaller().call(entity, primaryKey);</span>
<span class="token comment">//        }</span>
<span class="token comment">//    }</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_test&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SnowflakePrimaryKey</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">,</span>primaryKeyGenerator <span class="token operator">=</span> <span class="token class-name">SnowflakePrimaryKeyGenerator</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="相关搜索" tabindex="-1"><a class="header-anchor" href="#相关搜索" aria-hidden="true">#</a> 相关搜索</h2><p><code>自定义主键</code> <code>雪花id</code> <code>自定义id</code></p>`,13),c=[o];function p(i,l){return a(),s("div",null,c)}const u=n(t,[["render",p],["__file","auto-key.html.vue"]]);export{u as default};
