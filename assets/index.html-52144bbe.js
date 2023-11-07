import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as a,c as s,e as t}from"./app-f0d5c1b6.js";const p={},e=t(`<h1 id="高级功能" tabindex="-1"><a class="header-anchor" href="#高级功能" aria-hidden="true">#</a> 高级功能</h1><p><code>easy-query</code>的高级功能来自于作者多年的开发经验总结,具有非常强悍的实际实践意义,可以帮你摆脱很多无意义的操作</p><h4 id="目录" tabindex="-1"><a class="header-anchor" href="#目录" aria-hidden="true">#</a> 目录</h4><ul><li><a href="/easy-query-doc/guide/adv/logic-delete">《EasyQuery:逻辑删除》</a> 数据的无价,软删除可以给程序带来后悔药,让用户无需关心底层通过修改<code>delete</code>语句为<code>update</code>来实现自动无感逻辑删除,支持<code>select</code>、<code>update</code>、<code>delete</code></li><li><a href="/easy-query-doc/guide/adv/interceptor">《EasyQuery:全局拦截器》</a> 支持<code>entity</code>对象的插入、更新前的实体拦截修改，<code>select</code>、<code>update</code>、<code>delete</code>的条件自定义,<code>update</code>的<code>set</code>自定义</li></ul><h2 id="编写的所有扩展如何添加到当前orm中" tabindex="-1"><a class="header-anchor" href="#编写的所有扩展如何添加到当前orm中" aria-hidden="true">#</a> 编写的所有扩展如何添加到当前orm中</h2><p>编写的所有扩展比如逻辑删除,拦截器等,如果你是用<code>springboot-starter</code>构建的<code>easy-query</code>那么只需要在扩展上添加<code>@Component</code></p><p>如果你是自行构建的<code>easy-query</code>那么可以获取对应的<code>QueryConfiguration</code>然后<code>apply</code>扩展</p><h3 id="自行处理" tabindex="-1"><a class="header-anchor" href="#自行处理" aria-hidden="true">#</a> 自行处理</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code> <span class="token class-name">QueryRuntimeContext</span> runtimeContext <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">getRuntimeContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">QueryConfiguration</span> configuration <span class="token operator">=</span> runtimeContext<span class="token punctuation">.</span><span class="token function">getQueryConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">DefaultAesEasyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Base64EncryptionStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">JavaEncryptionStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyLogicDeleteStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyLogicDelStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyInterceptor</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyEntityInterceptor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyInterceptor</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Topic1Interceptor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyInterceptor</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyTenantInterceptor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//        configuration.applyShardingInitializer(new FixShardingInitializer());</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyShardingInitializer</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">DataSourceAndTableShardingInitializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyShardingInitializer</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingShardingInitializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyShardingInitializer</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingTimeShardingInitializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyShardingInitializer</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">DataSourceShardingInitializer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyValueConverter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">EnumConverter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyValueConverter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">JsonConverter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyValueConverter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">EnumValueConverter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//        configuration.applyValueUpdateAtomicTrack(new IntegerNotNullValueUpdateAtomicTrack());</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyColumnValueSQLConverter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MySQLAesEncryptColumnValueSQLConverter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyIncrementSQLColumnGenerator</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyDatabaseIncrementSQLColumnGenerator</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">TableRouteManager</span> tableRouteManager <span class="token operator">=</span> runtimeContext<span class="token punctuation">.</span><span class="token function">getTableRouteManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        tableRouteManager<span class="token punctuation">.</span><span class="token function">addRoute</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingTableRoute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        tableRouteManager<span class="token punctuation">.</span><span class="token function">addRoute</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingTimeTableRoute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        tableRouteManager<span class="token punctuation">.</span><span class="token function">addRoute</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingDataSourceTimeTableRoute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">DataSourceRouteManager</span> dataSourceRouteManager <span class="token operator">=</span> runtimeContext<span class="token punctuation">.</span><span class="token function">getDataSourceRouteManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        dataSourceRouteManager<span class="token punctuation">.</span><span class="token function">addRoute</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingDataSourceTimeDataSourceRoute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        dataSourceRouteManager<span class="token punctuation">.</span><span class="token function">addRoute</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TopicShardingDataSourceRoute</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="solon" tabindex="-1"><a class="header-anchor" href="#solon" aria-hidden="true">#</a> solon</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultConfiguration</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Bean</span><span class="token punctuation">(</span>name <span class="token operator">=</span> <span class="token string">&quot;db1&quot;</span><span class="token punctuation">,</span>typed<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">DataSource</span> <span class="token function">db1DataSource</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Inject</span><span class="token punctuation">(</span><span class="token string">&quot;\${db1}&quot;</span><span class="token punctuation">)</span> <span class="token class-name">HikariDataSource</span> dataSource<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> dataSource<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Bean</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">db1QueryConfiguration</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Db</span><span class="token punctuation">(</span><span class="token string">&quot;db1&quot;</span><span class="token punctuation">)</span> <span class="token class-name">QueryConfiguration</span> configuration<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token comment">//在这边进行apply</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyEncryptionStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">JavaEncryptionStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyColumnValueSQLConverter</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MySQLAESColumnValueSQLConverter</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,11),o=[e];function c(u,i){return a(),s("div",null,o)}const r=n(p,[["render",c],["__file","index.html.vue"]]);export{r as default};