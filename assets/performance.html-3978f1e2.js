import{_ as e,W as p,X as c,Y as n,Z as s,$ as t,a2 as l,C as i}from"./framework-6199cc12.js";const o={},u=n("h1",{id:"easy-query「性能」对比",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#easy-query「性能」对比","aria-hidden":"true"},"#"),s(" easy-query「性能」对比")],-1),g=n("p",null,"本文主要是展示了easy-query和 Mybatis-Flex 和 Mybaits-Plus 的「性能」对比。Mybaits-Plus 是一个非常优秀 Mybaits 增强框架， 其开源于 2016 年，有很多的成功案例。Mybatis-Flex是一款最新开源的高性能orm数据库",-1),d=n("p",null,"本文只阐述了「性能」方面的对比。",-1),r=n("h2",{id:"测试方法",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#测试方法","aria-hidden":"true"},"#"),s(" 测试方法")],-1),k=n("p",null,"使用 h2 数据库，在初始化的时候分别为easy-query和 mybatis-flex 和 mybatis-plus 创建三个不同的数据库， 但是完全一样的数据结构、数据内容和数据量（每个库 2w 条数据）。",-1),v=n("p",null,"开始之前先进行预热，之后通过打印时间戳的方式进行对比，谁消耗的时间越少，则性能越高（每次测试 10 轮）。",-1),m={href:"https://github.com/xuejmnet/easy-query-benchmark",target:"_blank",rel:"noopener noreferrer"},b=l(`<div class="hint-container tip"><p class="hint-container-title">测试说明</p><blockquote><p>在以下的所有测试中，有可能因为每个人的电脑性能不同，测试的结果会有所不同。</p></blockquote></div><h2 id="测试单条数据查询" tabindex="-1"><a class="header-anchor" href="#测试单条数据查询" aria-hidden="true">#</a> 测试单条数据查询</h2><p>Mybatis-Flex 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span>
<span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">USER_NAME</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectOneByQuery</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>EasyQuery 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">)</span>
                        <span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                        <span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">firstOrNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Mybatis-Plus 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;user_name&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">last</span><span class="token punctuation">(</span><span class="token string">&quot;limit 1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectOne</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>10 轮的测试结果：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:46
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:42
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:355
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:341
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:41
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:38
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:335
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:318
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:41
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:34
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:362
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:317
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:41
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:43
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:302
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:280
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:36
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:293
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:337
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:35
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:272
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:259
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:44
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:273
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:270
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:35
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:29
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:259
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:251
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:254
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:246
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectOne:30
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectOne:34
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOneWithLambda:251
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectOne:244
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">测试结论</p><blockquote><p>Easy-Query和Mybatis-Flex 的查询单条数据的速度相当，大概是 Mybatis-Plus 的 5 ~ 10+ 倍。因为是查询单条数据所以可以近似理解为表达式生成sql的能力差距大概是5-10倍</p></blockquote></div><h2 id="测试列表-list-数据查询" tabindex="-1"><a class="header-anchor" href="#测试列表-list-数据查询" aria-hidden="true">#</a> 测试列表(List)数据查询</h2><p>要求返回的数据为 10 条数据。</p><p>Mybatis-Flex 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">USER_NAME</span>
<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectListByQuery</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Easy-Query 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Mybatis-Plus 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;user_name&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">last</span><span class="token punctuation">(</span><span class="token string">&quot;limit 10&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectList</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>10 轮的测试结果：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:40
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:37
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:259
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:245
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:39
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:33
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:256
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:245
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:39
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:34
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:249
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:238
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:39
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:248
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:238
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:38
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:249
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:237
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:40
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:29
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:243
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:243
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:37
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:29
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:247
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:244
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:36
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:29
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:248
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:244
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:35
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:27
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:245
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:245
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10:34
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10:25
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10WithLambda:247
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10:239

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">测试结论</p><blockquote><p>本次查询10条的情况下可以看到Easy-Query已经略微快于Mybatis-Flex,依然是 Mybatis-Plus 的 5 ~ 10+ 倍</p></blockquote></div><h2 id="测试列表-list1w-数据查询" tabindex="-1"><a class="header-anchor" href="#测试列表-list1w-数据查询" aria-hidden="true">#</a> 测试列表(List1W)数据查询</h2><p>要求返回的数据为 10000 条数据。</p><p>Mybatis-Flex 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">USER_NAME</span>
<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectListByQuery</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Easy-Query 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span><span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Mybatis-Plus 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">or</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;user_name&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;admin&quot;</span> <span class="token operator">+</span> <span class="token class-name">ThreadLocalRandom</span><span class="token punctuation">.</span><span class="token function">current</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">nextInt</span><span class="token punctuation">(</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
queryWrapper<span class="token punctuation">.</span><span class="token function">last</span><span class="token punctuation">(</span><span class="token string">&quot;limit 10000&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectList</span><span class="token punctuation">(</span>queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>10 轮的测试结果：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12812
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3981
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7821
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7807
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12806
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3965
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7794
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7798
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12759
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3977
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7851
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7780
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12779
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3964
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7803
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7805
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12969
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3984
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7856
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7780
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12743
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3974
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7784
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7772
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12662
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3969
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7776
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7745
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12721
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3985
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7790
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7755
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12731
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3953
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7762
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7751
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexSelectTop10000:12728
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasySelectTop10000:3975
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000WithLambda:7759
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusSelectTop10000:7771

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">测试结论</p><blockquote><p>本次查询10000条的情况下可以看到Easy-Query已经完全快于Mybatis-Flex大概是其3倍,是 Mybatis-Plus 的2 倍,本次结果可以得出Mybatis-Flex的优点是快速生成sql,但是在jdbc到bean对象的转换是相对低效的</p></blockquote></div><h2 id="分页查询" tabindex="-1"><a class="header-anchor" href="#分页查询" aria-hidden="true">#</a> 分页查询</h2><p>Mybatis-Flex 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">paginate</span><span class="token punctuation">(</span>page<span class="token punctuation">,</span> pageSize<span class="token punctuation">,</span> <span class="token number">20000</span><span class="token punctuation">,</span> queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Easy-Query 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span>page<span class="token punctuation">,</span>pageSize<span class="token punctuation">,</span><span class="token number">20000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Mybatis-Plus 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">LambdaQueryWrapper</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">PlusAccount</span><span class="token punctuation">&gt;</span></span> queryWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LambdaQueryWrapper</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    queryWrapper<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    queryWrapper<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getEmail</span><span class="token punctuation">,</span> <span class="token string">&quot;michael@gmail.com&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">Page</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">PlusAccount</span><span class="token punctuation">&gt;</span></span> p <span class="token operator">=</span> <span class="token class-name">Page</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>page<span class="token punctuation">,</span> pageSize<span class="token punctuation">,</span> <span class="token number">20000</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
mapper<span class="token punctuation">.</span><span class="token function">selectPage</span><span class="token punctuation">(</span>p<span class="token punctuation">,</span> queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>10 轮的测试结果：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:41
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:21
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:246
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:39
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:20
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:243
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:35
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:20
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:239
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:33
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:19
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:236
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:234
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:235
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:238
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:233
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:32
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:232
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexPaginate:31
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyPaginate:18
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusPaginate:232
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">测试结论</p><blockquote><p>分页查询速度 Easy-Query快于Mybatis-Flex 远快于 Mybatis-Plus ，大概是 Mybatis-Plus 的 5~10 倍左右。</p></blockquote></div><h2 id="数据更新" tabindex="-1"><a class="header-anchor" href="#数据更新" aria-hidden="true">#</a> 数据更新</h2><p>Mybatis-Flex 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">FlexAccount</span> flexAccount <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FlexAccount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
flexAccount<span class="token punctuation">.</span><span class="token function">setUserName</span><span class="token punctuation">(</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span>
flexAccount<span class="token punctuation">.</span><span class="token function">setNickname</span><span class="token punctuation">(</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name">QueryWrapper</span> queryWrapper <span class="token operator">=</span> <span class="token class-name">QueryWrapper</span><span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token number">9200</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">and</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">ID</span><span class="token punctuation">.</span><span class="token function">le</span><span class="token punctuation">(</span><span class="token number">9300</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">and</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">USER_NAME</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">and</span><span class="token punctuation">(</span><span class="token constant">FLEX_ACCOUNT</span><span class="token punctuation">.</span><span class="token constant">NICKNAME</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

mapper<span class="token punctuation">.</span><span class="token function">updateByQuery</span><span class="token punctuation">(</span>flexAccount<span class="token punctuation">,</span> queryWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Easy-Query 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>easyQuery<span class="token punctuation">.</span><span class="token function">updatable</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getNickname</span><span class="token punctuation">,</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">9000</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">le</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span><span class="token number">9100</span><span class="token punctuation">)</span>
                        <span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span><span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span>
                        <span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryAccount</span><span class="token operator">::</span><span class="token function">getNickname</span><span class="token punctuation">,</span><span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Mybatis-Plus 的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">PlusAccount</span> plusAccount <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">PlusAccount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
plusAccount<span class="token punctuation">.</span><span class="token function">setUserName</span><span class="token punctuation">(</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span>
plusAccount<span class="token punctuation">.</span><span class="token function">setNickname</span><span class="token punctuation">(</span><span class="token string">&quot;testInsert&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token class-name">LambdaUpdateWrapper</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">PlusAccount</span><span class="token punctuation">&gt;</span></span> updateWrapper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LambdaUpdateWrapper</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
updateWrapper<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token number">9000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
updateWrapper<span class="token punctuation">.</span><span class="token function">le</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token number">9100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
updateWrapper<span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getUserName</span><span class="token punctuation">,</span> <span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
updateWrapper<span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token class-name">PlusAccount</span><span class="token operator">::</span><span class="token function">getNickname</span><span class="token punctuation">,</span> <span class="token string">&quot;admin&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

mapper<span class="token punctuation">.</span><span class="token function">update</span><span class="token punctuation">(</span>plusAccount<span class="token punctuation">,</span> lambdaUpdateWrapper<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>10 轮的测试结果：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:38
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:30
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:196
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:29
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:24
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:183
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:27
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:22
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:187
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:27
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:21
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:180
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:25
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:20
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:187
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:24
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:20
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:183
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:27
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:20
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:180
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:23
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:21
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:176
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:24
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:19
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:179
---------------
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testFlexUpdate:21
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testEasyUpdate:23
&gt;&gt;&gt;&gt;&gt;&gt;&gt;testPlusUpdate:177
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">测试结论</p><blockquote><p>数据更新速度Easy-Query快于Mybatis-Flex 远快于 Mybatis-Plus，大概是 Mybatis-Plus 的 5~10+ 倍。</p></blockquote></div><h2 id="更多的测试" tabindex="-1"><a class="header-anchor" href="#更多的测试" aria-hidden="true">#</a> 更多的测试</h2>`,54),y={href:"https://github.com/xuejmnet/easy-query-benchmark",target:"_blank",rel:"noopener noreferrer"};function f(h,P){const a=i("ExternalLinkIcon");return p(),c("div",null,[u,g,d,r,k,v,n("p",null,[s("测试源码： "),n("a",m,[s("https://github.com/xuejmnet/easy-query-benchmark"),t(a)])]),b,n("p",null,[s("想进一步进行更多测试的同学，可以到 "),n("a",y,[s("https://github.com/xuejmnet/easy-query-benchmark"),t(a)]),s(" 下载源码后，添加其他方面的测试。")])])}const x=e(o,[["render",f],["__file","performance.html.vue"]]);export{x as default};
