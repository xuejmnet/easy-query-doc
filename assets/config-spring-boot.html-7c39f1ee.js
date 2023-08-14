import{_ as t}from"./plugin-vue_export-helper-c27b6911.js";import{r as p,o as e,c as o,a as n,b as a,d as c,e as i}from"./app-9b1a9ed9.js";const u={},l=n("h1",{id:"springboot配置",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#springboot配置","aria-hidden":"true"},"#"),a(" SpringBoot配置")],-1),r=n("h2",{id:"获取最新",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#获取最新","aria-hidden":"true"},"#"),a(" 获取最新")],-1),k={href:"https://central.sonatype.com/",target:"_blank",rel:"noopener noreferrer"},d=n("code",null,"com.easy-query",-1),v=i(`<h2 id="spring-boot工程" tabindex="-1"><a class="header-anchor" href="#spring-boot工程" aria-hidden="true">#</a> spring-boot工程</h2><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>properties</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>easy-query.version</span><span class="token punctuation">&gt;</span></span>latest-version<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>easy-query.version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>properties</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>com.easy-query<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>sql-springboot-starter<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>\${easy-query.version}<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment">#配置文件</span>
<span class="token key atrule">easy-query</span><span class="token punctuation">:</span>
  <span class="token key atrule">enable</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token key atrule">database</span><span class="token punctuation">:</span> mysql
  <span class="token key atrule">name-conversion</span><span class="token punctuation">:</span> underlined
  <span class="token key atrule">delete-throw</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token key atrule">print-sql</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//依赖注入</span>
<span class="token annotation punctuation">@Autowired</span>
<span class="token keyword">private</span> <span class="token class-name">EasyQueryClient</span> easyQueryClient<span class="token punctuation">;</span><span class="token comment">//通过字符串属性方式来实现查询</span>

<span class="token comment">//推荐</span>
<span class="token annotation punctuation">@Autowired</span>
<span class="token keyword">private</span> <span class="token class-name">EasyQuery</span> easyQuery<span class="token punctuation">;</span><span class="token comment">//对EasyQueryClient的增强通过lambda方式实现查询(推荐)</span>

<span class="token comment">//推荐</span>
<span class="token annotation punctuation">@Autowired</span>
<span class="token keyword">private</span> <span class="token class-name">EasyProxyQuery</span> easyProxyQuery<span class="token punctuation">;</span><span class="token comment">//对EasyQueryClient的增强通过apt代理模式实现强类型(推荐)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="springboot多数据源" tabindex="-1"><a class="header-anchor" href="#springboot多数据源" aria-hidden="true">#</a> springboot多数据源</h2><p>因为<code>easy-query</code>默认仅支持但数据源如果需要支持多数据源可以通过手动构建<code>EasyQuery</code>的Bean实例</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Bean</span>
    <span class="token annotation punctuation">@ConditionalOnMissingBean</span>
    <span class="token keyword">public</span> <span class="token class-name">EasyQuery</span> <span class="token function">easyQuery</span><span class="token punctuation">(</span><span class="token class-name">DataSource</span> dataSource<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">EasyQueryClient</span> easyQueryClient <span class="token operator">=</span> <span class="token class-name">EasyQueryBootstrapper</span><span class="token punctuation">.</span><span class="token function">defaultBuilderConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">setDefaultDataSource</span><span class="token punctuation">(</span>dataSource<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">DataSourceUnitFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">SpringDataSourceUnitFactory</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token comment">//springboot下必须用来支持事务</span>
                <span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">ConnectionManager</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">SpringConnectionManager</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token comment">//springboot下必须用来支持事务</span>
                <span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">NameConversion</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">UnderlinedNameConversion</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">optionConfigure</span><span class="token punctuation">(</span>builder <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    builder<span class="token punctuation">.</span><span class="token function">setDeleteThrowError</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getDeleteThrow</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setInsertStrategy</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getInsertStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setUpdateStrategy</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getUpdateStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setMaxShardingQueryLimit</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getMaxShardingQueryLimit</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setExecutorMaximumPoolSize</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getExecutorMaximumPoolSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setExecutorCorePoolSize</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getExecutorCorePoolSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setThrowIfRouteNotMatch</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isThrowIfRouteNotMatch</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setShardingExecuteTimeoutMillis</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getShardingExecuteTimeoutMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setQueryLargeColumn</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isQueryLargeColumn</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setMaxShardingRouteCount</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getMaxShardingRouteCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setExecutorQueueSize</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getExecutorQueueSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setDefaultDataSourceName</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getDefaultDataSourceName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setDefaultDataSourceMergePoolSize</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getDefaultDataSourceMergePoolSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setMultiConnWaitTimeoutMillis</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getMultiConnWaitTimeoutMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setWarningBusy</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isWarningBusy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setInsertBatchThreshold</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getInsertBatchThreshold</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setUpdateBatchThreshold</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getUpdateBatchThreshold</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setPrintSql</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isPrintSql</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setStartTimeJob</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isStartTimeJob</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setDefaultTrack</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isDefaultTrack</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setRelationGroupSize</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">getRelationGroupSize</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    builder<span class="token punctuation">.</span><span class="token function">setNoVersionError</span><span class="token punctuation">(</span>easyQueryProperties<span class="token punctuation">.</span><span class="token function">isNoVersionError</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">useDatabaseConfigure</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MySQLDatabaseConfiguration</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//         QueryConfiguration queryConfiguration = easyQueryClient.getRuntimeContext().getQueryConfiguration();</span>

<span class="token comment">//         configuration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());</span>
<span class="token comment">//         configuration.applyEncryptionStrategy(new Base64EncryptionStrategy());</span>
<span class="token comment">//         configuration.applyEncryptionStrategy(new MyEncryptionStrategy());</span>
<span class="token comment">//         configuration.applyEncryptionStrategy(new JavaEncryptionStrategy());</span>
<span class="token comment">//         configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());</span>
<span class="token comment">//         configuration.applyInterceptor(new MyEntityInterceptor());</span>
<span class="token comment">//         configuration.applyInterceptor(new Topic1Interceptor());</span>
<span class="token comment">//         configuration.applyInterceptor(new MyTenantInterceptor());</span>
<span class="token comment">// //        configuration.applyShardingInitializer(new FixShardingInitializer());</span>
<span class="token comment">//         configuration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());</span>
<span class="token comment">//         configuration.applyShardingInitializer(new TopicShardingShardingInitializer());</span>
<span class="token comment">//         configuration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());</span>
<span class="token comment">//         configuration.applyShardingInitializer(new DataSourceShardingInitializer());</span>
<span class="token comment">//         configuration.applyValueConverter(new EnumConverter());</span>
<span class="token comment">//         configuration.applyValueConverter(new JsonConverter());</span>
<span class="token comment">//         configuration.applyValueUpdateAtomicTrack(new IntegerNotValueUpdateAtomicTrack());</span>
<span class="token comment">//         configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());</span>
<span class="token comment">//         configuration.applyIncrementSQLColumnGenerator(new MyDatabaseIncrementSQLColumnGenerator());</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">EasyQuery</span><span class="token punctuation">(</span>easyQueryClient<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="springboot-启动报错" tabindex="-1"><a class="header-anchor" href="#springboot-启动报错" aria-hidden="true">#</a> SpringBoot 启动报错</h2><div class="hint-container danger"><p class="hint-container-title">注意</p><blockquote><p>因为默认添加了track的aop如果启动报错那么就添加一下aop</p></blockquote></div><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token exception javastacktrace language-javastacktrace">java<span class="token punctuation">.</span>lang<span class="token punctuation">.</span>IllegalStateException<span class="token punctuation">:</span> Unable to load cache item
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>internal<span class="token punctuation">.</span>LoadingCache<span class="token punctuation">.</span><span class="token function">createEntry</span><span class="token punctuation">(</span>LoadingCache<span class="token punctuation">.</span>java<span class="token punctuation">:</span>79<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>internal<span class="token punctuation">.</span>LoadingCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>LoadingCache<span class="token punctuation">.</span>java<span class="token punctuation">:</span>34<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>AbstractClassGenerator$ClassLoaderData<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>AbstractClassGenerator<span class="token punctuation">.</span>java<span class="token punctuation">:</span>134<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>AbstractClassGenerator<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>AbstractClassGenerator<span class="token punctuation">.</span>java<span class="token punctuation">:</span>319<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>proxy<span class="token punctuation">.</span>Enhancer<span class="token punctuation">.</span><span class="token function">createHelper</span><span class="token punctuation">(</span>Enhancer<span class="token punctuation">.</span>java<span class="token punctuation">:</span>572<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>proxy<span class="token punctuation">.</span>Enhancer<span class="token punctuation">.</span><span class="token function">createClass</span><span class="token punctuation">(</span>Enhancer<span class="token punctuation">.</span>java<span class="token punctuation">:</span>419<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>主要原因是</p><ul><li>缺少aop依赖</li><li>aop组件版本不对</li></ul><p>解决办法添加对应的依赖</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-aop<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,14);function m(g,y){const s=p("ExternalLinkIcon");return e(),o("div",null,[l,r,n("p",null,[n("a",k,[a("https://central.sonatype.com/"),c(s)]),a(" 搜索"),d,a("获取最新安装包")]),v])}const h=t(u,[["render",m],["__file","config-spring-boot.html.vue"]]);export{h as default};
