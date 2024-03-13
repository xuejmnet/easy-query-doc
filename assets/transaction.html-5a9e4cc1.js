import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-4c828771.js";const e={},p=t(`<h2 id="手动事务" tabindex="-1"><a class="header-anchor" href="#手动事务" aria-hidden="true">#</a> 手动事务</h2><p><code>easy-query</code>默认提供手动开启事务的功能,并且在springboot下可以跨非代理方法生效,唯一限制就是当前线程内的</p><h2 id="api" tabindex="-1"><a class="header-anchor" href="#api" aria-hidden="true">#</a> api</h2><table><thead><tr><th>方法</th><th>默认值</th><th>描述</th></tr></thead><tbody><tr><td>beginTransaction</td><td>null</td><td>参数表示数据库隔离级别,默认采用<code>datasource</code>的可以自定义 Connection.TRANSACTION_READ_UNCOMMITTED,Connection.TRANSACTION_READ_COMMITTED,Connection.TRANSACTION_REPEATABLE_READ,* Connection.TRANSACTION_SERIALIZABLE.</td></tr><tr><td>Transaction.commit</td><td></td><td>提交事务</td></tr><tr><td>Transaction.rollback</td><td></td><td>回滚事务</td></tr><tr><td>registerListener(TransactionListener transactionBehavior)</td><td></td><td>设置当前事务的执行行为,包括提交前提交后等处理</td></tr><tr><td>close</td><td></td><td>关闭事务,如果事务未提交则自动调用回滚</td></tr></tbody></table><h2 id="如何开启" tabindex="-1"><a class="header-anchor" href="#如何开启" aria-hidden="true">#</a> 如何开启</h2><p><code>springboot</code>如果当前方法没有添加<code>@Transactional</code>注解,内部调用<code>this.method()</code>的非代理对象方法调用事务,哪怕<code>this.method()</code>有注解<code>@Transactional</code>也会让事务失效,有时候你可能需要这个方法那么可以在<code>springboot</code>中通过beginTransaction来开启事务,默认不支持和springboot的嵌套事务,不可以在<code>@Transactional</code>内开启<code>easy-query</code>的事务</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">try</span><span class="token punctuation">(</span><span class="token class-name">Transaction</span> transaction <span class="token operator">=</span> easyQuery<span class="token punctuation">.</span><span class="token function">beginTransaction</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">{</span>

            <span class="token class-name">TestUserMysql0</span> testUserMysql1 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TestUserMysql0</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            testUserMysql1<span class="token punctuation">.</span><span class="token function">setId</span><span class="token punctuation">(</span><span class="token string">&quot;123321123321xxx&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            testUserMysql1<span class="token punctuation">.</span><span class="token function">setAge</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            testUserMysql1<span class="token punctuation">.</span><span class="token function">setName</span><span class="token punctuation">(</span><span class="token string">&quot;xxx&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            easyQuery<span class="token punctuation">.</span><span class="token function">insertable</span><span class="token punctuation">(</span>testUserMysql1<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">test1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
                <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span><span class="token string">&quot;错误了&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            transaction<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">test1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>

        <span class="token class-name">TestUserMysql0</span> testUserMysql1 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TestUserMysql0</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        testUserMysql1<span class="token punctuation">.</span><span class="token function">setId</span><span class="token punctuation">(</span><span class="token string">&quot;123321123321xxx1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        testUserMysql1<span class="token punctuation">.</span><span class="token function">setAge</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        testUserMysql1<span class="token punctuation">.</span><span class="token function">setName</span><span class="token punctuation">(</span><span class="token string">&quot;xxx&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        easyQuery<span class="token punctuation">.</span><span class="token function">insertable</span><span class="token punctuation">(</span>testUserMysql1<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">executeRows</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7),o=[p];function c(i,u){return s(),a("div",null,o)}const r=n(e,[["render",c],["__file","transaction.html.vue"]]);export{r as default};