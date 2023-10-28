import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-3d622a5f.js";const p={},e=t(`<h1 id="自定义数据库函数" tabindex="-1"><a class="header-anchor" href="#自定义数据库函数" aria-hidden="true">#</a> 自定义数据库函数</h1><p>目前框架未提供相应的数据库函数,仅提供了count,sum,min,max等</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">SELECT</span> t<span class="token punctuation">.</span><span class="token identifier"><span class="token punctuation">\`</span>id<span class="token punctuation">\`</span></span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">\`</span>t_topic<span class="token punctuation">\`</span></span> t <span class="token keyword">WHERE</span> t<span class="token punctuation">.</span><span class="token identifier"><span class="token punctuation">\`</span>id<span class="token punctuation">\`</span></span> <span class="token operator">=</span> ? <span class="token operator">AND</span> FIND_IN_SET<span class="token punctuation">(</span>?<span class="token punctuation">,</span>t<span class="token punctuation">.</span><span class="token identifier"><span class="token punctuation">\`</span>id<span class="token punctuation">\`</span></span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>加入我们要实现这么一个数据库语句,那么我们应该如何实现,接下来我们将使用<code>easy-query</code>的<code>sqlNativeSegment</code>封装和<code>sqlFunc</code>和<code>sqlFuncAs</code>能力实现单列的数据库函数</p><h2 id="find-in-set编写" tabindex="-1"><a class="header-anchor" href="#find-in-set编写" aria-hidden="true">#</a> FIND_IN_SET编写</h2><h3 id="sqlnativesegment封装" tabindex="-1"><a class="header-anchor" href="#sqlnativesegment封装" aria-hidden="true">#</a> sqlNativeSegment封装</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">//创建一个mysql的方言提供者</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">MySQLProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token comment">//因为是在where处所以这边获取属性的\`WherePredicate\`如果是lambda则获取\`SQLWherePredicate\`</span>
    <span class="token class-name">WherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">default</span> <span class="token class-name">MySQLProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">findInSet</span><span class="token punctuation">(</span><span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SQLNativePropertyExpressionContext</span><span class="token punctuation">&gt;</span></span> first<span class="token punctuation">,</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SQLNativePropertyExpressionContext</span><span class="token punctuation">&gt;</span></span> second<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token function">getWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">sqlNativeSegment</span><span class="token punctuation">(</span><span class="token string">&quot;FIND_IN_SET({0},{1})&quot;</span><span class="token punctuation">,</span>c<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
            first<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
            second<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">//实现类</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MySQLProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">implements</span> <span class="token class-name">MySQLProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">WherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> wherePredicate<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">MySQLProviderImpl</span><span class="token punctuation">(</span><span class="token class-name">WherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> wherePredicate<span class="token punctuation">)</span><span class="token punctuation">{</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>wherePredicate <span class="token operator">=</span> wherePredicate<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">WherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> wherePredicate<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


 <span class="token class-name">String</span> sql1 <span class="token operator">=</span> easyQueryClient<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token class-name">MySQLProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> mySQLProvider <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MySQLProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>o<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    mySQLProvider<span class="token punctuation">.</span><span class="token function">findInSet</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>c<span class="token punctuation">.</span><span class="token function">value</span><span class="token punctuation">(</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>c<span class="token operator">-&gt;</span>c<span class="token punctuation">.</span><span class="token function">expression</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT t.\`id\` FROM \`t_topic\` t WHERE t.\`id\` = ? AND FIND_IN_SET(?,t.\`id\`)&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token comment">//强类型表达式可以选择这种模式</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">MySQLLambdaProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token class-name">SQLWherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getSQLWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">default</span> <span class="token class-name">MySQLLambdaProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">findInSet</span><span class="token punctuation">(</span><span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SQLNativeLambdaExpressionContext</span><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> first<span class="token punctuation">,</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SQLNativeLambdaExpressionContext</span><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> second<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token function">getSQLWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">sqlNativeSegment</span><span class="token punctuation">(</span><span class="token string">&quot;FIND_IN_SET({0},{1})&quot;</span><span class="token punctuation">,</span>c<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
            first<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
            second<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span>c<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">//强类型实现类</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MySQLLambdaProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">implements</span> <span class="token class-name">MySQLLambdaProvider</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">SQLWherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> sqlWherePredicate<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">MySQLLambdaProviderImpl</span><span class="token punctuation">(</span><span class="token class-name">SQLWherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> sqlWherePredicate<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>sqlWherePredicate <span class="token operator">=</span> sqlWherePredicate<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">SQLWherePredicate</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getSQLWherePredicate</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sqlWherePredicate<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token class-name">String</span> sql1 <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token class-name">MySQLLambdaProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> mySQLProvider <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MySQLLambdaProviderImpl</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>o<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    mySQLProvider<span class="token punctuation">.</span><span class="token function">findInSet</span><span class="token punctuation">(</span>c<span class="token operator">-&gt;</span>c<span class="token punctuation">.</span><span class="token function">value</span><span class="token punctuation">(</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>c<span class="token operator">-&gt;</span>c<span class="token punctuation">.</span><span class="token function">expression</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT t.\`id\` FROM \`t_topic\` t WHERE t.\`id\` = ? AND FIND_IN_SET(?,t.\`id\`)&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果你不想使用封装的方法可以使用原生的<code>sqlNativeSegment</code></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token class-name">String</span> sql1 <span class="token operator">=</span> easyQueryClient<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            o<span class="token punctuation">.</span><span class="token function">sqlNativeSegment</span><span class="token punctuation">(</span><span class="token string">&quot;FIND_IN_SET({0},{1})&quot;</span><span class="token punctuation">,</span>c<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
                c<span class="token punctuation">.</span><span class="token function">value</span><span class="token punctuation">(</span><span class="token string">&quot;1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">expression</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toSQL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Assert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span><span class="token string">&quot;SELECT t.\`id\` FROM \`t_topic\` t WHERE t.\`id\` = ? AND FIND_IN_SET(?,t.\`id\`)&quot;</span><span class="token punctuation">,</span> sql1<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,9),c=[e];function o(l,i){return s(),a("div",null,c)}const r=n(p,[["render",o],["__file","column-func-new.html.vue"]]);export{r as default};
