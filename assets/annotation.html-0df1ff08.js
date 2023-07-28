import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as a,c as s,e as t}from"./app-71423ce0.js";const e={},o=t(`<h1 id="注解说明" tabindex="-1"><a class="header-anchor" href="#注解说明" aria-hidden="true">#</a> 注解说明</h1><h2 id="table" tabindex="-1"><a class="header-anchor" href="#table" aria-hidden="true">#</a> Table</h2><p>描述对象对应数据库表名,vo对象不需要,非数据库对象不需要</p><table><thead><tr><th>属性</th><th>默认值</th><th>描述</th></tr></thead><tbody><tr><td>value</td><td>&quot;&quot;</td><td>数据库表名为空表示 nameConversion.convert(class.getSimpleName) 可以再运行时修改</td></tr><tr><td>schema</td><td>&quot;&quot;</td><td>数据库schema 可以在运行时修改,默认jdbc连接串的database</td></tr><tr><td>ignoreProperties</td><td>{}</td><td>需要忽略的属性,一般用于继承父类需要忽略父类的属性</td></tr><tr><td>shardingInitializer</td><td>UnShardingInitializer.class</td><td>分片初始化器,当且仅当对象是分片对象是用来初始化分片对象,也可以不添加后续手动添加</td></tr></tbody></table><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>
    <span class="token comment">//.....</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="column" tabindex="-1"><a class="header-anchor" href="#column" aria-hidden="true">#</a> Column</h2><p>描述属性对应的列名</p><table><thead><tr><th>属性</th><th>默认值</th><th>描述</th></tr></thead><tbody><tr><td>value</td><td>&quot;&quot;</td><td>对应数据库表的列名,默认空为nameConversion.convert(属性名)</td></tr><tr><td>primaryKey</td><td>false</td><td>表示是否是主键,如果是那么在update对象delete对象将会以这个字段为id</td></tr><tr><td>increment</td><td>false</td><td>是否是自增列,如果是true,那么在获取自增id后将会填充到里面</td></tr><tr><td>large</td><td>false</td><td>用来描述当前列是否是大列,如果是可以通过默认配置或者运行时指定是否需要查询出该列</td></tr><tr><td>conversion</td><td>DefaultValueConverter.class</td><td>值转换器,默认表示不转换,可以自定义枚举或者json等</td></tr><tr><td>valueUpdateAtomicTrack</td><td>DefaultValueUpdateAtomicTrack.class</td><td>原子更新,默认表示无原子更新</td></tr></tbody></table><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span><span class="token string">&quot;title1&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="columnignore" tabindex="-1"><a class="header-anchor" href="#columnignore" aria-hidden="true">#</a> ColumnIgnore</h2><p>添加这个注解的属性将会被直接忽略映射到数据库</p><h2 id="insertignore" tabindex="-1"><a class="header-anchor" href="#insertignore" aria-hidden="true">#</a> InsertIgnore</h2><p>添加这个注解的属性将不会再插入时被赋值</p><h2 id="updateignore" tabindex="-1"><a class="header-anchor" href="#updateignore" aria-hidden="true">#</a> UpdateIgnore</h2><p>添加这个注解的属性将不会再更新时被更新除非手动指定,比如<code>创建时间</code>、<code>创建人</code>、<code>逻辑删除字段</code>,<code>large column</code></p><div class="hint-container warning"><p class="hint-container-title">说明!!!</p><blockquote><p><code>large column</code>添加<code>UpdateIgnore</code>是为了保证大字段被查询出来后如果进行entity全字段更新那么因为<code>title</code>没有被查询所以更新的时候就会把null更新掉(默认更新策略就是全字段),所以这边采用更新忽略,如果需要可以用表达式忽略 [当然您也可以选择更新策略为非null更新]</p></blockquote></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>large<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//大字段字段不需要update时更新 防止全字段更新把原字段改为null</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//创建时间字段不需要update时更新</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@LogicDelete</span><span class="token punctuation">(</span>strategy <span class="token operator">=</span> <span class="token class-name">LogicDeleteStrategyEnum</span><span class="token punctuation">.</span><span class="token constant">BOOLEAN</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//逻辑删除字段不需要update时更新</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> deleted<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="logicdelete" tabindex="-1"><a class="header-anchor" href="#logicdelete" aria-hidden="true">#</a> LogicDelete</h2><p>逻辑删除,表示当前字段对应到数据库是逻辑删除表示,select将会过滤,update也会过滤,delete数据将会被改写为update</p><table><thead><tr><th>属性</th><th>默认值</th><th>描述</th></tr></thead><tbody><tr><td>value</td><td>BOOLEAN</td><td>逻辑删除策略,默认true表示删除,false表示不删除</td></tr><tr><td>strategyName</td><td>&quot;&quot;</td><td>当逻辑删除为自定义逻辑删除时</td></tr></tbody></table><ul><li>BOOLEAN false表示未被删除</li><li>DELETE_LONG_TIMESTAMP 0表示未被删除</li><li>LOCAL_DATE_TIME null表示未被删除</li><li>LOCAL_DATE null表示未被删除</li><li>CUSTOM 用户自定义</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>large<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//大字段字段不需要update时更新 防止全字段更新把原字段改为null</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//创建时间字段不需要update时更新</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@LogicDelete</span><span class="token punctuation">(</span>strategy <span class="token operator">=</span> <span class="token class-name">LogicDeleteStrategyEnum</span><span class="token punctuation">.</span><span class="token constant">BOOLEAN</span><span class="token punctuation">)</span>
    <span class="token annotation punctuation">@UpdateIgnore</span> <span class="token comment">//逻辑删除字段不需要update时更新</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> deleted<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

## <span class="token class-name">Version</span>
乐观锁也就是版本号


属性  <span class="token operator">|</span> 默认值 <span class="token operator">|</span> 描述  
<span class="token operator">--</span><span class="token operator">-</span> <span class="token operator">|</span> <span class="token operator">--</span><span class="token operator">-</span> <span class="token operator">|</span> <span class="token operator">--</span><span class="token operator">-</span> 
value <span class="token operator">|</span> <span class="token operator">-</span> <span class="token operator">|</span> 自行定义版本号策略

### 默认乐观锁版本号策略
<span class="token operator">-</span> <span class="token class-name">VersionIntStrategy</span>
<span class="token operator">-</span> <span class="token class-name">VersionLongStrategy</span>
<span class="token operator">-</span> <span class="token class-name">VersionTimestampStrategy</span> <span class="token punctuation">(</span>不推荐<span class="token punctuation">)</span>
<span class="token operator">-</span> <span class="token class-name">VersionUUIDStrategy</span></code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22),p=[o];function l(i,c){return a(),s("div",null,p)}const u=n(e,[["render",l],["__file","annotation.html.vue"]]);export{u as default};
