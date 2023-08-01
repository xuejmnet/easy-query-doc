import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-61f0a099.js";const p={},e=t(`<h1 id="分页" tabindex="-1"><a class="header-anchor" href="#分页" aria-hidden="true">#</a> 分页</h1><p><code>easy-query</code>提供了非常简易的分页查询功能,方便用户进行数据结果的分页查询</p><h2 id="简单分页" tabindex="-1"><a class="header-anchor" href="#简单分页" aria-hidden="true">#</a> 简单分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>   <span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Topic</span><span class="token punctuation">&gt;</span></span> topicPageResult <span class="token operator">=</span> easyQuery
                <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o <span class="token operator">-&gt;</span> o<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> t_topic t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>\`id\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>\`id\`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>\`stars\`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>\`title\`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>\`create_time\` <span class="token constant">FROM</span> t_topic t <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>\`id\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">LIMIT</span> <span class="token number">20</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">20</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="join分页" tabindex="-1"><a class="header-anchor" href="#join分页" aria-hidden="true">#</a> join分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> page <span class="token operator">=</span> easyQuery
            <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">innerJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token string">&quot;3&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">columnAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">columnIgnore</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> t1<span class="token punctuation">.</span>\`id\` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>\`title\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> <span class="token operator">?</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token class-name">Query</span> <span class="token class-name">Use</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>\`create_time\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`update_time\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`create_by\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`update_by\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`deleted\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`title\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`content\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`url\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`star\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`publish_time\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`score\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`status\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`order\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`is_top\`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>\`top\` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> t1<span class="token punctuation">.</span>\`id\` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>\`title\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">3</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token class-name">Query</span> <span class="token class-name">Use</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="group分页" tabindex="-1"><a class="header-anchor" href="#group分页" aria-hidden="true">#</a> group分页</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogEntity</span><span class="token punctuation">&gt;</span></span> page <span class="token operator">=</span> easyQuery
                <span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">innerJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> <span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">,</span> <span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getTitle</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">groupBy</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span><span class="token operator">-&gt;</span>t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> t1<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t1<span class="token punctuation">.</span><span class="token function">column</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getId</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">columnSum</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token operator">::</span><span class="token function">getScore</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">toPageResult</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token class-name">SELECT</span>  <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>  <span class="token constant">FROM</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>\`id\`<span class="token punctuation">,</span><span class="token function">SUM</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span>\`score\`<span class="token punctuation">)</span> <span class="token constant">AS</span> \`score\` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> t1<span class="token punctuation">.</span>\`id\` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>\`title\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">GROUP</span> <span class="token constant">BY</span> t1<span class="token punctuation">.</span>\`id\`<span class="token punctuation">)</span> t2
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token class-name">Query</span> <span class="token class-name">Use</span><span class="token operator">:</span> <span class="token function">8</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t1<span class="token punctuation">.</span>\`id\`<span class="token punctuation">,</span><span class="token function">SUM</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span>\`score\`<span class="token punctuation">)</span> <span class="token constant">AS</span> \`score\` <span class="token constant">FROM</span> t_topic t <span class="token constant">INNER</span> <span class="token constant">JOIN</span> t_blog t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>\`id\` <span class="token operator">=</span> t1<span class="token punctuation">.</span>\`id\` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>\`title\` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">GROUP</span> <span class="token constant">BY</span> t1<span class="token punctuation">.</span>\`id\` <span class="token constant">LIMIT</span> <span class="token number">20</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span> <span class="token class-name">Query</span> <span class="token class-name">Use</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="自定义分页返回结果" tabindex="-1"><a class="header-anchor" href="#自定义分页返回结果" aria-hidden="true">#</a> 自定义分页返回结果</h2><p><code>easy-query</code>提供了自定义分页返回结果,用户可以自行定义分页结果,<a href="/easy-query-doc/guide/config/replace-configure">《替换框架行为❗️❗️❗️》</a></p><h3 id="替换接口" tabindex="-1"><a class="header-anchor" href="#替换接口" aria-hidden="true">#</a> 替换接口</h3><p><code>EasyPageResultProvider</code></p><table><thead><tr><th>方法</th><th>参数</th><th>描述</th></tr></thead><tbody><tr><td>createPageResult</td><td>long pageIndex, long pageSize,long total, List&lt;T&gt; data</td><td>返回<code>toPageResult</code>的分页对象</td></tr><tr><td>createShardingPageResult</td><td>long pageIndex, long pageSize,long total, List&lt;T&gt; data,SequenceCountLine sequenceCountLine</td><td>返回<code>toShardingPageResult</code>的分页对象</td></tr></tbody></table><h3 id="默认实现" tabindex="-1"><a class="header-anchor" href="#默认实现" aria-hidden="true">#</a> 默认实现</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultEasyPageResultProvider</span> <span class="token keyword">implements</span> <span class="token class-name">EasyPageResultProvider</span><span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">createPageResult</span><span class="token punctuation">(</span><span class="token keyword">long</span> pageIndex<span class="token punctuation">,</span> <span class="token keyword">long</span> pageSize<span class="token punctuation">,</span><span class="token keyword">long</span> total<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">DefaultPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>total<span class="token punctuation">,</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">createShardingPageResult</span><span class="token punctuation">(</span><span class="token keyword">long</span> pageIndex<span class="token punctuation">,</span> <span class="token keyword">long</span> pageSize<span class="token punctuation">,</span><span class="token keyword">long</span> total<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">,</span><span class="token class-name">SequenceCountLine</span> sequenceCountLine<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">DefaultShardingPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>total<span class="token punctuation">,</span>data<span class="token punctuation">,</span>sequenceCountLine<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">implements</span> <span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> total<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">DefaultPageResult</span><span class="token punctuation">(</span><span class="token keyword">long</span> total<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>total <span class="token operator">=</span> total<span class="token punctuation">;</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>data <span class="token operator">=</span> data<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">getTotal</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> total<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> data<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">EasyShardingPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">extends</span> <span class="token class-name">EasyPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">{</span>
    <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Long</span><span class="token punctuation">&gt;</span></span> <span class="token function">getTotalLines</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>


<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultShardingPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token keyword">implements</span> <span class="token class-name">EasyShardingPageResult</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">long</span> total<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">SequenceCountLine</span> sequenceCountLine<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">DefaultShardingPageResult</span><span class="token punctuation">(</span><span class="token keyword">long</span> total<span class="token punctuation">,</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> data<span class="token punctuation">,</span><span class="token class-name">SequenceCountLine</span> sequenceCountLine<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>total <span class="token operator">=</span> total<span class="token punctuation">;</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>data <span class="token operator">=</span> data<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>sequenceCountLine <span class="token operator">=</span> sequenceCountLine<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token keyword">long</span> <span class="token function">getTotal</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> total<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">getData</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> data<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Long</span><span class="token punctuation">&gt;</span></span> <span class="token function">getTotalLines</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> sequenceCountLine<span class="token punctuation">.</span><span class="token function">getTotalLines</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,15),o=[e];function c(l,u){return s(),a("div",null,o)}const r=n(p,[["render",c],["__file","paging.html.vue"]]);export{r as default};