import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-5a7aa583.js";const e="/easy-query-doc/plugin-max1.jpg",p="/easy-query-doc/plugin-max2.jpg",o="/easy-query-doc/plugin-max3.jpg",c="/easy-query-doc/plugin-max4.jpg",i="/easy-query-doc/plugin-max5.jpg",l={},u=t('<p>为了解放生产力我推荐您使用<code>EasyEntityQuery</code>的apt模式无论是原生<code>apt</code>还是<code>file proxy</code>都可以让你的代码编写有一个质的飞跃和提升,或许我们做的还不够好但是您的使用体验和反馈会让整个生态繁荣</p><h1 id="配合插件" tabindex="-1"><a class="header-anchor" href="#配合插件" aria-hidden="true">#</a> 配合插件</h1><h2 id="解决痛点一" tabindex="-1"><a class="header-anchor" href="#解决痛点一" aria-hidden="true">#</a> 解决痛点一</h2><p>我们都知道<code>easy-query</code>无论在哪个模式下都需要编写lambda,lambda的编写是复杂的是最麻烦的,便捷轻量的<code>easy-quer</code>y配合<code>x-&gt;{}</code>或者<code>((a,b,c)-&gt;)</code>的变量名命名是痛苦的<br> 所以我们在<code>easy-query:1.9.34^</code>版本并且插件<code>0.0.25^</code>后推出了变量名功能</p><h3 id="easyalias" tabindex="-1"><a class="header-anchor" href="#easyalias" aria-hidden="true">#</a> EasyAlias</h3><p>为插件赋能添加别名用于lambda</p><img src="'+e+'"><p>添加别名用于lambda的参数入参名称</p><img src="'+p+'"><p>直接使用<code>where</code>、<code>select</code>等支持代码直接生成lambda的箭头符合如果带有<code>_code_block</code>并且会生成对应的<code>{}</code>大括号一对<br><img src="'+o+'"></p><div class="hint-container warning"><p class="hint-container-title">注意点及说明!!!</p><blockquote><p>如果您没有配置<code>@EasyAlias</code>那么可以在<code>Tools</code>-&gt;<code>QuickTipSetting</code>设置</p></blockquote></div><h3 id="quicktipsetting" tabindex="-1"><a class="header-anchor" href="#quicktipsetting" aria-hidden="true">#</a> QuickTipSetting</h3><p>为没有添加<code>@EasyAlias</code>的对象添加lambda入参别名<br><img src="'+c+'"></p><img src="'+i+`"><div class="hint-container tip"><p class="hint-container-title">填写说明</p><blockquote><p><code>o,t1:t2,t1:t2:t3</code>先按逗号分割,然后按冒号分割,分割结果按逗号分组,如果每组数量和lambda数量一致则使用这边的参数,如果配置了<code>@EasyAlias</code>对应的那个还是用<code>@EasyAlias</code><br> 比如查询单表没有配置<code>@EasyAlias</code>但是全局配置了<code>o,t1:t2,t1:t2:t3</code>,那么入参一个就会生成<code>queryable(Topic.class).where(o-&gt;)</code><br> 如果参数不匹配则会按照每个对象的对象名称获取大写字母组成缩写,但是如果大写字母就一个则采用类名小写模式,比如<code>queryable(Topic.class).where(t-&gt;)</code></p></blockquote><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
    <span class="token doc-comment comment">/**
     * 将对象类型转成lambda入参短名称
     * <span class="token keyword">@param</span> <span class="token parameter">str</span> Topic || SysUser
     * <span class="token keyword">@param</span> <span class="token parameter">index</span> 在第几个参数位
     * <span class="token keyword">@param</span> <span class="token parameter">total</span> 总共有几个参数
     * <span class="token keyword">@return</span>
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">String</span> <span class="token function">lambdaShortName</span><span class="token punctuation">(</span><span class="token class-name">String</span> str<span class="token punctuation">,</span><span class="token keyword">int</span> index<span class="token punctuation">,</span><span class="token keyword">int</span> total<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">char</span><span class="token punctuation">[</span><span class="token punctuation">]</span> chars <span class="token operator">=</span> str<span class="token punctuation">.</span><span class="token function">toCharArray</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span><span class="token punctuation">(</span>chars<span class="token punctuation">.</span>length<span class="token operator">==</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
            <span class="token keyword">return</span> <span class="token string">&quot;t&quot;</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> chars<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Character</span><span class="token punctuation">.</span><span class="token function">isUpperCase</span><span class="token punctuation">(</span>chars<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">String</span> parameter <span class="token operator">=</span> <span class="token class-name">String</span><span class="token punctuation">.</span><span class="token function">valueOf</span><span class="token punctuation">(</span>chars<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toLowerCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">if</span><span class="token punctuation">(</span>total<span class="token operator">&gt;</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
                    <span class="token keyword">return</span> parameter<span class="token operator">+</span><span class="token punctuation">(</span>index<span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">return</span> parameter<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> str<span class="token punctuation">.</span><span class="token function">toLowerCase</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div><h2 id="智能提示" tabindex="-1"><a class="header-anchor" href="#智能提示" aria-hidden="true">#</a> 智能提示</h2><p><code>select</code>,<code>where</code>,<code>where_code_block</code>,<code>orderBy</code>,<code>orderBy_code_block</code>,<code>groupBy</code>,<code>having</code>,<code>having_code_block</code>,<code>on</code>,<code>on_code_block</code><br> 前面几个都是直接<code>.</code>使用即可</p><p>只有<code>join</code>比较特殊,<code>join</code>需要编写完<code>.leftJoin(Toplic.class, on )</code>在第一个join表写完后逗号后面空格填写<code>on</code>那么就会有对应的只能提示来填充lambda参数</p><h2 id="默认错误消息" tabindex="-1"><a class="header-anchor" href="#默认错误消息" aria-hidden="true">#</a> 默认错误消息</h2><p><code>EasyAssertMessage</code>注解实现默认错误消息</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@EasyAssertMessage</span><span class="token punctuation">(</span><span class="token string">&quot;未找到主题信息&quot;</span><span class="token punctuation">)</span>
<span class="token annotation punctuation">@EasyAlias</span><span class="token punctuation">(</span><span class="token string">&quot;topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span><span class="token punctuation">{</span>
    <span class="token comment">//......</span>
<span class="token punctuation">}</span>
<span class="token comment">//默认错误</span>
<span class="token comment">// select 1 from topic where id=?</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">required</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息 </span>
<span class="token comment">// select id,name,age.... from topic where id=?</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">findNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>
<span class="token comment">// select id,name,age.... from topic where id=? limit 1</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>
<span class="token comment">// select id,name,age.... from topic where id=? 附加断言仅一条</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">singleNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>



<span class="token comment">//手动错误</span>
<span class="token comment">// select 1 from topic where id=?</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">required</span><span class="token punctuation">(</span><span class="token string">&quot;自定义错误&quot;</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息 </span>
<span class="token comment">// select id,name,age.... from topic where id=?</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">findNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span><span class="token string">&quot;自定义错误&quot;</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>
<span class="token comment">// select id,name,age.... from topic where id=? limit 1</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">firstNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;自定义错误&quot;</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>
<span class="token comment">// select id,name,age.... from topic where id=? 附加断言仅一条</span>
easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">whereById</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">singleNotNull</span><span class="token punctuation">(</span><span class="token string">&quot;自定义错误&quot;</span><span class="token punctuation">)</span><span class="token comment">//抛错 未找到主题信息</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,21),d=[u];function r(k,m){return s(),a("div",null,d)}const b=n(l,[["render",r],["__file","plugin-plus-max-ultra.html.vue"]]);export{b as default};
