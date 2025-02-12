import{_ as e,a as p}from"./easy-query-solon-web-query-topic-1cce91a7.js";import{_ as o}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o as l,c as i,d as n,b as t,e as s,f as u}from"./app-257869c3.js";const r={},d=n("h2",{id:"国产框架solon配置",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#国产框架solon配置","aria-hidden":"true"},"#"),s(" 国产框架Solon配置")],-1),k=n("p",null,[n("code",null,"easy-query"),s("在"),n("code",null,"^1.2.6"),s("正式支持"),n("code",null,"Solon"),s("适配国产框架的orm部分。")],-1),m=n("h2",{id:"什么是solon",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#什么是solon","aria-hidden":"true"},"#"),s(" 什么是Solon")],-1),v={href:"https://solon.noear.org/",target:"_blank",rel:"noopener noreferrer"},b=n("code",null,"Solon",-1),g=n("strong",null,"Java 新的生态型应用开发框架：更快、更小、更简单。",-1),y=n("p",null,"启动快 5 ～ 10 倍；qps 高 2～ 3 倍；运行时内存节省 1/3 ~ 1/2；打包可以缩到 1/2 ~ 1/10；同时支持 jdk8, jdk11, jdk17, jdk20, graalvm native image。",-1),h=n("h2",{id:"获取最新",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#获取最新","aria-hidden":"true"},"#"),s(" 获取最新")],-1),f={href:"https://central.sonatype.com/",target:"_blank",rel:"noopener noreferrer"},w=n("code",null,"com.easy-query",-1),q=u('<h2 id="快速开始" tabindex="-1"><a class="header-anchor" href="#快速开始" aria-hidden="true">#</a> 快速开始</h2><h2 id="新建java-maven项目" tabindex="-1"><a class="header-anchor" href="#新建java-maven项目" aria-hidden="true">#</a> 新建java maven项目</h2><img src="'+e+`"><h3 id="添加项目依赖" tabindex="-1"><a class="header-anchor" href="#添加项目依赖" aria-hidden="true">#</a> 添加项目依赖</h3><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>com.easy-query<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>sql-solon-plugin<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>latest-version<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>com.zaxxer<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>HikariCP<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>3.3.1<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>mysql<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>mysql-connector-java<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>8.0.31<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.projectlombok<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>lombok<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>1.18.18<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.noear<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>solon-web<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>2.9.3<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="新建datasource注入" tabindex="-1"><a class="header-anchor" href="#新建datasource注入" aria-hidden="true">#</a> 新建DataSource注入</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WebConfiguration</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Bean</span><span class="token punctuation">(</span>name <span class="token operator">=</span> <span class="token string">&quot;db1&quot;</span><span class="token punctuation">,</span>typed<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">DataSource</span> <span class="token function">db1DataSource</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Inject</span><span class="token punctuation">(</span><span class="token string">&quot;\${db1}&quot;</span><span class="token punctuation">)</span> <span class="token class-name">HikariDataSource</span> dataSource<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> dataSource<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="新增控制器" tabindex="-1"><a class="header-anchor" href="#新增控制器" aria-hidden="true">#</a> 新增控制器</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token annotation punctuation">@Controller</span>
<span class="token annotation punctuation">@Mapping</span><span class="token punctuation">(</span><span class="token string">&quot;/test&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">TestController</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Mapping</span><span class="token punctuation">(</span>value <span class="token operator">=</span> <span class="token string">&quot;/hello&quot;</span><span class="token punctuation">,</span>method <span class="token operator">=</span> <span class="token class-name">MethodType</span><span class="token punctuation">.</span><span class="token constant">GET</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;Hello World&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="solon启动" tabindex="-1"><a class="header-anchor" href="#solon启动" aria-hidden="true">#</a> Solon启动</h3><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># 添加配置文件</span>
<span class="token key atrule">db1</span><span class="token punctuation">:</span>
  <span class="token key atrule">jdbcUrl</span><span class="token punctuation">:</span> jdbc<span class="token punctuation">:</span>mysql<span class="token punctuation">:</span>//127.0.0.1<span class="token punctuation">:</span>3306/easy<span class="token punctuation">-</span>query<span class="token punctuation">-</span>test<span class="token punctuation">?</span>serverTimezone=GMT%2B8<span class="token important">&amp;characterEncoding=utf-8&amp;useSSL=false&amp;allowMultiQueries=true&amp;rewriteBatchedStatements=true</span>
  <span class="token key atrule">username</span><span class="token punctuation">:</span> root
  <span class="token key atrule">password</span><span class="token punctuation">:</span> root
  <span class="token key atrule">driver-class-name</span><span class="token punctuation">:</span> com.mysql.cj.jdbc.Driver

<span class="token comment"># 记录器级别的配置示例</span>
<span class="token key atrule">solon.logging.logger</span><span class="token punctuation">:</span>
  <span class="token key atrule">&quot;root&quot;</span><span class="token punctuation">:</span> <span class="token comment">#默认记录器配置</span>
    <span class="token key atrule">level</span><span class="token punctuation">:</span> TRACE
  <span class="token key atrule">&quot;com.zaxxer.hikari&quot;</span><span class="token punctuation">:</span>
    <span class="token key atrule">level</span><span class="token punctuation">:</span> WARN
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Main</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Solon</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token class-name">Main</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span>args<span class="token punctuation">,</span><span class="token punctuation">(</span>app<span class="token punctuation">)</span><span class="token operator">-&gt;</span><span class="token punctuation">{</span>
            app<span class="token punctuation">.</span><span class="token function">cfg</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">loadAdd</span><span class="token punctuation">(</span><span class="token string">&quot;application.yml&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">//输入url http://localhost:8080/test/hello</span>

<span class="token comment">//返回Hello World</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="easy-query查询" tabindex="-1"><a class="header-anchor" href="#easy-query查询" aria-hidden="true">#</a> easy-query查询</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Data</span>
<span class="token annotation punctuation">@Table</span><span class="token punctuation">(</span><span class="token string">&quot;t_topic&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Topic</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Column</span><span class="token punctuation">(</span>primaryKey <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">Integer</span> stars<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> title<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">LocalDateTime</span> createTime<span class="token punctuation">;</span>
<span class="token punctuation">}</span>


<span class="token annotation punctuation">@Controller</span>
<span class="token annotation punctuation">@Mapping</span><span class="token punctuation">(</span><span class="token string">&quot;/test&quot;</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">TestController</span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * 注意必须是配置多数据源的其中一个
     */</span>
    <span class="token annotation punctuation">@Db</span><span class="token punctuation">(</span><span class="token string">&quot;db1&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">EasyQuery</span> easyQuery<span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Mapping</span><span class="token punctuation">(</span>value <span class="token operator">=</span> <span class="token string">&quot;/hello&quot;</span><span class="token punctuation">,</span>method <span class="token operator">=</span> <span class="token class-name">MethodType</span><span class="token punctuation">.</span><span class="token constant">GET</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">hello</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;Hello World&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Mapping</span><span class="token punctuation">(</span>value <span class="token operator">=</span> <span class="token string">&quot;/queryTopic&quot;</span><span class="token punctuation">,</span>method <span class="token operator">=</span> <span class="token class-name">MethodType</span><span class="token punctuation">.</span><span class="token constant">GET</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">Object</span> <span class="token function">queryTopic</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> easyQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">ge</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token operator">::</span><span class="token function">getStars</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> \`id\`<span class="token punctuation">,</span>\`stars\`<span class="token punctuation">,</span>\`title\`<span class="token punctuation">,</span>\`create_time\` <span class="token constant">FROM</span> \`t_topic\` <span class="token constant">WHERE</span> \`stars\` <span class="token operator">&gt;=</span> <span class="token operator">?</span>
<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token function">2</span><span class="token punctuation">(</span><span class="token class-name">Integer</span><span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">17</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>
<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">101</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><img src="`+p+`"><h3 id="solon配置easy-query个性化" tabindex="-1"><a class="header-anchor" href="#solon配置easy-query个性化" aria-hidden="true">#</a> Solon配置easy-query个性化</h3><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token comment"># 添加配置文件</span>
<span class="token key atrule">db1</span><span class="token punctuation">:</span>
  <span class="token key atrule">jdbcUrl</span><span class="token punctuation">:</span> jdbc<span class="token punctuation">:</span>mysql<span class="token punctuation">:</span>//127.0.0.1<span class="token punctuation">:</span>3306/easy<span class="token punctuation">-</span>query<span class="token punctuation">-</span>test<span class="token punctuation">?</span>serverTimezone=GMT%2B8<span class="token important">&amp;characterEncoding=utf-8&amp;useSSL=false&amp;allowMultiQueries=true&amp;rewriteBatchedStatements=true</span>
  <span class="token key atrule">username</span><span class="token punctuation">:</span> root
  <span class="token key atrule">password</span><span class="token punctuation">:</span> root
  <span class="token key atrule">driver-class-name</span><span class="token punctuation">:</span> com.mysql.cj.jdbc.Driver

<span class="token key atrule">easy-query</span><span class="token punctuation">:</span> 
  <span class="token comment"># 配置自定义日志</span>
  <span class="token comment"># log-class: ...</span>
  <span class="token key atrule">db1</span><span class="token punctuation">:</span>
    <span class="token comment"># 支持mysql pgsql h2 mssql dameng mssql_row_number kingbase_es等其余数据库在适配中</span>
    <span class="token key atrule">database</span><span class="token punctuation">:</span> mysql
    <span class="token comment"># 支持underlined default lower_camel_case upper_camel_case upper_underlined</span>
    <span class="token key atrule">name-conversion</span><span class="token punctuation">:</span> underlined
    <span class="token comment"># 物理删除时抛出异常 不包括手写sql的情况</span>
    <span class="token key atrule">delete-throw</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
    <span class="token comment">#entity映射到dto/vo使用属性匹配模式</span>
    <span class="token comment">#支持 property_only column_only column_and_property property_first</span>
    <span class="token key atrule">mapping-strategy</span><span class="token punctuation">:</span> property_first
    <span class="token comment"># 插入列策略 all_columns only_not_null_columns only_null_columns</span>
    <span class="token key atrule">insert-strategy</span><span class="token punctuation">:</span> only_not_null_columns 
    <span class="token comment"># 更新列策略 all_columns only_not_null_columns only_null_columns</span>
    <span class="token key atrule">update-strategy</span><span class="token punctuation">:</span> all_columns 
    <span class="token comment"># 大字段依旧查询 如果不查询建议设置为updateIgnore防止update allcolumn将其改为null</span>
    <span class="token key atrule">query-large-column</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
    <span class="token comment"># 更新删除无版本号报错</span>
    <span class="token key atrule">no-version-error</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
    <span class="token comment"># 分片链接模式 system_auto memory_strictly connection_strictly</span>
    <span class="token comment"># connection-mode: ...</span>
    <span class="token comment"># max-sharding-query-limit: ...</span>
    <span class="token comment"># executor-maximum-pool-size: ...</span>
    <span class="token comment"># executor-core-pool-size: ...</span>
    <span class="token comment"># throw-if-route-not-match: ...</span>
    <span class="token comment"># sharding-execute-timeout-millis: ...</span>
    <span class="token comment"># max-sharding-route-count: ...</span>
    <span class="token comment"># executor-queue-size: ...</span>
    <span class="token comment"># default-data-source-name: ...</span>
    <span class="token comment"># default-data-source-merge-pool-size: ...</span>
    <span class="token comment"># multi-conn-wait-timeout-millis: ...</span>
    <span class="token comment"># warning-busy: ...</span>
    <span class="token comment"># insert-batch-threshold: ...</span>
    <span class="token comment"># update-batch-threshold: ...</span>
    <span class="token comment"># print-sql: ...</span>
    <span class="token comment"># start-time-job: ...</span>
    <span class="token comment"># default-track: ...</span>
    <span class="token comment"># relation-group-size: ...</span>
    <span class="token comment"># keep-native-style: ...</span>
    <span class="token comment"># warning-column-miss: ...</span>
    <span class="token comment"># sharding-fetch-size: ...</span>
    <span class="token comment"># 事务中分片读取模式 serializable concurrency</span>
    <span class="token comment"># sharding-query-in-transaction: ....</span>

<span class="token comment"># 记录器级别的配置示例 配置了print-sql没有配置对应的log也不会打印</span>
<span class="token key atrule">solon.logging.logger</span><span class="token punctuation">:</span>
  <span class="token key atrule">&quot;root&quot;</span><span class="token punctuation">:</span> <span class="token comment">#默认记录器配置</span>
    <span class="token key atrule">level</span><span class="token punctuation">:</span> TRACE
  <span class="token key atrule">&quot;com.zaxxer.hikari&quot;</span><span class="token punctuation">:</span>
    <span class="token key atrule">level</span><span class="token punctuation">:</span> WARN
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="额外配置" tabindex="-1"><a class="header-anchor" href="#额外配置" aria-hidden="true">#</a> 额外配置</h3><h4 id="逻辑删除" tabindex="-1"><a class="header-anchor" href="#逻辑删除" aria-hidden="true">#</a> 逻辑删除</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyLogicDelStrategy</span> <span class="token keyword">extends</span> <span class="token class-name">AbstractLogicDeleteStrategy</span> <span class="token punctuation">{</span>
    <span class="token doc-comment comment">/**
     * 允许datetime类型的属性
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> allowTypes<span class="token operator">=</span><span class="token keyword">new</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token class-name">Arrays</span><span class="token punctuation">.</span><span class="token function">asList</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">protected</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WherePredicate</span><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">getPredicateFilterExpression</span><span class="token punctuation">(</span><span class="token class-name">LogicDeleteBuilder</span> builder<span class="token punctuation">,</span> <span class="token class-name">String</span> propertyName<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">isNull</span><span class="token punctuation">(</span>propertyName<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">protected</span> <span class="token class-name">SQLExpression1</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ColumnSetter</span><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">getDeletedSQLExpression</span><span class="token punctuation">(</span><span class="token class-name">LogicDeleteBuilder</span> builder<span class="token punctuation">,</span> <span class="token class-name">String</span> propertyName<span class="token punctuation">)</span> <span class="token punctuation">{</span>
<span class="token comment">//        LocalDateTime now = LocalDateTime.now();</span>
<span class="token comment">//        return o-&gt;o.set(propertyName,now);</span>
        <span class="token comment">//上面的是错误用法,将now值获取后那么这个now就是个固定值而不是动态值</span>
        <span class="token keyword">return</span> o<span class="token operator">-&gt;</span>o<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>propertyName<span class="token punctuation">,</span> <span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;MyLogicDelStrategy&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> <span class="token function">allowedPropertyTypes</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> allowTypes<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>


<span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DemoConfiguration</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Bean</span><span class="token punctuation">(</span>name <span class="token operator">=</span> <span class="token string">&quot;db1&quot;</span><span class="token punctuation">,</span>typed<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">DataSource</span> <span class="token function">db1DataSource</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Inject</span><span class="token punctuation">(</span><span class="token string">&quot;\${db1}&quot;</span><span class="token punctuation">)</span> <span class="token class-name">HikariDataSource</span> dataSource<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> dataSource<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token annotation punctuation">@Bean</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">db1QueryConfiguration</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Db</span><span class="token punctuation">(</span><span class="token string">&quot;db1&quot;</span><span class="token punctuation">)</span> <span class="token class-name">QueryConfiguration</span> configuration<span class="token punctuation">)</span><span class="token punctuation">{</span>
        configuration<span class="token punctuation">.</span><span class="token function">applyLogicDeleteStrategy</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyLogicDelStrategy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//        configuration.applyEncryptionStrategy(...);</span>
<span class="token comment">//        configuration.applyInterceptor(...);</span>
<span class="token comment">//        configuration.applyShardingInitializer(...);</span>
<span class="token comment">//        configuration.applyValueConverter(...);</span>
<span class="token comment">//        configuration.applyValueUpdateAtomicTrack(...);</span>
    <span class="token punctuation">}</span>
    
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="solon所有配置" tabindex="-1"><a class="header-anchor" href="#solon所有配置" aria-hidden="true">#</a> Solon所有配置</h3><p>针对单个数据源进行配置,如果需要影响到所有数据源看下面的影响到所有数据源</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Configuration</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DemoConfiguration</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Bean</span><span class="token punctuation">(</span>name <span class="token operator">=</span> <span class="token string">&quot;db1&quot;</span><span class="token punctuation">,</span>typed<span class="token operator">=</span><span class="token boolean">true</span><span class="token punctuation">)</span>
    <span class="token keyword">public</span> <span class="token class-name">DataSource</span> <span class="token function">db1DataSource</span><span class="token punctuation">(</span><span class="token annotation punctuation">@Inject</span><span class="token punctuation">(</span><span class="token string">&quot;\${db1}&quot;</span><span class="token punctuation">)</span> <span class="token class-name">HikariDataSource</span> dataSource<span class="token punctuation">)</span><span class="token punctuation">{</span>
        <span class="token keyword">return</span> dataSource<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token comment">//    /**</span>
<span class="token comment">//     * 配置额外插件,比如自定义逻辑删除,加密策略,拦截器,分片初始化器,值转换,原子追踪更新</span>
<span class="token comment">//     * @param configuration</span>
<span class="token comment">//     */</span>
<span class="token comment">//    @Bean</span>
<span class="token comment">//    public void db1QueryConfiguration(@Db(&quot;db1&quot;) QueryConfiguration configuration){</span>
<span class="token comment">//        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());</span>
<span class="token comment">//        configuration.applyEncryptionStrategy(...);</span>
<span class="token comment">//        configuration.applyInterceptor(...);</span>
<span class="token comment">//        configuration.applyShardingInitializer(...);</span>
<span class="token comment">//        configuration.applyValueConverter(...);</span>
<span class="token comment">//        configuration.applyValueUpdateAtomicTrack(...);</span>
<span class="token comment">//    }</span>

<span class="token comment">//    /**</span>
<span class="token comment">//     * 添加分表或者分库的路由,分库数据源</span>
<span class="token comment">//     * @param runtimeContext</span>
<span class="token comment">//     */</span>
<span class="token comment">//    @Bean</span>
<span class="token comment">//    public void db1QueryRuntimeContext(@Db(&quot;db1&quot;) QueryRuntimeContext runtimeContext){</span>
<span class="token comment">//        TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();</span>
<span class="token comment">//        DataSourceRouteManager dataSourceRouteManager = runtimeContext.getDataSourceRouteManager();</span>
<span class="token comment">//        tableRouteManager.addRoute(...);</span>
<span class="token comment">//        dataSourceRouteManager.addRoute(...);</span>
<span class="token comment">//</span>
<span class="token comment">//        DataSourceManager dataSourceManager = runtimeContext.getDataSourceManager();</span>
<span class="token comment">//</span>
<span class="token comment">//        dataSourceManager.addDataSource(key, dataSource, poolSize);</span>
<span class="token comment">//    }</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="配置影响到所有的数据源" tabindex="-1"><a class="header-anchor" href="#配置影响到所有的数据源" aria-hidden="true">#</a> 配置影响到所有的数据源</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">App</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">Solon</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token class-name">App</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span>args<span class="token punctuation">,</span>app<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
            app<span class="token punctuation">.</span><span class="token function">onEvent</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryBuilderConfiguration</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span>e<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
                <span class="token comment">//如果需要区分数据源可以通过e.getName()来区分</span>
                e<span class="token punctuation">.</span><span class="token function">replaceServiceFactory</span><span class="token punctuation">(</span><span class="token class-name">QueryConfiguration</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> s<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
                    <span class="token class-name">QueryConfiguration</span> queryConfiguration <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">QueryConfiguration</span><span class="token punctuation">(</span>s<span class="token punctuation">.</span><span class="token function">getService</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryOption</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                            <span class="token punctuation">,</span>s<span class="token punctuation">.</span><span class="token function">getService</span><span class="token punctuation">(</span><span class="token class-name">Dialect</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                            <span class="token punctuation">,</span>s<span class="token punctuation">.</span><span class="token function">getService</span><span class="token punctuation">(</span><span class="token class-name">NameConversion</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                            <span class="token punctuation">,</span>s<span class="token punctuation">.</span><span class="token function">getService</span><span class="token punctuation">(</span><span class="token class-name">EasyTimeJobManager</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                    <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//                    queryConfiguration.applyInterceptor();</span>
<span class="token comment">//                    queryConfiguration.applyLogicDeleteStrategy();</span>
<span class="token comment">//                    queryConfiguration.applyValueConverter();</span>
                    <span class="token keyword">return</span> queryConfiguration<span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,25);function S(_,x){const a=c("ExternalLinkIcon");return l(),i("div",null,[d,k,m,n("p",null,[n("a",v,[b,t(a)]),s(),g]),y,h,n("p",null,[n("a",f,[s("https://central.sonatype.com/"),t(a)]),s(" 搜索"),w,s("获取最新安装包")]),q])}const T=o(r,[["render",S],["__file","solon.html.vue"]]);export{T as default};
