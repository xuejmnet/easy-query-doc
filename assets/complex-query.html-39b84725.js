import{_ as u}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o as r,c as d,d as n,e as s,b as o,w as a,a as k,f as l}from"./app-257869c3.js";const m={},v=n("h2",{id:"前言",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#前言","aria-hidden":"true"},"#"),s(" 前言")],-1),b=n("code",null,"eq",-1),y=l("<p>在讲解复杂查询前，我们需要知道快速体验给出的是普通sql模式的查询,但是对象模式查询是使用了对象关系,</p><ul><li><code>sql的显示模式</code>开发者需要显式调用<code>手动join</code>和<code>手动in(subQuery)</code></li><li><code>对象关系的隐式</code>开发者只需要关注对象模型关系,框架给出<code>自动的join</code>和<code>自动的in(subQuery)</code></li></ul><p>任意两张表如果可以join那么他们之前一定存在关系,只是这个关系是否是临时的是否是动态的,当两张表甚至多张表有对应的关系,那么可以针对这几张表进行对象模型的关系描述使用<code>@Navigate</code>注解声明<br> 来描述两张表之前是<code>一对一</code>、<code>一对多</code>、<code>多对一</code>、<code>多对多、 一款优秀的ORM框架需要具备</code>sql的显示模式<code>风格和</code>对象关系的隐式<code>风格，即支持使用面向对象的方法来处理简单查询，也可以使用 DSL 来构建复杂查询。 </code>eq<code>则是具备这两种风格，</code>eq<code>处理提供了强大的查询能力，允许开发者构建复杂的查询条件外， 也支持使用</code>@Table<code>表示实体类与表的关系，对于表之间的关联关系则是使用</code>@Navigate<code>注解声明， </code>eq<code>提供</code>include<code>或者</code>includes<code>方法来额外自动查询出当前主表所关联的的表数据， 默认情况下，查询主表的数据时，不使用</code>include<code>或者</code>includes`方法是不会自动查询关联表的数据的</p>",3),h=n("h2",{id:"数据准备",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#数据准备","aria-hidden":"true"},"#"),s(" 数据准备")],-1),g=n("p",null,[s("对"),n("code",null,"Company"),s("和"),n("code",null,"SysUser"),s("表进行对象模型的关系编写一对多,"),n("code",null,"Company"),s("表中填写的是和"),n("code",null,"SysUser"),s("的关系,反之用户表填写的是和企业表的关系多对一")],-1),_=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token annotation punctuation"},"@Data"),s(`
`),n("span",{class:"token annotation punctuation"},"@Table"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"t_company"'),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token annotation punctuation"},"@EntityProxy"),s(`
`),n("span",{class:"token annotation punctuation"},"@FieldNameConstants"),s(`
`),n("span",{class:"token keyword"},"public"),s(),n("span",{class:"token keyword"},"class"),s(),n("span",{class:"token class-name"},"Company"),s(),n("span",{class:"token keyword"},"implements"),s(),n("span",{class:"token class-name"},"ProxyEntityAvailable"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"Company"),s(),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token class-name"},"CompanyProxy"),n("span",{class:"token punctuation"},">")]),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token doc-comment comment"},`/**
     * 企业id
     */`),s(`
    `),n("span",{class:"token annotation punctuation"},"@Column"),n("span",{class:"token punctuation"},"("),s("primaryKey "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"String"),s(" id"),n("span",{class:"token punctuation"},";"),s(`
    `),n("span",{class:"token doc-comment comment"},`/**
     * 企业名称
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"String"),s(" name"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token doc-comment comment"},`/**
     * 企业创建时间
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"LocalDateTime"),s(" createTime"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token doc-comment comment"},`/**
     * 注册资金
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"BigDecimal"),s(" registerMoney"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token doc-comment comment"},`/**
     * 企业拥有的用户
     */`),s(`
    `),n("span",{class:"token annotation punctuation"},"@Navigate"),n("span",{class:"token punctuation"},"("),s("value "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},[s("RelationTypeEnum"),n("span",{class:"token punctuation"},"."),s("OneToMany")]),n("span",{class:"token punctuation"},","),s(`
            selfProperty `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token class-name"},[s("Company"),n("span",{class:"token punctuation"},"."),s("Fields")]),n("span",{class:"token punctuation"},"."),s("id"),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
            targetProperty `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token class-name"},[s("SysUser"),n("span",{class:"token punctuation"},"."),s("Fields")]),n("span",{class:"token punctuation"},"."),s("companyId"),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"List"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"SysUser"),n("span",{class:"token punctuation"},">")]),s(" users"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),f=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[s(`
`),n("span",{class:"token annotation punctuation"},"@Data"),s(`
`),n("span",{class:"token annotation punctuation"},"@Table"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"t_user"'),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token annotation punctuation"},"@EntityProxy"),s(`
`),n("span",{class:"token annotation punctuation"},"@FieldNameConstants"),s(`
`),n("span",{class:"token keyword"},"public"),s(),n("span",{class:"token keyword"},"class"),s(),n("span",{class:"token class-name"},"SysUser"),s(),n("span",{class:"token keyword"},"implements"),s(),n("span",{class:"token class-name"},"ProxyEntityAvailable"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"SysUser"),s(),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token class-name"},"SysUserProxy"),n("span",{class:"token punctuation"},">")]),s(),n("span",{class:"token punctuation"},"{"),s(`
    `),n("span",{class:"token doc-comment comment"},`/**
     * 用户id
     */`),s(`
    `),n("span",{class:"token annotation punctuation"},"@Column"),n("span",{class:"token punctuation"},"("),s("primaryKey "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token boolean"},"true"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"String"),s(" id"),n("span",{class:"token punctuation"},";"),s(`
    `),n("span",{class:"token doc-comment comment"},`/**
     * 用户姓名
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"String"),s(" name"),n("span",{class:"token punctuation"},";"),s(`
    `),n("span",{class:"token doc-comment comment"},`/**
     * 用户出生日期
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"LocalDateTime"),s(" birthday"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token doc-comment comment"},`/**
     * 用户所属企业id
     */`),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"String"),s(" companyId"),n("span",{class:"token punctuation"},";"),s(`

    `),n("span",{class:"token doc-comment comment"},`/**
     * 用户所属企业
     */`),s(`
    `),n("span",{class:"token annotation punctuation"},"@Navigate"),n("span",{class:"token punctuation"},"("),s("value "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},[s("RelationTypeEnum"),n("span",{class:"token punctuation"},"."),s("ManyToOne")]),n("span",{class:"token punctuation"},","),s(`
            selfProperty `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token class-name"},[s("SysUser"),n("span",{class:"token punctuation"},"."),s("Fields")]),n("span",{class:"token punctuation"},"."),s("companyId"),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},","),s(`
            targetProperty `),n("span",{class:"token operator"},"="),s(),n("span",{class:"token punctuation"},"{"),n("span",{class:"token class-name"},[s("Company"),n("span",{class:"token punctuation"},"."),s("Fields")]),n("span",{class:"token punctuation"},"."),s("id"),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
    `),n("span",{class:"token keyword"},"private"),s(),n("span",{class:"token class-name"},"Company"),s(" company"),n("span",{class:"token punctuation"},";"),s(`
`),n("span",{class:"token punctuation"},"}"),s(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),w=l(`<h2 id="快速体验预览" tabindex="-1"><a class="header-anchor" href="#快速体验预览" aria-hidden="true">#</a> 快速体验预览</h2><h3 id="筛选用户条件是企业" tabindex="-1"><a class="header-anchor" href="#筛选用户条件是企业" aria-hidden="true">#</a> 筛选用户条件是企业</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SysUser</span><span class="token punctuation">&gt;</span></span> userInHz <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>u <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    <span class="token comment">//隐式子查询会自动join用户表</span>
                      <span class="token comment">//根据条件是否生效自动添加企业表的join</span>
                        u<span class="token punctuation">.</span><span class="token function">company</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;杭州公司&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="筛选企业条件是用户" tabindex="-1"><a class="header-anchor" href="#筛选企业条件是用户" aria-hidden="true">#</a> 筛选企业条件是用户</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>
<span class="token comment">//筛选企业条件是企业内有至少一个用户是小明</span>
<span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Company</span><span class="token punctuation">&gt;</span></span> companyHasXiaoMing <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Company</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>c <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                <span class="token comment">//筛选条件为企业所属用户里面有一个叫做小明的</span>
                c<span class="token punctuation">.</span><span class="token function">users</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span>user <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                    user<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token string">&quot;小明&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5);function x(C,S){const p=c("RouterLink"),i=c("Tabs");return r(),d("div",null,[v,n("p",null,[s("前面在"),o(p,{to:"/startup/quick-start.html"},{default:a(()=>[s("快速体验")]),_:1}),s("章节中，我们知道了"),b,s("的简单查询，下面我们将讲解复杂查询")]),y,k(" 以下情况不需要调用`include`或者`includes`\n\n- 返回`对一导航属性`而不是`对多`包括相关列,其中`对一`包括`多对一`,`一对一`\n- 返回导航属性本身`.select(o->o.parent())`\n- 返回导航属性的列比如`.select(o->o.parent().id())`\n- 返回对多的导航属性比如`.select(o->o.roles().toList())` "),h,g,o(i,{id:"31",data:[{id:"Company"},{id:"SysUser"}]},{title0:a(({value:e,isActive:t})=>[s("Company")]),title1:a(({value:e,isActive:t})=>[s("SysUser")]),tab0:a(({value:e,isActive:t})=>[_]),tab1:a(({value:e,isActive:t})=>[f]),_:1}),w])}const T=u(m,[["render",x],["__file","complex-query.html.vue"]]);export{T as default};
