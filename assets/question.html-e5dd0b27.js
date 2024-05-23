import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as a,c as s,e as t}from"./app-31993fe5.js";const p={},e=t(`<h1 id="常见问题" tabindex="-1"><a class="header-anchor" href="#常见问题" aria-hidden="true">#</a> 常见问题</h1><p>这里主要汇总了一些常见的问题</p><h2 id="springboot-启动报错" tabindex="-1"><a class="header-anchor" href="#springboot-启动报错" aria-hidden="true">#</a> SpringBoot 启动报错</h2><div class="language-log line-numbers-mode" data-ext="log"><pre class="language-log"><code><span class="token exception javastacktrace language-javastacktrace">java<span class="token punctuation">.</span>lang<span class="token punctuation">.</span>IllegalStateException<span class="token punctuation">:</span> Unable to load cache item
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>internal<span class="token punctuation">.</span>LoadingCache<span class="token punctuation">.</span><span class="token function">createEntry</span><span class="token punctuation">(</span>LoadingCache<span class="token punctuation">.</span>java<span class="token punctuation">:</span>79<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>internal<span class="token punctuation">.</span>LoadingCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>LoadingCache<span class="token punctuation">.</span>java<span class="token punctuation">:</span>34<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>AbstractClassGenerator$ClassLoaderData<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>AbstractClassGenerator<span class="token punctuation">.</span>java<span class="token punctuation">:</span>134<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>core<span class="token punctuation">.</span>AbstractClassGenerator<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>AbstractClassGenerator<span class="token punctuation">.</span>java<span class="token punctuation">:</span>319<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>proxy<span class="token punctuation">.</span>Enhancer<span class="token punctuation">.</span><span class="token function">createHelper</span><span class="token punctuation">(</span>Enhancer<span class="token punctuation">.</span>java<span class="token punctuation">:</span>572<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]
	<span class="token keyword">at</span> org<span class="token punctuation">.</span>springframework<span class="token punctuation">.</span>cglib<span class="token punctuation">.</span>proxy<span class="token punctuation">.</span>Enhancer<span class="token punctuation">.</span><span class="token function">createClass</span><span class="token punctuation">(</span>Enhancer<span class="token punctuation">.</span>java<span class="token punctuation">:</span>419<span class="token punctuation">)</span> ~[spring-core-5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29<span class="token punctuation">.</span>jar<span class="token punctuation">:</span>5<span class="token punctuation">.</span>3<span class="token punctuation">.</span>29]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>主要原因是</p><ul><li>缺少aop依赖</li><li>aop组件版本不对</li></ul><p>解决办法添加对应的依赖</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code>		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.springframework.boot<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
			<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>spring-boot-starter-aop<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
		<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果不想使用aop可以禁用默认加载aop追踪 在<code>application.yml</code>同级目录下添加<code>easy-query-track:enable:false</code></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">easy-query</span><span class="token punctuation">:</span>
  <span class="token key atrule">enable</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
  <span class="token key atrule">database</span><span class="token punctuation">:</span> mysql
  <span class="token key atrule">name-conversion</span><span class="token punctuation">:</span> underlined
  <span class="token key atrule">start-time-job</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>

<span class="token key atrule">easy-query-track</span><span class="token punctuation">:</span>
  <span class="token comment"># 默认是true</span>
  <span class="token key atrule">enable</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="没有生成proxy" tabindex="-1"><a class="header-anchor" href="#没有生成proxy" aria-hidden="true">#</a> 没有生成Proxy</h2><p>如果没有生成<code>Proxy</code>请先确定是否引入<code>sql-api-proxy</code>包,如果使用<code>@EntityProxy</code>请确定是否引入<code>sql-processor</code>各个生成的模块都需要,如果是<code>@EntityFileProxy</code>请确认是否引用插件。<br> 插件可以有效的提升用户体验</p><h2 id="如果插件报错" tabindex="-1"><a class="header-anchor" href="#如果插件报错" aria-hidden="true">#</a> 如果插件报错</h2><p>如果idea报错<code>Slow operations are prohibited on EDT. See SlowOperations.assertSlowOperationsAreAllowed javadoc</code></p><p>那么就双击<code>shift</code>输入<code>Registry...</code>然后在弹出的地方搜索<code>slow</code> 将<code>ide.slow.operations.assertion</code>的<code>value</code>勾去掉</p><h2 id="阿里镜像找不到依赖" tabindex="-1"><a class="header-anchor" href="#阿里镜像找不到依赖" aria-hidden="true">#</a> 阿里镜像找不到依赖？</h2><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Could not find artifact xxxxx:pom:xxxx
in alimaven (http://maven.aliyun.com/nexus/content/groups/public/)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这个是因为目前阿里云镜像正在维护，可以替换为腾讯云或者华为云的镜像源，更改 Maven 安装目录下的 settings.xml 文件， 添加如下配置：</p><p>腾讯云：</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirror</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>id</span><span class="token punctuation">&gt;</span></span>tencent-cloud<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>id</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>*<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>name</span><span class="token punctuation">&gt;</span></span>tencent-cloud<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>name</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>url</span><span class="token punctuation">&gt;</span></span>https://mirrors.cloud.tencent.com/nexus/repository/maven-public/<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>url</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirror</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>华为云：</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirror</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>id</span><span class="token punctuation">&gt;</span></span>huawei-cloud<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>id</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>*<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirrorOf</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>name</span><span class="token punctuation">&gt;</span></span>huawei-cloud<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>name</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>url</span><span class="token punctuation">&gt;</span></span>https://mirrors.huaweicloud.com/repository/maven/<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>url</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>mirror</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22),o=[e];function c(l,u){return a(),s("div",null,o)}const k=n(p,[["render",c],["__file","question.html.vue"]]);export{k as default};