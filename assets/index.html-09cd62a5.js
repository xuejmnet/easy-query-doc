import{_ as i}from"./qrcode-1849df2b.js";import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{r as o,o as c,c as u,b as e,d as t,a as d,w as s,e as r}from"./app-147606d9.js";const h={},y=e("h2",{id:"简介",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#简介","aria-hidden":"true"},"#"),t(" 简介")],-1),q=e("p",null,[t("Easy Query是一款轻量级的ORM框架，它完全独立，无需任何第三方依赖。"),e("br"),t(" 我们只需要建好表，就可以使用Easy Query的Idea插件生成对应的实体类和查询类，直接可以进行单表进行增删改查操作，包括批量操作。"),e("br"),t(" Easy Query提供了许多有泛型约束的方法，结合IDEA插件的支持，可以为表别名、列名和列类型提供友好的代码提示，使得编写查询逻辑如同在SQL客户端编写SQL语句一样直观简便。"),e("br"),t(" Easy Query简化了多表关联操作，只要声明好了实体类之间的关联关系，也就是表之间的关联关系，它就可以自动查询关联表的数据。")],-1),_=e("h2",{id:"开源框架",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#开源框架","aria-hidden":"true"},"#"),t(" 开源框架")],-1),m={href:"https://github.com/link2fun/kyou-solon",target:"_blank",rel:"noopener noreferrer"},p=e("h3",{id:"特性",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#特性","aria-hidden":"true"},"#"),t(" 特性")],-1),f=r('<li>无实体查询,无实体更新,无实体新增,无实体删除等操作</li><li>使用Easy Query的<a href="/easy-query-doc/query/dynamic-where">动态条件</a>可以自动将有值的条件拼接到SQL中，省掉重复的判空和拼接SQL操作，</li><li>动态排序,form表单排序,前端指定排序 <a href="/easy-query-doc/query/dynamic-sort">DynamicOrderBy</a></li><li>对象关系结构化VO自动组装返回,支持一对多一对一结果筛选,排序,limit</li><li>多数据源,动态多数据源，支持<code>SpringEL</code>，使用场景多租户(一个租户一个库) <a href="/easy-query-doc/config/muti-datasource">DynamicDataSource</a></li><li>软删除，软删除部分禁用启用非常方便，软删除记录删除时间,删除人 <a href="/easy-query-doc/adv/logic-delete">LogicDelete</a></li><li>自定义错误异常快速针对<code>firstNotNull</code>、<code>singleNotNull</code>、<code>required</code> <a href="/easy-query-doc/practice/configuration/exception">Exception</a></li>',7),b=e("li",null,[t("数据填充,自动赋值创建人创建时间,修改人修改时间 "),e("a",{href:"/easy-query-doc/adv/interceptor"},"拦截器"),t("、 "),e("a",{href:"/easy-query-doc/practice/configuration/entity"},"对象实战")],-1),g=e("li",null,[t("慢sql监听拦截,自动上报预警 "),e("a",{href:"/easy-query-doc/adv/jdbc-listener"},"jdbc执行监听器")],-1),Q=e("li",null,[t("数据库列的加密和加密后的模糊查询企业级解决方案 "),e("a",{href:"/easy-query-doc/adv/column-encryption"},"数据库列加密")],-1),x=r('<li>VO对象直接返回 <a href="/easy-query-doc/query/select">自定义vo列返回</a></li><li>数据库对象模型关联查询：一对多、一对一、多对多、多对一 <a href="/easy-query-doc/startup/nodsl">对象关系查询</a></li><li>对象关系关联查询<code>nosql</code>不仅仅是<code>sql</code>联级筛选,支持额外条件过滤比如公用中间表,多对多关联+type区分 <a href="/easy-query-doc/query/relation-filter">联级筛选Include Filter</a></li><li><a href="/easy-query-doc/startup/nodsl">对象关系查询</a>、<a href="/easy-query-doc/startup/sql">SQL查询</a>强类型语法的sql查询语法</li><li>智能的差异识别更新、并发更新 <a href="/easy-query-doc/basic/update">更新、追踪</a></li><li>自带分页方法和无依赖分页链式返回 <a href="/easy-query-doc/query/paging">分页</a></li><li>Embeddable、ValueObject对象 <a href="/easy-query-doc/adv/value-object">值对象</a></li><li>数据权限,业务权限拦截器,我能查看我下面的所有组,组长可以查询所有组员的数据,组员查看自己的数据</li><li>原生sql片段使用,方便开发人员使用数据库特有的函数或者方言</li><li>java函数数据库封装支持各个数据库</li><li>group感知,在众多orm中极少数orm才会支持的group感知</li><li>无任何依赖的框架,不会有任何冲突</li><li>sql多表查询支持join、in、exists等子查询</li><li>idea插件提供更加高效快速的开发效率和开发体验</li><li>大数据流式查询防止oom</li><li>自带便捷的<code>batch</code>批处理</li><li>动态报名支持对查询的表名进行动态设置可以再非分库分表模式下直接操作对应表</li><li>配合<code>easy-cache</code>实现缓存的便捷使用并且是一个企业级别的延迟双删</li><li>insert or update语法方言 <a href="/easy-query-doc/basic/insertOrUpdate">InsertOrUpdate</a></li><li>计算属性,额外计算列比如年龄是动态的而不是固定的,所以年龄应该是<code>(当前时间-出生日期)</code>,复杂计算属性比如班级表存在学生数量这个属性这个属性应该是<code>select count(*) from student where class_id=?</code></li>',20),k=r('<h2 id="数据库支持" tabindex="-1"><a class="header-anchor" href="#数据库支持" aria-hidden="true">#</a> 数据库支持</h2><table><thead><tr><th>数据库名称</th><th>包名</th><th>springboot配置</th><th>solon配置</th></tr></thead><tbody><tr><td>MySQL</td><td>sql-mysql</td><td>mysql</td><td>mysql</td></tr><tr><td>Oracle</td><td>sql-oracle</td><td>oracle</td><td>oracle</td></tr><tr><td>PostgresSQL</td><td>sql-pgsql</td><td>pgsql</td><td>pgsql</td></tr><tr><td>SqlServer</td><td>sql-mssql</td><td>mssql</td><td>mssql</td></tr><tr><td>SqlServer RowNumber</td><td>sql-mssql</td><td>mssql_row_number</td><td>mssql_row_number</td></tr><tr><td>H2</td><td>sql-h2</td><td>h2</td><td>h2</td></tr><tr><td>SQLite</td><td>sql-sqlite</td><td>sqlite</td><td>sqlite</td></tr><tr><td>ClickHouse</td><td>sql-clickhouse</td><td>clickhouse</td><td>clickhouse</td></tr><tr><td>达梦dameng</td><td>sql-dameng</td><td>dameng</td><td>dameng</td></tr><tr><td>人大金仓KingbaseES</td><td>sql-kingbase-es</td><td>kingbase_es</td><td>kingbase_es</td></tr></tbody></table>',2),v={href:"https://github.com/xuejmnet/easy-query/tree/main/sql-db-support",target:"_blank",rel:"noopener noreferrer"},S=e("code",null,"sql-db-support",-1),E=r('<h2 id="🔔qq交流群" tabindex="-1"><a class="header-anchor" href="#🔔qq交流群" aria-hidden="true">#</a> 🔔QQ交流群</h2><p>如果有什么功能建议或者开发中遇到什么问题，欢迎加入QQ交流群。</p><div style="text-align:center;"><img src="'+i+'" alt="群号: 170029046" class="no-zoom" style="width:200px;"><h4 id="easyquery官方qq群-170029046" tabindex="-1"><a class="header-anchor" href="#easyquery官方qq群-170029046" aria-hidden="true">#</a> EasyQuery官方QQ群: 170029046</h4></div>',3);function L(w,N){const a=o("ExternalLinkIcon"),l=o("RouterLink");return c(),u("div",null,[y,q,_,e("p",null,[e("a",m,[t("kyou-solon"),d(a)])]),p,e("ul",null,[f,e("li",null,[t("枚举和数据库映射,数据脱敏,数据编码存储解码获取,枚举属性,json或者数组,计算属性等 "),d(l,{to:"/prop/"},{default:s(()=>[t("ValueConverter,ColumnValueSQLConverter")]),_:1})]),b,g,Q,e("li",null,[t("分库分表，读写分离 "),d(l,{to:"/super/"},{default:s(()=>[t("分库分表，读写分离")]),_:1}),t(" (敬请期待已经完成功能文档还在完善中)")]),x]),k,e("p",null,[t("Easy Query目前已经抽象了表达式,所以原则上支持所有数据库,只需要自定义实现对应数据库的增删改查接口即可,也就是"),e("a",v,[S,t("open in new window"),d(a)]),t(" 。所以如果不支持对应的sql那么你可以自行扩展或者提交相应的issue")]),E])}const C=n(h,[["render",L],["__file","index.html.vue"]]);export{C as default};