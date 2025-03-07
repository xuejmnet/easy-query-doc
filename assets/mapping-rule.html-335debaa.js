import{_ as c}from"./plugin-vue_export-helper-c27b6911.js";import{r as l,o as i,c as u,e as r,w as s,f as p,d as a,b as n}from"./app-ed7606e1.js";const d={},k=p('<h1 id="对象映射规则" tabindex="-1"><a class="header-anchor" href="#对象映射规则" aria-hidden="true">#</a> 对象映射规则</h1><p><code>eq 2.4.1+</code>版本提供<code>mapping-strategy</code>提供三个选择,默认(之前版本)是<code>COLUMN_ONLY</code>，新版本提供了额外两种选择<code>PROPERTY_FIRST</code>和<code>PROPERTY_ONLY</code>和<code>COLUMN_AND_PROPERTY</code></p><p>如果你无法理解那么请在<code>新项目</code>的时候选择<code>PROPERTY_FIRST</code>❗️</p><p>如果你无法理解那么请在<code>新项目</code>的时候选择<code>PROPERTY_FIRST</code>❗️</p><p>如果你无法理解那么请在<code>新项目</code>的时候选择<code>PROPERTY_FIRST</code>❗️</p><p><code>convert</code>函数表示映射的列名,值为<code>propertyName</code>+<code>nameConversion</code>如果属性添加<code>@Column(value=&quot;xx&quot;)</code>则结果为<code>xx</code></p><table><thead><tr><th>方法</th><th>描述</th></tr></thead><tbody><tr><td>COLUMN_ONLY</td><td><code>convert(A.property)==convert(AVO.property)</code></td></tr><tr><td>PROPERTY_ONLY</td><td><code>A.property==AVO.property</code></td></tr><tr><td>PROPERTY_FIRST</td><td><code>A.property == AVO.property</code> 如果匹配不到并且AVO是函数则通过 <code>convert(A.property)==convert(AVO.property)</code>再次匹配比</td></tr><tr><td>COLUMN_AND_PROPERTY</td><td><code>findNull(convert(A.property),A.property)==findNull(convert(AVO.property),AVO.property)</code></td></tr></tbody></table><h2 id="实体和结果" tabindex="-1"><a class="header-anchor" href="#实体和结果" aria-hidden="true">#</a> 实体和结果</h2>',8),v=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token keyword"},"public"),a(),n("span",{class:"token keyword"},"class"),a(),n("span",{class:"token class-name"},"A"),n("span",{class:"token punctuation"},"{"),a(`
    `),n("span",{class:"token annotation punctuation"},"@Column"),n("span",{class:"token punctuation"},"("),a("value"),n("span",{class:"token operator"},"="),n("span",{class:"token string"},'"c"'),n("span",{class:"token punctuation"},")"),a(`
    `),n("span",{class:"token keyword"},"private"),a(),n("span",{class:"token class-name"},"String"),a(" a"),n("span",{class:"token punctuation"},";"),a(`
    `),n("span",{class:"token keyword"},"private"),a(),n("span",{class:"token class-name"},"String"),a(" b"),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token punctuation"},"}"),a(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),m=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token keyword"},"public"),a(),n("span",{class:"token keyword"},"class"),a(),n("span",{class:"token class-name"},"AVO"),n("span",{class:"token punctuation"},"{"),a(`
    `),n("span",{class:"token keyword"},"private"),a(),n("span",{class:"token class-name"},"String"),a(" a"),n("span",{class:"token punctuation"},";"),a(`
    `),n("span",{class:"token keyword"},"private"),a(),n("span",{class:"token class-name"},"String"),a(" b"),n("span",{class:"token punctuation"},";"),a(`
    `),n("span",{class:"token annotation punctuation"},"@Column"),n("span",{class:"token punctuation"},"("),a("value"),n("span",{class:"token operator"},"="),n("span",{class:"token string"},'"c"'),n("span",{class:"token punctuation"},")"),a(`
    `),n("span",{class:"token keyword"},"private"),a(),n("span",{class:"token class-name"},"String"),a(" d"),n("span",{class:"token punctuation"},";"),a(`
`),n("span",{class:"token punctuation"},"}"),a(`
`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),y=p(`<h2 id="column-only-默认" tabindex="-1"><a class="header-anchor" href="#column-only-默认" aria-hidden="true">#</a> COLUMN_ONLY(默认)</h2><p>表示实体的对应的列名和映射对象的列名相同能映射</p><p>A.a-&gt;AVO.d</p><p>A.b-&gt;AVO.b</p><p>N/A-&gt;AVO.a</p><h2 id="property-first" tabindex="-1"><a class="header-anchor" href="#property-first" aria-hidden="true">#</a> PROPERTY_FIRST</h2><p>表示实体的对应的属性名和映射对象的属性名相同能映射,和<code>PROPERTY_ONLY</code>的区别就是如果是函数式片段没有property通过alias来匹配</p><p>A.a-&gt;AVO.a</p><p>A.b-&gt;AVO.b</p><p>N/A-&gt;AVO.d</p><h2 id="property-only" tabindex="-1"><a class="header-anchor" href="#property-only" aria-hidden="true">#</a> PROPERTY_ONLY</h2><p>表示实体的对应的属性名和映射对象的属性名相同能映射</p><p>A.a-&gt;AVO.a</p><p>A.b-&gt;AVO.b</p><p>N/A-&gt;AVO.d</p><h2 id="column-and-property" tabindex="-1"><a class="header-anchor" href="#column-and-property" aria-hidden="true">#</a> COLUMN_AND_PROPERTY</h2><p>表示先使用实体对应的列名匹配如果无法映射则使用属性名进行匹配</p><p>A.a-&gt;AVO.d</p><p>A.b-&gt;AVO.b</p><p>N/A-&gt;AVO.a</p><h1 id="solon-下如何全局修改" tabindex="-1"><a class="header-anchor" href="#solon-下如何全局修改" aria-hidden="true">#</a> Solon 下如何全局修改</h1><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token class-name">Solon</span><span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token class-name">Main</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> args<span class="token punctuation">,</span> app <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>

        app<span class="token punctuation">.</span><span class="token function">onEvent</span><span class="token punctuation">(</span><span class="token class-name">EasyQueryBuilderConfiguration</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> configuration <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>

            <span class="token comment">// COLUMN_ONLY: 默认策略, 表示实体的对应的列名和映射对象的列名相同能映射</span>
            configuration<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">EntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">ColumnEntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// PROPERTY_ONLY: 表示实体的对应的属性名和映射对象的属性名相同能映射</span>
            configuration<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">EntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">PropertyEntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// COLUMN_AND_PROPERTY: 表示先使用实体对应的列名匹配如果无法映射则使用属性名进行匹配</span>
            configuration<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">EntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">TryColumnAndPropertyEntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// PROPERTY_FIRST: 推荐策略, 表示实体的对应的属性名和映射对象的属性名相同能映射,和PROPERTY_ONLY的区别就是如果是函数式片段没有property通过alias来匹配</span>
            configuration<span class="token punctuation">.</span><span class="token function">replaceService</span><span class="token punctuation">(</span><span class="token class-name">EntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token class-name">PropertyFirstEntityMappingRule</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22);function b(h,O){const o=l("Tabs");return i(),u("div",null,[k,r(o,{id:"67",data:[{id:"entity"},{id:"vo"}]},{title0:s(({value:e,isActive:t})=>[a("entity")]),title1:s(({value:e,isActive:t})=>[a("vo")]),tab0:s(({value:e,isActive:t})=>[v]),tab1:s(({value:e,isActive:t})=>[m]),_:1}),y])}const A=c(d,[["render",b],["__file","mapping-rule.html.vue"]]);export{A as default};
