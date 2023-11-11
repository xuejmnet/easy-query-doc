import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e}from"./app-196391d7.js";const t={},p=e(`<p>该监听器用来监听jdbc的执行前后sql和参数还有异常和耗时,可以用来记录慢sql。</p><h2 id="jdbcexecutorlistener" tabindex="-1"><a class="header-anchor" href="#jdbcexecutorlistener" aria-hidden="true">#</a> JdbcExecutorListener</h2><table><thead><tr><th>方法</th><th>默认</th><th>描述</th></tr></thead><tbody><tr><td>enable</td><td>false</td><td>表示是否使用监听器</td></tr><tr><td>onExecuteBefore</td><td>空</td><td>用来记录监听前的参数信息</td></tr><tr><td>onExecuteAfter</td><td>空</td><td>用来监听监听后的参数信息</td></tr></tbody></table><h2 id="自定义监听器" tabindex="-1"><a class="header-anchor" href="#自定义监听器" aria-hidden="true">#</a> 自定义监听器</h2><p>创建一个自定义监听器监听耗时3秒以上的sql,并且发送到监控平台</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LogSlowSQLListener</span> <span class="token keyword">implements</span> <span class="token class-name">JdbcExecutorListener</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">enable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span><span class="token comment">//表示需要开启监听</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteBefore</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteBeforeArg</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">//这边可以通过setState来传递参数</span>
<span class="token comment">//        HashMap&lt;String, Object&gt; state = new HashMap&lt;&gt;();</span>
<span class="token comment">//        arg.setState(state);</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteAfter</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteAfterArg</span> afterArg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">JdbcExecuteBeforeArg</span> beforeArg <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getBeforeArg</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//通过getState来获取before的参数</span>
<span class="token comment">//        Map&lt;String, Object&gt; state = beforeArg.getState();</span>
        <span class="token comment">//记录耗时操作</span>
        <span class="token keyword">long</span> elapsed <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getEnd</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> beforeArg<span class="token punctuation">.</span><span class="token function">getStart</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//耗时3秒以上的sql需要记录</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>elapsed<span class="token operator">&gt;=</span><span class="token number">3</span><span class="token operator">*</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token comment">//发送http请求</span>
            
            <span class="token class-name">String</span> sql <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSql</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">List</span><span class="token punctuation">&lt;</span><span class="token class-name">SQLParameter</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> sqlParameters <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSqlParameters</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>替换掉系统的监听器</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>easyQueryClient <span class="token operator">=</span> <span class="token class-name">EasyQueryBootstrapper</span><span class="token punctuation">.</span><span class="token function">defaultBuilderConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">setDefaultDataSource</span><span class="token punctuation">(</span>dataSource<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">optionConfigure</span><span class="token punctuation">(</span>op <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    op<span class="token punctuation">.</span><span class="token function">setDeleteThrowError</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">useDatabaseConfigure</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MySQLDatabaseConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token comment">//替换掉系统的默认监听行为</span>
                <span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecutorListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">LogSlowSQLListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然这种情况只适合无需外部参数传入的情况下,如果我们需要传递外部<code>bean</code>到框架内部可以直接注册</p><h2 id="springboot为例" tabindex="-1"><a class="header-anchor" href="#springboot为例" aria-hidden="true">#</a> springboot为例</h2><p>假设我们有这个一个日志请求<code>bean</code>通过<code>@Component</code>注册到了<code>springboot</code>中</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">HttpLogRequest</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">send</span><span class="token punctuation">(</span><span class="token class-name">Object</span> request<span class="token punctuation">)</span><span class="token punctuation">{</span>
        
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LogSlowSQLListener</span> <span class="token keyword">implements</span> <span class="token class-name">JdbcExecutorListener</span> <span class="token punctuation">{</span>
    <span class="token comment">//通过构造函数注入</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">HttpLogRequest</span> httpLogRequest<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">LogSlowSQLListener</span><span class="token punctuation">(</span><span class="token class-name">HttpLogRequest</span> httpLogRequest<span class="token punctuation">)</span><span class="token punctuation">{</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>httpLogRequest <span class="token operator">=</span> httpLogRequest<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">enable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span><span class="token comment">//表示需要开启监听</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteBefore</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteBeforeArg</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">//这边可以通过setState来传递参数</span>
<span class="token comment">//        HashMap&lt;String, Object&gt; state = new HashMap&lt;&gt;();</span>
<span class="token comment">//        arg.setState(state);</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteAfter</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteAfterArg</span> afterArg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">JdbcExecuteBeforeArg</span> beforeArg <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getBeforeArg</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//通过getState来获取before的参数</span>
<span class="token comment">//        Map&lt;String, Object&gt; state = beforeArg.getState();</span>
        <span class="token comment">//记录耗时操作</span>
        <span class="token keyword">long</span> elapsed <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getEnd</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> beforeArg<span class="token punctuation">.</span><span class="token function">getStart</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//耗时3秒以上的sql需要记录</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>elapsed<span class="token operator">&gt;=</span><span class="token number">3</span><span class="token operator">*</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token comment">//发送http请求</span>

            <span class="token class-name">String</span> sql <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSql</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">List</span><span class="token punctuation">&lt;</span><span class="token class-name">SQLParameter</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> sqlParameters <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSqlParameters</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyStarterConfigurer</span> <span class="token keyword">implements</span> <span class="token class-name">StarterConfigurer</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Autowired</span>
    <span class="token keyword">private</span> <span class="token class-name">HttpLogRequest</span> httpLogRequest<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">configure</span><span class="token punctuation">(</span><span class="token class-name">ServiceCollection</span> services<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        services<span class="token punctuation">.</span><span class="token function">addService</span><span class="token punctuation">(</span>httpLogRequest<span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//直接注册实例到easy-query内部的依赖注入容器里面</span>
        services<span class="token punctuation">.</span><span class="token function">addService</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecutorListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">LogSlowSQLListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>只要将实例对象<code>HttpLogRequest</code>直接注入到容器中,那么easy-query内部的所有服务都可以直接获取到<code>HttpLogRequest</code>，所以<code>LogSlowSQLListener</code>也可以获取到</p><h2 id="solon" tabindex="-1"><a class="header-anchor" href="#solon" aria-hidden="true">#</a> solon</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Component</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">HttpLogRequest</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">send</span><span class="token punctuation">(</span><span class="token class-name">Object</span> request<span class="token punctuation">)</span><span class="token punctuation">{</span>

    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LogSlowSQLListener</span> <span class="token keyword">implements</span> <span class="token class-name">JdbcExecutorListener</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">HttpLogRequest</span> httpLogRequest<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">LogSlowSQLListener</span><span class="token punctuation">(</span><span class="token class-name">HttpLogRequest</span> httpLogRequest<span class="token punctuation">)</span><span class="token punctuation">{</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>httpLogRequest <span class="token operator">=</span> httpLogRequest<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">enable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span><span class="token comment">//表示需要开启监听</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteBefore</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteBeforeArg</span> arg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">//这边可以通过setState来传递参数</span>
<span class="token comment">//        HashMap&lt;String, Object&gt; state = new HashMap&lt;&gt;();</span>
<span class="token comment">//        arg.setState(state);</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">onExecuteAfter</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecuteAfterArg</span> afterArg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">JdbcExecuteBeforeArg</span> beforeArg <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getBeforeArg</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//通过getState来获取before的参数</span>
<span class="token comment">//        Map&lt;String, Object&gt; state = beforeArg.getState();</span>
        <span class="token comment">//记录耗时操作</span>
        <span class="token keyword">long</span> elapsed <span class="token operator">=</span> afterArg<span class="token punctuation">.</span><span class="token function">getEnd</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> beforeArg<span class="token punctuation">.</span><span class="token function">getStart</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">//耗时3秒以上的sql需要记录</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>elapsed<span class="token operator">&gt;=</span><span class="token number">3</span><span class="token operator">*</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token comment">//发送http请求</span>

            <span class="token class-name">String</span> sql <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSql</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">List</span><span class="token punctuation">&lt;</span><span class="token class-name">SQLParameter</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> sqlParameters <span class="token operator">=</span> beforeArg<span class="token punctuation">.</span><span class="token function">getSqlParameters</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>solon</code>也是一样将需要的<code>bean</code>注入进来，不同的是<code>solon</code>通过监听订阅事件注入即可</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">App</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Solon</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token class-name">App</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span>args<span class="token punctuation">,</span>app<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
            app<span class="token punctuation">.</span><span class="token function">onEvent</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryBuilderConfiguration</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span>e<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
                <span class="token class-name">HttpLogRequest</span> httpLogRequest <span class="token operator">=</span> app<span class="token punctuation">.</span><span class="token function">context</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getBean</span><span class="token punctuation">(</span><span class="token class-name">HttpLogRequest</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                e<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span>httpLogRequest<span class="token punctuation">)</span><span class="token punctuation">;</span>
                e<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">JdbcExecutorListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span><span class="token class-name">LogSlowSQLListener</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,17),c=[p];function o(l,i){return s(),a("div",null,c)}const k=n(t,[["render",o],["__file","jdbc-listener.html.vue"]]);export{k as default};
