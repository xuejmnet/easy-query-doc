import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-3fd52a64.js";const e={},p=t(`<h1 id="对象设计" tabindex="-1"><a class="header-anchor" href="#对象设计" aria-hidden="true">#</a> 对象设计</h1><p><code>easy-query</code>的实战环境会尽可能的给大家带来实际开发过程中我们采用的设计类型，并且给大家带来更多的解决方案</p><p>默认我们都会通过新建一个基类类满足公用的对象,并且会对数据库进行额外设计字段，比如<code>id</code>，<code>createTime</code>，<code>createBy</code>，<code>updateTime</code>，<code>updateBy</code>，<code>deleted</code>，<code>deleteTime</code>，<code>deleteBy</code></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Data</span>
<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">BaseEntity</span> <span class="token keyword">implements</span> <span class="token class-name">Serializable</span><span class="token punctuation">,</span> <span class="token class-name">Cloneable</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1L</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 记录标识;记录标识
     */</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 创建时间;创建时间
     */</span>
    <span class="token annotation punctuation">@UpdateIgnore</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 修改时间;修改时间
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> updateTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 创建人;创建人
     */</span>
    <span class="token annotation punctuation">@UpdateIgnore</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> createBy<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 修改人;修改人
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> updateBy<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 是否删除;是否删除
     * 其中[strategyName = &quot;DELETE_WITH_USER_TIME&quot;]表示逻辑删除策略使用名称叫做[DELETE_WITH_USER_TIME]的
     * 所以你自定义的时候必须注册一个名称[DELETE_WITH_USER_TIME]的逻辑删除
     */</span>
    <span class="token annotation punctuation">@LogicDelete</span><span class="token punctuation">(</span>strategy <span class="token operator">=</span> <span class="token class-name">LogicDeleteStrategyEnum</span><span class="token punctuation">.</span><span class="token constant">CUSTOM</span><span class="token punctuation">,</span>strategyName <span class="token operator">=</span> <span class="token string">&quot;DELETE_WITH_USER_TIME&quot;</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@UpdateIgnore</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> deleted<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 删除人
     */</span>
    <span class="token annotation punctuation">@UpdateIgnore</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> deleteBy<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 删除时间
     */</span>
    <span class="token annotation punctuation">@UpdateIgnore</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> deleteTime<span class="token punctuation">;</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后我们会添加对应的自动添加处理，新建拦截器,需要支持对象插入的时候可以进行创建人和创建时间的自动赋值,对象修改时可以进行修改人和修改时间的自动赋值，表达式更新的时候也可以对修改时间和修改人进行自动处理</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Component</span>
<span class="token annotation punctuation">@AllArgsConstructor</span><span class="token punctuation">(</span>onConstructor_ <span class="token operator">=</span> <span class="token annotation punctuation">@Autowired</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultEntityInterceptor</span> <span class="token keyword">implements</span> <span class="token class-name">EntityInterceptor</span><span class="token punctuation">,</span> <span class="token class-name">UpdateSetInterceptor</span> <span class="token punctuation">{</span>

    <span class="token comment">//如果你是springsecurity可以用这个SecurityContextHolder.getContext()</span>
    <span class="token comment">//如果你是satoken那么直接用StpUtil</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">CurrentUser</span> currentUser<span class="token punctuation">;</span><span class="token comment">//对springboot进行的封装可以通过jwt获取对应的当前操作人用户</span>

    <span class="token doc-comment comment">/**
     * 添加默认的数据
     *
     * <span class="token keyword">@param</span> <span class="token parameter">entityClass</span>
     * <span class="token keyword">@param</span> <span class="token parameter">entityInsertExpressionBuilder</span>
     * <span class="token keyword">@param</span> <span class="token parameter">entity</span>
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">configureInsert</span><span class="token punctuation">(</span><span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> entityClass<span class="token punctuation">,</span> <span class="token class-name">EntityInsertExpressionBuilder</span> entityInsertExpressionBuilder<span class="token punctuation">,</span> <span class="token class-name">Object</span> entity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">BaseEntity</span> baseEntity <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">BaseEntity</span><span class="token punctuation">)</span> entity<span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getCreateTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setCreateTime</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getCreateBy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">String</span> userId <span class="token operator">=</span> <span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">defaultString</span><span class="token punctuation">(</span>currentUser<span class="token punctuation">.</span><span class="token function">getUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">//如果使用sa-token这边采用StpUtil.getLoginIdAsString()会让导致程序需要验证</span>
            <span class="token comment">//,所以这边需要先判断是否登录,未登录就给默认值,不然就获取</span>
            <span class="token comment">//updateBy同理</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setCreateBy</span><span class="token punctuation">(</span>userId<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getUpdateTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setUpdateTime</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getUpdateBy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">String</span> userId <span class="token operator">=</span> <span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">defaultString</span><span class="token punctuation">(</span>currentUser<span class="token punctuation">.</span><span class="token function">getUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setUpdateBy</span><span class="token punctuation">(</span>userId<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getDeleted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setDeleted</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        
        <span class="token keyword">if</span> <span class="token punctuation">(</span>baseEntity<span class="token punctuation">.</span><span class="token function">getId</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            baseEntity<span class="token punctuation">.</span><span class="token function">setId</span><span class="token punctuation">(</span><span class="token class-name">IdHelper</span><span class="token punctuation">.</span><span class="token function">nextId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token comment">//如果你部分对象需要使用雪花id,那么你可以定义一个雪花id的空接口</span>
        <span class="token comment">//然后让对象继承这个空接口</span>
        <span class="token comment">// if(雪花ID.class.isAssignableFrom(entity.getClass())){</span>
        <span class="token comment">//     if (baseEntity.getId() == null) {</span>
        <span class="token comment">//         baseEntity.setId(//赋值雪花id);</span>
        <span class="token comment">//     }</span>
        <span class="token comment">// }else{</span>
        <span class="token comment">//     if (baseEntity.getId() == null) {</span>
        <span class="token comment">//         baseEntity.setId(IdHelper.nextId());</span>
        <span class="token comment">//     }</span>
        <span class="token comment">// }</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加更新对象参数
     *
     * <span class="token keyword">@param</span> <span class="token parameter">entityClass</span>
     * <span class="token keyword">@param</span> <span class="token parameter">entityUpdateExpressionBuilder</span>
     * <span class="token keyword">@param</span> <span class="token parameter">entity</span>
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">configureUpdate</span><span class="token punctuation">(</span><span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> entityClass<span class="token punctuation">,</span> <span class="token class-name">EntityUpdateExpressionBuilder</span> entityUpdateExpressionBuilder<span class="token punctuation">,</span> <span class="token class-name">Object</span> entity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">BaseEntity</span> baseEntity <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">BaseEntity</span><span class="token punctuation">)</span> entity<span class="token punctuation">;</span>
        baseEntity<span class="token punctuation">.</span><span class="token function">setUpdateTime</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">String</span> userId <span class="token operator">=</span> <span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">defaultString</span><span class="token punctuation">(</span>currentUser<span class="token punctuation">.</span><span class="token function">getUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        baseEntity<span class="token punctuation">.</span><span class="token function">setUpdateBy</span><span class="token punctuation">(</span>userId<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 表达式更新set参数添加
     *
     * <span class="token keyword">@param</span> <span class="token parameter">entityClass</span>
     * <span class="token keyword">@param</span> <span class="token parameter">entityUpdateExpressionBuilder</span>
     * <span class="token keyword">@param</span> <span class="token parameter">columnSetter</span>
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">configure</span><span class="token punctuation">(</span><span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> entityClass<span class="token punctuation">,</span> <span class="token class-name">EntityUpdateExpressionBuilder</span> entityUpdateExpressionBuilder<span class="token punctuation">,</span> <span class="token class-name">ColumnSetter</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> columnSetter<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">String</span> updateBy <span class="token operator">=</span> <span class="token string">&quot;updateBy&quot;</span><span class="token punctuation">;</span>
        <span class="token class-name">String</span> updateTime <span class="token operator">=</span> <span class="token string">&quot;updateTime&quot;</span><span class="token punctuation">;</span>
        <span class="token comment">//是否已经set了 如果你觉得你程序里面不会手动去修改这两个值那么也可以不加这个判断</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>entityUpdateExpressionBuilder<span class="token punctuation">.</span><span class="token function">getSetColumns</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">containsOnce</span><span class="token punctuation">(</span>entityClass<span class="token punctuation">,</span> updateBy<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">String</span> userId <span class="token operator">=</span> <span class="token class-name">StringUtils</span><span class="token punctuation">.</span><span class="token function">defaultString</span><span class="token punctuation">(</span>currentUser<span class="token punctuation">.</span><span class="token function">getUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            columnSetter<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>updateBy<span class="token punctuation">,</span> userId<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>entityUpdateExpressionBuilder<span class="token punctuation">.</span><span class="token function">getSetColumns</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">containsOnce</span><span class="token punctuation">(</span>entityClass<span class="token punctuation">,</span> updateTime<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            columnSetter<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>updateTime<span class="token punctuation">,</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;DEFAULT_INTERCEPTOR&quot;</span><span class="token punctuation">;</span><span class="token comment">//后续禁用拦截器或者启用拦截器使用这个名称代表当前拦截器</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">apply</span><span class="token punctuation">(</span><span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> entityClass<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">BaseEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">.</span><span class="token function">isAssignableFrom</span><span class="token punctuation">(</span>entityClass<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建时间和创建人和修改时间修改人已经添加的情况下我们还需要对删除时间删除人进行处理</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Component</span>
<span class="token annotation punctuation">@RequiredArgsConstructor</span><span class="token punctuation">(</span>onConstructor_ <span class="token operator">=</span> <span class="token annotation punctuation">@Autowired</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyBooleanLogicDeleteStrategy</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractLogicDeleteStrategy</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">CurrentUser</span> currentUser<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> allowedPropertyTypes <span class="token operator">=</span><span class="token keyword">new</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token class-name">Arrays</span><span class="token punctuation">.</span><span class="token function">asList</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span><span class="token keyword">boolean</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;DELETE_WITH_USER_TIME&quot;</span><span class="token punctuation">;</span><span class="token comment">//后续用户指定逻辑删除名称就是用这个名称即可</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">allowedPropertyTypes</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> allowedPropertyTypes<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>


    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">protected</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WherePredicate</span><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">getPredicateFilterExpression</span><span class="token punctuation">(</span><span class="token class-name">LogicDeleteBuilder</span> builder<span class="token punctuation">,</span> <span class="token class-name">String</span> propertyName<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>propertyName<span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">protected</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ColumnSetter</span><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">getDeletedSQLExpression</span><span class="token punctuation">(</span><span class="token class-name">LogicDeleteBuilder</span> builder<span class="token punctuation">,</span> <span class="token class-name">String</span> propertyName<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">//表达式内部的参数不可以提取出来,如果提取出来那么就确定了,而不是实时的 如果一定要提取出来请参考下面的方法</span>
        <span class="token keyword">return</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>propertyName<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&quot;deleteBy&quot;</span><span class="token punctuation">,</span>currentUser<span class="token punctuation">.</span><span class="token function">getUserId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">&quot;deleteTime&quot;</span><span class="token punctuation">,</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">//@Override</span>
    <span class="token comment">//protected SQLExpression1&lt;ColumnSetter&lt;Object&gt;&gt; getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {</span>
    <span class="token comment">//    //表达式内部的参数不可以提取出来,如果提取出来那么就确定了,而不是实时的</span>
    <span class="token comment">//    return o -&gt; {</span>
    <span class="token comment">//        //如果判断动态条件过于复杂可以通过大括号来实现内部的编程而不是链式</span>
    <span class="token comment">//        //在这边可以提取对应的表达式参数</span>
    <span class="token comment">//            String userId=currentUser.getUserId();</span>
    <span class="token comment">//            o.set(propertyName, true).set(&quot;deleteBy&quot;,userId).set(&quot;deleteTime&quot;, LocalDateTime.now());</span>
    <span class="token comment">//    };</span>
    <span class="token comment">//}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样我们就完成了新增自动填充创建信息和修改信息,删除自动填充删除信息,而不需要认为手动赋值</p>`,9),c=[p];function o(l,i){return s(),a("div",null,c)}const r=n(e,[["render",o],["__file","index.html.vue"]]);export{r as default};