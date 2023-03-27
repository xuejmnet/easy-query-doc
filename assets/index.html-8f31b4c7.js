import{_ as t,W as i,X as c,Y as s,Z as n,$ as l,a2 as a,C as p}from"./framework-6199cc12.js";const o={},d=a(`<h1 id="安装软件" tabindex="-1"><a class="header-anchor" href="#安装软件" aria-hidden="true">#</a> 安装软件</h1><h2 id="spring-boot工程" tabindex="-1"><a class="header-anchor" href="#spring-boot工程" aria-hidden="true">#</a> spring-boot工程</h2><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>com.easy-query<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>sql-springboot-starter<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>0.0.24<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="获取最新" tabindex="-1"><a class="header-anchor" href="#获取最新" aria-hidden="true">#</a> 获取最新</h2>`,4),r={href:"https://central.sonatype.com/",target:"_blank",rel:"noopener noreferrer"},u=s("code",null,"easy-query",-1),v=a(`<h2 id="spring-boot初始化" tabindex="-1"><a class="header-anchor" href="#spring-boot初始化" aria-hidden="true">#</a> spring-boot初始化</h2><h2 id="非spring-boot初始化" tabindex="-1"><a class="header-anchor" href="#非spring-boot初始化" aria-hidden="true">#</a> 非spring-boot初始化</h2><h2 id="演示数据" tabindex="-1"><a class="header-anchor" href="#演示数据" aria-hidden="true">#</a> 演示数据</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token annotation punctuation">@ToString</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Data</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BaseEntity</span> <span class="token keyword">implements</span> <span class="token class-name">Serializable</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token keyword">long</span> serialVersionUID <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">4834048418175625051L</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 创建时间;创建时间
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 修改时间;修改时间
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> updateTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 创建人;创建人
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> createBy<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 修改人;修改人
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> updateBy<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 是否删除;是否删除
     */</span>
    <span class="token annotation punctuation">@LogicDelete</span><span class="token punctuation">(</span>strategy <span class="token operator">=</span> <span class="token class-name">LogicDeleteStrategyEnum</span><span class="token punctuation">.</span><span class="token constant">BOOLEAN</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> deleted<span class="token punctuation">;</span>
<span class="token punctuation">}</span>


<span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_blog&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BlogEntity</span> <span class="token keyword">extends</span> <span class="token class-name">BaseEntity</span><span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * 标题
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 内容
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> content<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 博客链接
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> url<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 点赞数
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> star<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 发布时间
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> publishTime<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 评分
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">BigDecimal</span> score<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 状态
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> status<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 排序
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">BigDecimal</span> order<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 是否置顶
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> isTop<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 是否置顶
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Boolean</span> top<span class="token punctuation">;</span>
<span class="token punctuation">}</span>



<span class="token annotation punctuation">@Data</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">TopicGroupTestDTO</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> idCount<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4);function m(k,b){const e=p("ExternalLinkIcon");return i(),c("div",null,[d,s("p",null,[s("a",r,[n("https://central.sonatype.com/"),l(e)]),n(" 搜索"),u,n("获取最新安装包")]),v])}const y=t(o,[["render",m],["__file","index.html.vue"]]);export{y as default};
