import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-e8b77e30.js";const p={},e=t(`<p>正常业务开发我们都会选择性的使用自定义异常然后全局拦截来作为业务中断的消息返回到前端。</p><h2 id="异常" tabindex="-1"><a class="header-anchor" href="#异常" aria-hidden="true">#</a> 异常</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BusinessException</span> <span class="token keyword">extends</span> <span class="token class-name">RuntimeException</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">String</span> code<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Object</span> data<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span><span class="token class-name">String</span> message<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">(</span><span class="token string">&quot;-1&quot;</span><span class="token punctuation">,</span>message<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span><span class="token class-name">String</span> message<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span>message<span class="token punctuation">,</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span><span class="token class-name">String</span> code<span class="token punctuation">,</span><span class="token class-name">String</span> message<span class="token punctuation">,</span><span class="token class-name">Object</span> data<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">super</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>code<span class="token operator">=</span>code<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>data<span class="token operator">=</span>data<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> code<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> data<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">//正常业务我们会抛出业务异常</span>

<span class="token class-name">SysUser</span> u<span class="token operator">=</span><span class="token function">query</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">if</span><span class="token punctuation">(</span>u<span class="token operator">==</span><span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span><span class="token string">&quot;未找到对应的用户信息&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="进阶" tabindex="-1"><a class="header-anchor" href="#进阶" aria-hidden="true">#</a> 进阶</h2><p>因为上述代码存在很多冗余重复性的代码,所以我们对全局拦截器进行修改让其拦截<code>easy-query</code>的异常那么上述代码我们可以改成</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">SysUser</span> u<span class="token operator">=</span><span class="token function">query</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;未找到对应的用户信息&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 抛出 EasyQueryFirstNotNullException </span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>如果你大部分的时候不需要编写错误信息且大部分时候错误都是一样的情况下那么我建议这么来处理</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@EasyAssertMessage</span><span class="token punctuation">(</span><span class="token string">&quot;未找到对应的用户信息&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SysUser</span><span class="token punctuation">{</span>
    <span class="token comment">//省略.....</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们在用户表的实体上添加断言信息下面代码可以改成</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">SysUser</span> u<span class="token operator">=</span><span class="token function">query</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;123&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//如果不写自动抛出@EasyAssertMessage内容,也可以手动写入进行覆盖</span>
