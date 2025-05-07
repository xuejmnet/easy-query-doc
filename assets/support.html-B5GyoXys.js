import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as r,d as o,b as t,a as i,o as s}from"./app-BLS-0rW_.js";const p={},m=["src"],c=["src"];function d(e,n){return s(),r("div",null,[n[0]||(n[0]=o('<h1 id="支持" tabindex="-1"><a class="header-anchor" href="#支持"><span>支持</span></a></h1><p>您的支持是我坚持的动力,在这里希望您可以免费给我点个<code>star</code></p><p><a href="https://github.com/xuejmnet/easy-query" target="_blank" rel="noopener noreferrer">GITHUB</a></p><p><a href="https://gitee.com/xuejm/easy-query" target="_blank" rel="noopener noreferrer">GITEE</a></p><h2 id="爱心" tabindex="-1"><a class="header-anchor" href="#爱心"><span>爱心</span></a></h2><p>如果您觉得这个框架有用可以请作者喝杯咖啡</p>',6)),t("img",{src:e.$withBase("/images/wx.jpg"),class:"no-zoom",style:{width:"200px"}},null,8,m),t("img",{src:e.$withBase("/images/zfb.jpg"),class:"no-zoom",style:{width:"200px"}},null,8,c),i(` 
::: code-tabs
@tab 对象模式

@tab lambda模式
@tab proxy模式
@tab 属性模式


::: 

::: tip 说明!!!
> 代理模式下\`where\`的第一个参数是\`filter\`过滤器,第二个参数开始才是真正的表
:::






::: tabs

@tab entity


编写中...
@tab lambda
编写中...
@tab client
编写中...

:::




接口  | 功能  
---  | --- 
ValueConverter  | 将数据库和对象值进行互相转换的接口
\\<TProperty>  | 对象属性类型
\\<TProvider>  | 数据库对应的java类型




\`\`\`mermaid
erDiagram
    SysBankCard {
        String id PK
        String uid FK
        String code
        String type
        String bankId FK
        LocalDateTime openTime
    }
    
    SysUser {
        String id PK
        String name
        String phone
        Integer age
        LocalDateTime createTime
    }
    
    SysBank {
        String id PK
        String name
        LocalDateTime createTime
    }

    SysBankCard }o--|| SysUser : "Many-to-One (uid → id)"
    SysBankCard }o--|| SysBank : "Many-to-One (bankId → id)"
\`\`\`



`)])}const h=a(p,[["render",d]]),u=JSON.parse('{"path":"/support.html","title":"服务支持","lang":"zh-CN","frontmatter":{"title":"服务支持","icon":"creative","description":"支持 您的支持是我坚持的动力,在这里希望您可以免费给我点个star GITHUB GITEE 爱心 如果您觉得这个框架有用可以请作者喝杯咖啡","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"服务支持\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2025-05-05T02:24:50.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xuejmnet\\",\\"url\\":\\"https://github.com/xuejmnet\\"}]}"],["meta",{"property":"og:url","content":"https://github.com/dromara/easy-query/easy-query-doc/support.html"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"服务支持"}],["meta",{"property":"og:description","content":"支持 您的支持是我坚持的动力,在这里希望您可以免费给我点个star GITHUB GITEE 爱心 如果您觉得这个框架有用可以请作者喝杯咖啡"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-05-05T02:24:50.000Z"}],["meta",{"property":"article:modified_time","content":"2025-05-05T02:24:50.000Z"}]]},"git":{"createdTime":1684487626000,"updatedTime":1746411890000,"contributors":[{"name":"xuejiaming","username":"xuejiaming","email":"326308290@qq.com","commits":7,"url":"https://github.com/xuejiaming"}]},"readingTime":{"minutes":0.83,"words":250},"filePathRelative":"support.md","autoDesc":true}');export{h as comp,u as data};
