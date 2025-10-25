import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as e,b as i,d as t,a as l,o as h}from"./app-DBZ1PFCS.js";const k={},r=["src"];function p(a,s){return h(),e("div",null,[s[0]||(s[0]=i('<h1 id="聚合根保存" tabindex="-1"><a class="header-anchor" href="#聚合根保存"><span>聚合根保存</span></a></h1><p><code>eq</code>在<code>3.1.24</code>后实现了聚合根保存模式,能够在<code>track</code>模式下实现对聚合根对象的记录变更和对应的值对象的差异变更,实现用户无感轻松实现保存完整对象树</p><p>聚合根保存能带来什么好处</p><p>用干净整洁的代码换来复杂的关系数据保存</p><p><a href="https://github.com/xuejmnet/eq-doc" target="_blank" rel="noopener noreferrer">本章节demo请点击链接</a> <a href="https://github.com/xuejmnet/eq-doc" target="_blank" rel="noopener noreferrer">https://github.com/xuejmnet/eq-doc</a></p><h2 id="聚合根保存流程" tabindex="-1"><a class="header-anchor" href="#聚合根保存流程"><span>聚合根保存流程</span></a></h2>',6)),t("img",{src:a.$withBase("/images/save-flow.png")},null,8,r),s[1]||(s[1]=i('<h2 id="概念" tabindex="-1"><a class="header-anchor" href="#概念"><span>概念</span></a></h2><p>在开始进入聚合根保存前我们需要先了解几个概念</p><h3 id="聚合根" tabindex="-1"><a class="header-anchor" href="#聚合根"><span>聚合根</span></a></h3><p><code>a</code>和<code>b</code>两张表用<code>a</code>的主键去关联<code>b</code>那么<code>a</code>就是聚合根，<code>b</code>就是值对象<br> 一句话用自己的主键作为关联关系，那么自己就是聚合根而目标导航就是值对象或者其他</p><h3 id="值对象" tabindex="-1"><a class="header-anchor" href="#值对象"><span>值对象</span></a></h3><p><code>a</code>和<code>b</code>两张表用<code>a</code>的主键去关联<code>b</code>那么<code>a</code>就是聚合根，<code>b</code>就是值对象<br> 当前对象的关联导航targetProperty为目标表的主键，那么当前表就是目标表的值对象</p><p>值对象有两种</p><ul><li>级联为null，这种值对象不会继续递归遍历下级导航属性,这种值对象在聚合根保存的时候只有update 关联键的份永远不会出现<code>insert</code>和<code>delete</code></li><li>级联删除,这种值对象是真正的值对象,是被当前聚合根驱动，并且会往下遍历导航属性，并且存在<code>insert</code>，<code>update</code>，<code>delete</code>三种状态</li></ul><h3 id="其他关系" tabindex="-1"><a class="header-anchor" href="#其他关系"><span>其他关系</span></a></h3><p>非主键比如其他column进行两张表之间关联,或者是多对多无中间表又或者是path路径左匹配这种我们认为是其他关系</p><h2 id="级联脱钩选项" tabindex="-1"><a class="header-anchor" href="#级联脱钩选项"><span>级联脱钩选项</span></a></h2><p><code>@Navigate</code>的属性<code>cascade</code>拥有如下几种枚举</p><table><thead><tr><th>类型</th><th>功能</th></tr></thead><tbody><tr><td>AUTO</td><td>涉及到对象脱钩操作，系统自动处理，默认采用<code>set null</code>,如果是多对多操作中间表则无法确定需要用户自行处理</td></tr><tr><td>NO_ACTION</td><td>脱钩不做任何处理用户自行处理</td></tr><tr><td>SET_NULL</td><td>脱钩处理设置targetProperty为null,对目标记录不进行删除</td></tr><tr><td>DELETE</td><td>脱钩处理设置时将目标对象删除比如<code>user</code>和<code>user_role</code>和<code>role</code>那么<code>user_role</code>可以设置为<code>delete</code></td></tr></tbody></table><h2 id="api介绍" tabindex="-1"><a class="header-anchor" href="#api介绍"><span>API介绍</span></a></h2><table><thead><tr><th>API</th><th>功能</th></tr></thead><tbody><tr><td>configure</td><td>对当前保存表达式进行配置选项比如不处理根节点，让用户自行处理进行并发判断</td></tr><tr><td>savePath</td><td>保存时明确只保存哪些对象路径</td></tr><tr><td>ignoreRoot</td><td>忽略更节点的保存插入和修改</td></tr><tr><td>removeRoot</td><td>移除根节点包括移除剩余的其他include节点</td></tr></tbody></table><h2 id="savable能带来什么" tabindex="-1"><a class="header-anchor" href="#savable能带来什么"><span>savable能带来什么</span></a></h2><p>在没有savable的时候我们创建多对多关系需要创建user，user_role,role,并且需要对user的id赋值然后给role的id赋值，给user_role的userId和roleId赋值，这是新增需要考虑的</p><p>如果是修改则需要找出哪些需要新增，哪些需要删除，哪些需要修改，甚至如果暴力一点只能把user_role全部删除然后重新新增，但是这样会导致user_role的id变更掉，假如user_role是一张带有业务字段的中间表则这种删除后新增的方式将不再适用</p><p>有了save后我们可以怎么做呢</p><div class="language-java line-numbers-mode has-collapsed-lines collapsed" data-highlighter="shiki" data-ext="java" style="--vp-collapsed-lines:30;--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"></span>\n<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    private</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> final</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> EasyEntityQuery</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> easyEntityQuery</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B;">PostMapping</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;/create&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B;">Transactional</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">rollbackFor</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> Exception</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">class</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    @</span><span style="--shiki-light:#A626A4;--shiki-dark:#E5C07B;">EasyQueryTrack</span></span>\n<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    public</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> Object</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> create</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">() {</span></span>\n<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">        ArrayList</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF;">&lt;</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">SysRole</span><span style="--shiki-light:#E45649;--shiki-dark:#ABB2BF;">&gt;</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> sysRoles </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> ArrayList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">&lt;&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">        {</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">            SysRole</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> sysRole </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> SysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;管理员&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">);</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setCreateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">LocalDateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">now</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">());</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRoles</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(sysRole);</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">        }</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">        {</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">            SysRole</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> sysRole </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> SysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;游客&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">);</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRole</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setCreateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">LocalDateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">now</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">());</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">            sysRoles</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">add</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(sysRole);</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">        }</span></span>\n<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">        SysUser</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> sysUser </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> SysUser</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">()</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        sysUser</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setName</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;小明&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">);</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        sysUser</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setAge</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">18</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">);</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        sysUser</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setCreateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">LocalDateTime</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">now</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">());</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        sysUser</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">setSysRoleList</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(sysRoles);</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        easyEntityQuery</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">savable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(sysRoles).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">executeCommand</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>\n<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        easyEntityQuery</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">savable</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(sysUser).</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">executeCommand</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>\n<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &quot;ok&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">;</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;">    }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div><div class="collapsed-lines"></div></div><p>我们只需要创建user和role，然后分别对其进行保存即可,我们来看生成的sql</p><div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Preparing: </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">INSERT INTO</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> `t_role`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`name`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`create_time`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">VALUES</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (?,?,?)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Parameters: 1a4c554e4b8b4cff81c87d9298b853ed(String),管理员(String),</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">2025</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">09</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-11T22:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">35</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">31</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">143878</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(LocalDateTime)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Preparing: </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">INSERT INTO</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> `t_role`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`name`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`create_time`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">VALUES</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (?,?,?)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Parameters: bb9278911ecb4fe19c8a41a4e26a7c06(String),游客(String),</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">2025</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">09</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-11T22:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">35</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">31</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">143909</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(LocalDateTime)</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Preparing: </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">INSERT INTO</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> `t_user`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`name`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`age`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`create_time`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">VALUES</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (?,?,?,?)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Parameters: 2164d097983b4874859b01ef02f53340(String),小明(String),</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">18</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">Integer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">),</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">2025</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">09</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">-11T22:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">35</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">31</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">143932</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(LocalDateTime)</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Preparing: </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">INSERT INTO</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> `t_user_role`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`user_id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`role_id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">VALUES</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (?,?,?)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Parameters: b588a3ce9c72484fba366ce7288d8f5c(String),2164d097983b4874859b01ef02f53340(String),1a4c554e4b8b4cff81c87d9298b853ed(String)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Preparing: </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">INSERT INTO</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> `t_user_role`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`user_id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">`role_id`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">VALUES</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (?,?,?)</span></span>\n<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> ==&gt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> Parameters: 91b39127ba5d499f9cde6a326a49a71d(String),2164d097983b4874859b01ef02f53340(String),bb9278911ecb4fe19c8a41a4e26a7c06(String)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',22)),l(` 

### 举例一对多
\`\`\`java
public class SysUser{
    @Column(primaryKey = true)
    private String id;
    private String name;

    /**
     * 用户拥有的银行卡数
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"},partitionOrder = PartitionOrderEnum.IGNORE)
    private List<SysBankCard> bankCards;

}
\`\`\`
\`SysUser\`和\`SysBankCard\`一对多,并且\`selfProperty = {"id"}\`为主键,所以我们认为\`SysBankCard\`是\`SysUser\`的值对象，所以如果你在构建\`SysUser\`的时候一起构建了\`SysBankCard\`那么会一并进行添加或者修改

\`\`\`java

        SysUser sysUser = new SysUser();
        sysUser.setPhone("....");
        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");

        SysBank sysBank = new SysBank();
        sysBank.setName("....");
        sysBankCard.setBank(sysBank);

        sysUser.setBankCards(Arrays.asList(sysBankCard));

        //这么写会报错因为SysBankCard存在一个聚合根,那么会将这个聚合根的关联属性bankId赋值但是因为初始化所以sysBank还没有id会报错
//        easyEntityQuery.savable(sysUser).executeCommand();

        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(sysBank).executeCommand();
            easyEntityQuery.savable(sysUser).executeCommand();
            transaction.commit();
        }
\`\`\`
我们需要先保存\`sysBank\`,在插入时会回写\`id\`，然后\`savable(sysUser)\`的时候会回写聚合根关联属性

### 举例多对一
\`\`\`java

public class SysBankCard {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    /**
     * 银行卡号
     */
    private String code;

    /**
     * 所属银行
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"})
    private SysBank bank;

    /**
     * 所属用户
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}

\`\`\`

\`SysBankCard\`和\`SysBank\`是多对一，\`SysBankCard\`和\`SysUser\`也是是多对一，那么在构建\`SysBankCard\`的时候因为\`SysBank\`和\`SysUser\`都是\`SysBankCard\`的聚合根,所以savable(new SysBankCard())，哪怕\`SysBankCard\`添加了对应的\`SysBank\`或\`SysUser\`也只会获取聚合根的关联关系值赋值给当前\`SysBankCard\`
在\`savable(new SysBankCard())\`的时候只会保存\`SysBankCard\`本身
\`\`\`java

        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .whereById("123").singleNotNull();
        sysBankCard.setUser(sysUser);

        //开启事务后save
        //这次保存只会新增sysBankCard并且会把sysUser的id赋值给sysBankCard的uid字段
        easyEntityQuery.savable(sysBankCard).executeCommand();
\`\`\`

### 多对多
多对多这是一个比较特殊的关联关系

首先用户需要明白这个多对多的中间表是否有业务字段,也就是除了关联关系，住建和创建时间这种通用字段外的业务字段。

用户需要明确告知框架是否在多对多保存的时候处理中间表，如果存在额外业务字段那么是无法自动保存的需要用户手动处理,或者额外添加一个当前表和中间表的一对多关系。
\`\`\`java

@Data
@EntityProxy
@Table("m8_user")
@FieldNameConstants
public class M8User implements ProxyEntityAvailable<M8User , M8UserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {M8User.Fields.id},
            selfMappingProperty = {M8UserRole.Fields.userId},
            mappingClass = M8UserRole.class,
            targetProperty = {M8Role.Fields.id},
            targetMappingProperty = {M8UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)//设置为值对象那么会自动处理中间表
    private List<M8Role> roles;
}



        M8User m8User = easyEntityQuery.queryable(M8User.class)
                .includes(m -> m.roles())
                .singleNotNull();
        List<M8Role> list = easyEntityQuery.queryable(M8Role.class)
                .where(m -> {
                })
                .toList();
        m8User.getRoles().remove(0);
        m8User.getRoles().addAll(list);


        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(m8User).executeCommand();//自动移除一个UserRole并且添加和list数量一样的UserRole
            transaction.commit();
        }
\`\`\`

如果存在业务字段那么请将cascade改成\`cascade = CascadeTypeEnum.NO_ACTION\`然后单独创建\`User\`和\`UserRole\`的导航

\`\`\`java

@Data
@EntityProxy
@Table("m8_user")
@FieldNameConstants
public class M8User implements ProxyEntityAvailable<M8User, M8UserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {M8User.Fields.id},
            selfMappingProperty = {M8UserRole.Fields.userId},
            mappingClass = M8UserRole.class,
            targetProperty = {M8Role.Fields.id},
            targetMappingProperty = {M8UserRole.Fields.roleId}, cascade = CascadeTypeEnum.NO_ACTION)
    private List<M8Role> roles;

    /**
     * 新增一个导航输入因为M8UserRole存在业务字段
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {M8User.Fields.id}, targetProperty = {M8UserRole.Fields.userId})
    private List<M8UserRole> m8UserRoleList;
}


M8User user=new M8User()
M8UserRole userRole=new M8UserRole() 
userRole.setBusiness("XXXXX");
user.setM8UserRoleList(Arrays.asList(userRole))


try(Transaction transaction = easyEntityQuery.beginTransaction()){
    easyEntityQuery.savable(user).executeCommand();
    transaction.commit();
}
\`\`\` `)])}const B=n(k,[["render",p]]),g=JSON.parse('{"path":"/savable/","title":"聚合根保存","lang":"zh-CN","frontmatter":{"title":"聚合根保存","description":"聚合根保存 eq在3.1.24后实现了聚合根保存模式,能够在track模式下实现对聚合根对象的记录变更和对应的值对象的差异变更,实现用户无感轻松实现保存完整对象树 聚合根保存能带来什么好处 用干净整洁的代码换来复杂的关系数据保存 本章节demo请点击链接 https://github.com/xuejmnet/eq-doc 聚合根保存流程 概念 在开始...","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"聚合根保存\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2025-10-23T14:13:27.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xuejmnet\\",\\"url\\":\\"https://github.com/xuejmnet\\"}]}"],["meta",{"property":"og:url","content":"https://github.com/dromara/easy-query/easy-query-doc/savable/"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"聚合根保存"}],["meta",{"property":"og:description","content":"聚合根保存 eq在3.1.24后实现了聚合根保存模式,能够在track模式下实现对聚合根对象的记录变更和对应的值对象的差异变更,实现用户无感轻松实现保存完整对象树 聚合根保存能带来什么好处 用干净整洁的代码换来复杂的关系数据保存 本章节demo请点击链接 https://github.com/xuejmnet/eq-doc 聚合根保存流程 概念 在开始..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-10-23T14:13:27.000Z"}],["meta",{"property":"article:modified_time","content":"2025-10-23T14:13:27.000Z"}]]},"git":{"createdTime":1757485027000,"updatedTime":1761228807000,"contributors":[{"name":"xuejiaming","username":"xuejiaming","email":"326308290@qq.com","commits":8,"url":"https://github.com/xuejiaming"}]},"readingTime":{"minutes":6.13,"words":1838},"filePathRelative":"savable/README.md","autoDesc":true}');export{B as comp,g as data};