<span class="token comment">// 抛出 EasyQueryFirstNotNullException </span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="高阶" tabindex="-1"><a class="header-anchor" href="#高阶" aria-hidden="true">#</a> 高阶</h2><p>前面我们通过拦截easy-query的异常来实现自定义响应那么有时候我们系统已经拦截了,我希望easy-query抛出我们自定义的异常怎么办</p><p>这边<code>easy-query</code>提供了接口<code>AssertExceptionFactory</code>我们只需要参考<code>DefaultAssertExceptionFactory</code>然后替换框架默认行为即可<a href="/easy-query-doc/guide/config/replace-configure">可以点击这边查看</a><br> 我们自定义实现类</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyAssertExceptionFactory</span> <span class="token keyword">implements</span> <span class="token class-name">AssertExceptionFactory</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">EntityMetadataManager</span> entityMetadataManager<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">MyAssertExceptionFactory</span><span class="token punctuation">(</span><span class="token class-name">EntityMetadataManager</span> entityMetadataManager<span class="token punctuation">)</span> <span class="token punctuation">{</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>entityMetadataManager <span class="token operator">=</span> entityMetadataManager<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">RuntimeException</span> <span class="token function">createFindNotNullException</span><span class="token punctuation">(</span><span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> query<span class="token punctuation">,</span> <span class="token class-name">String</span> msg<span class="token punctuation">,</span> <span class="token class-name">String</span> code<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>msg <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> code <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">EntityMetadata</span> entityMetadata <span class="token operator">=</span> entityMetadataManager<span class="token punctuation">.</span><span class="token function">getEntityMetadata</span><span class="token punctuation">(</span>query<span class="token punctuation">.</span><span class="token function">queryClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">ErrorMessage</span> errorMessage <span class="token operator">=</span> entityMetadata<span class="token punctuation">.</span><span class="token function">getErrorMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>errorMessage<span class="token punctuation">.</span><span class="token function">getNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">RuntimeException</span> <span class="token function">createRequiredException</span><span class="token punctuation">(</span><span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> query<span class="token punctuation">,</span> <span class="token class-name">String</span> msg<span class="token punctuation">,</span> <span class="token class-name">String</span> code<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>msg <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> code <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">EntityMetadata</span> entityMetadata <span class="token operator">=</span> entityMetadataManager<span class="token punctuation">.</span><span class="token function">getEntityMetadata</span><span class="token punctuation">(</span>query<span class="token punctuation">.</span><span class="token function">queryClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">ErrorMessage</span> errorMessage <span class="token operator">=</span> entityMetadata<span class="token punctuation">.</span><span class="token function">getErrorMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>errorMessage<span class="token punctuation">.</span><span class="token function">getNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">RuntimeException</span> <span class="token function">createFirstNotNullException</span><span class="token punctuation">(</span><span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> query<span class="token punctuation">,</span> <span class="token class-name">String</span> msg<span class="token punctuation">,</span> <span class="token class-name">String</span> code<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>msg <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> code <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">EntityMetadata</span> entityMetadata <span class="token operator">=</span> entityMetadataManager<span class="token punctuation">.</span><span class="token function">getEntityMetadata</span><span class="token punctuation">(</span>query<span class="token punctuation">.</span><span class="token function">queryClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">ErrorMessage</span> errorMessage <span class="token operator">=</span> entityMetadata<span class="token punctuation">.</span><span class="token function">getErrorMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>errorMessage<span class="token punctuation">.</span><span class="token function">getNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">RuntimeException</span> <span class="token function">createSingleNotNullException</span><span class="token punctuation">(</span><span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> query<span class="token punctuation">,</span> <span class="token class-name">String</span> msg<span class="token punctuation">,</span> <span class="token class-name">String</span> code<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>msg <span class="token operator">==</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> code <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">EntityMetadata</span> entityMetadata <span class="token operator">=</span> entityMetadataManager<span class="token punctuation">.</span><span class="token function">getEntityMetadata</span><span class="token punctuation">(</span>query<span class="token punctuation">.</span><span class="token function">queryClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">ErrorMessage</span> errorMessage <span class="token operator">=</span> entityMetadata<span class="token punctuation">.</span><span class="token function">getErrorMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>errorMessage<span class="token punctuation">.</span><span class="token function">getNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span>code<span class="token punctuation">,</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">RuntimeException</span> <span class="token function">createSingleMoreElementException</span><span class="token punctuation">(</span><span class="token class-name">Query</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> query<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">BusinessException</span><span class="token punctuation">(</span><span class="token string">&quot;查询结果大于1条&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="springboot替换" tabindex="-1"><a class="header-anchor" href="#springboot替换" aria-hidden="true">#</a> springboot替换</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token comment">//实现一个启动配置</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyStarterConfigurer</span> <span class="token keyword">implements</span> <span class="token class-name">StarterConfigurer</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">configure</span><span class="token punctuation">(</span><span class="token class-name">ServiceCollection</span> services<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">//addService如果不存在就添加存在就替换</span>
        services<span class="token punctuation">.</span><span class="token function">addService</span><span class="token punctuation">(</span><span class="token class-name">AssertExceptionFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">MyAssertExceptionFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//就会将默认的easy-query实例的异常断言接口进行替换</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyConfiguration</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Bean</span><span class="token punctuation">(</span><span class="token string">&quot;MyStarterConfigurer&quot;</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@Primary</span>
    <span class="token keyword">public</span> <span class="token class-name">StarterConfigurer</span> <span class="token function">starterConfigurer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">MyStarterConfigurer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="非springboot" tabindex="-1"><a class="header-anchor" href="#非springboot" aria-hidden="true">#</a> 非springboot</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token class-name">EasyQueryClient</span> easyQueryClient <span class="token operator">=</span> <span class="token class-name">EasyQueryBootstrapper</span><span class="token punctuation">.</span><span class="token function">defaultBuilderConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">setDefaultDataSource</span><span class="token punctuation">(</span>dataSource<span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">optionConfigure</span><span class="token punctuation">(</span>op <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            op<span class="token punctuation">.</span><span class="token function">setPrintSql</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            op<span class="token punctuation">.</span><span class="token function">setKeepNativeStyle</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">useDatabaseConfigure</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MySQLDatabaseConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">AssertExceptionFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">MyAssertExceptionFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//就会将默认的easy-query实例的异常断言接口进行替换</span>
        <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,18),c=[e];function o(l,i){return s(),a("div",null,c)}const r=n(p,[["render",o],["__file","exception.html.vue"]]);export{r as default};
