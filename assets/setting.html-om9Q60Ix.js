import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as e,b as a,o as i}from"./app-CIMOXoDM.js";const l={};function p(t,n){return i(),e("div",null,n[0]||(n[0]=[a(`<h1 id="配置文件" tabindex="-1"><a class="header-anchor" href="#配置文件"><span>配置文件</span></a></h1><p>默认插件会读取当前项目下的根目录文件<code>easy-query.setting</code>,通过插件配置和文件保存可以将配置项保存到文件内，这样在多个用户之间既可以使用当前项目的配置</p><p>配置内容如下</p><div class="language-text line-numbers-mode" data-highlighter="shiki" data-ext="text" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span># EasyQuery 默认项目配置文件</span></span>
<span class="line"><span># 在此处添加您的自定义配置</span></span>
<span class="line"><span># 可配置的内容请参见 https://github.com/xuejmnet/easy-query-plugin</span></span>
<span class="line"><span># 配置语法参见 https://doc.hutool.cn/pages/setting/example</span></span>
<span class="line"><span></span></span>
<span class="line"><span># DTO是否保留Column注解 true/false</span></span>
<span class="line"><span>## DTO是否保留 @Column 注解, 当字段映射为 属性优先/属性唯一 的时候可以不用保留 @Column 注解</span></span>
<span class="line"><span>dto.keepAnnoColumn=true</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 启动项配置</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 启动时是否检查扫描问题</span></span>
<span class="line"><span>startup.runInspection=true</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 具体参考 com.alibaba.druid.util.FnvHash.DbType  如果是generic那么还是原先的格式化 如果不是generic且未匹配到则使用DbType.other</span></span>
<span class="line"><span>sql.format=postgresql,mysql,sqlserver,oracle,h2,sqlite</span></span>
<span class="line"><span></span></span>
<span class="line"><span># lambda快速提示</span></span>
<span class="line"><span>lambda.tip=</span></span>
<span class="line"><span></span></span>
<span class="line"><span># dto配置忽略json</span></span>
<span class="line"><span>dto.columns.ignores=</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span># 数据库生成配置文件</span></span>
<span class="line"><span>sql.generate =</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4)]))}const d=s(l,[["render",p]]),o=JSON.parse('{"path":"/plugin/setting.html","title":"配置文件","lang":"zh-CN","frontmatter":{"title":"配置文件","order":5,"category":["plugin"],"description":"配置文件 默认插件会读取当前项目下的根目录文件easy-query.setting,通过插件配置和文件保存可以将配置项保存到文件内，这样在多个用户之间既可以使用当前项目的配置 配置内容如下","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"配置文件\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2025-12-13T05:39:48.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xuejmnet\\",\\"url\\":\\"https://github.com/xuejmnet\\"}]}"],["meta",{"property":"og:url","content":"https://github.com/dromara/easy-query/easy-query-doc/plugin/setting.html"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"配置文件"}],["meta",{"property":"og:description","content":"配置文件 默认插件会读取当前项目下的根目录文件easy-query.setting,通过插件配置和文件保存可以将配置项保存到文件内，这样在多个用户之间既可以使用当前项目的配置 配置内容如下"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:locale:alternate","content":"en-US"}],["meta",{"property":"og:updated_time","content":"2025-12-13T05:39:48.000Z"}],["meta",{"property":"article:modified_time","content":"2025-12-13T05:39:48.000Z"}],["link",{"rel":"alternate","hreflang":"en-us","href":"https://github.com/dromara/easy-query/easy-query-doc/en/plugin/setting.html"}]]},"git":{"createdTime":1761456061000,"updatedTime":1765604388000,"contributors":[{"name":"xuejiaming","username":"xuejiaming","email":"326308290@qq.com","commits":2,"url":"https://github.com/xuejiaming"}]},"readingTime":{"minutes":0.84,"words":253},"filePathRelative":"plugin/setting.md","autoDesc":true}');export{d as comp,o as data};
