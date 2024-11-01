import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e}from"./app-0761cdab.js";const t={},p=e(`<h1 id="说明" tabindex="-1"><a class="header-anchor" href="#说明" aria-hidden="true">#</a> 说明</h1><p><code>NavigateFlat</code>注解使用在VO或者DTO对应的属性上,拥有可以直接获取对象关系的任意节点属性,比如在用户、角色、菜单中我们可以在用户的DTO中直接返回用户拥有的角色id集合和菜单id集合</p><p>没有n+1的复杂度,拥有高性能的获取</p><p>加入我们的对应关系是如下的</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SysUser</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

    <span class="token annotation punctuation">@Navigate</span><span class="token punctuation">(</span><span class="token class-name">ManyToMany</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SysRole</span><span class="token punctuation">&gt;</span></span> roles<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SysRole</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

    <span class="token annotation punctuation">@Navigate</span><span class="token punctuation">(</span><span class="token class-name">ManyToMany</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SysMenu</span><span class="token punctuation">&gt;</span></span> menus<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SysMenu</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="案例" tabindex="-1"><a class="header-anchor" href="#案例" aria-hidden="true">#</a> 案例</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UserDTO</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> name<span class="token punctuation">;</span>
    <span class="token comment">//告诉框架获取路径是用户下的roles下的id</span>
    <span class="token annotation punctuation">@NavigateFlat</span><span class="token punctuation">(</span>mappingPath <span class="token operator">=</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;roles&quot;</span><span class="token punctuation">,</span>
            <span class="token string">&quot;id&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> roleIds<span class="token punctuation">;</span>

    <span class="token comment">//告诉框架获取的路径是用户下的roles下的menus下的id</span>
    <span class="token annotation punctuation">@NavigateFlat</span><span class="token punctuation">(</span>mappingPath <span class="token operator">=</span> <span class="token punctuation">{</span>
            <span class="token string">&quot;roles&quot;</span><span class="token punctuation">,</span>
            <span class="token string">&quot;menus&quot;</span><span class="token punctuation">,</span>
            <span class="token string">&quot;id&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> menuIds<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然很多时候我们没有办法记住这个路径是如何的所以我们可以通过插件提供的<code>NaviatePathGenerate</code>快速生成</p><p>我们可以再对应的DTO上填写注解<code>@see</code>和<code>@link</code>只需要添加默认一个即可，注意将光标放到对应的属性上即呼出<code>NaviatePathGenerate</code>即可</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">SysUser</span></span>
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SysUser</span></span><span class="token punctuation">}</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UserDTO</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> name<span class="token punctuation">;</span>
    <span class="token comment">//告诉框架获取路径是用户下的roles下的id</span>

    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">MappingPath</span> <span class="token constant">ROLE_IDS_PATH</span> <span class="token operator">=</span> <span class="token class-name">SysUserProxy</span><span class="token punctuation">.</span><span class="token constant">TABLE</span><span class="token punctuation">.</span><span class="token function">roles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">flatElement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@NavigateFlat</span><span class="token punctuation">(</span>pathAlias <span class="token operator">=</span> <span class="token string">&quot;ROLE_IDS_PATH&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> roleIds<span class="token punctuation">;</span>

    <span class="token comment">//告诉框架获取的路径是用户下的roles下的menus下的id</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">MappingPath</span> <span class="token constant">MENU_IDS_PATH</span> <span class="token operator">=</span> <span class="token class-name">SysUserProxy</span><span class="token punctuation">.</span><span class="token constant">TABLE</span><span class="token punctuation">.</span><span class="token function">roles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">flatElement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">menus</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">flatElement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@NavigateFlat</span><span class="token punctuation">(</span>pathAlias <span class="token operator">=</span> <span class="token string">&quot;MENU_IDS_PATH&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> menuIds<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当属性是一对多或者多对多的时候需要再对应的属性后添加<code>flatElement</code>来展开</p><p>除了基本类型我们也可以穿透获取对象</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@see</span> <span class="token reference"><span class="token class-name">SysUser</span></span>
 * <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">SysUser</span></span><span class="token punctuation">}</span>
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UserDTO</span><span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token class-name">String</span> name<span class="token punctuation">;</span>

    <span class="token comment">//告诉框架获取的路径是用户下的roles下的menus</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">MappingPath</span> <span class="token constant">MENUS_PATH</span> <span class="token operator">=</span> <span class="token class-name">SysUserProxy</span><span class="token punctuation">.</span><span class="token constant">TABLE</span><span class="token punctuation">.</span><span class="token function">roles</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">flatElement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">menus</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">flatElement</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@NavigateFlat</span><span class="token punctuation">(</span>pathAlias <span class="token operator">=</span> <span class="token string">&quot;MENUS_PATH&quot;</span><span class="token punctuation">)</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MenuDTO</span><span class="token punctuation">&gt;</span></span> menus<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">MenuDTO</span><span class="token punctuation">{</span>
        <span class="token keyword">private</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>
        <span class="token keyword">private</span> <span class="token class-name">String</span> name<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么有人会问我们是否可以使用<code>@Naviagte</code>如果你只需要获取<code>roles</code>那么是可以的但是如果你需要放弃<code>roles</code>获取<code>role</code>下面的<code>menus</code>那么是不可以的</p><p>NavigateFlat可以做到获取基本类型集合或者基本类型也可以穿透获取任意节点的任意数据,并且拥有非常智能的合并如果在同一个对象下那么<code>eq</code>会非常智能的合并两个查询</p><p>那么我们添加好注解后如何获取数据呢</p><h2 id="selectautoinclude" tabindex="-1"><a class="header-anchor" href="#selectautoinclude" aria-hidden="true">#</a> selectAutoInclude</h2><p>我们可以通过<code>selectAutoInclude</code>让框架自动为我们拉取需要的数据并且会以最优解来查询数据</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>eq<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SysUser</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>u<span class="token operator">-&gt;</span><span class="token punctuation">{</span>
        u<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;小明&quot;</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">selectAutoInclude</span><span class="token punctuation">(</span><span class="token class-name">UserDTO</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,19),c=[p];function o(l,i){return s(),a("div",null,c)}const d=n(t,[["render",o],["__file","navigate-flat.html.vue"]]);export{d as default};
