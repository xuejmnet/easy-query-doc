import{_ as d}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o as t,c as s,a as i,b as e,d as a,w as o,e as r}from"./app-6a1cad1d.js";const u={},n=i("p",null,[e("如果您是"),i("code",null,"c#"),e("转过来的开发，如果您不想使用复杂恶心的xml来编写sql,如果您是一个有追求的喜欢强类型的技术开发,如果您是一个刚入行java的新人，那么easy-query将是非常适合您的一个框架，没有"),i("code",null,"mybatis"),e("的繁琐,可以快速的编写crud代码和复杂代码。")],-1),y=i("h2",{id:"目录指引",tabindex:"-1"},[i("a",{class:"header-anchor",href:"#目录指引","aria-hidden":"true"},"#"),e(" 目录指引")],-1),h=r('<li>无实体查询,无实体更新,无实体新增,无实体删除等操作</li><li>insert or update语法方言 <a href="/easy-query-doc/guide/basic/insertOrUpdate">InsertOrUpdate</a></li><li>对象关系结构化VO自动组装返回,支持一对多一对一结果筛选,排序,limit</li><li>多数据源,动态多数据源，支持<code>SpringEL</code>，使用场景多租户(一个租户一个库) <a href="/easy-query-doc/guide/config/muti-datasource">DynamicDataSource</a></li><li>表单动态条件查询分页,表单动态排序处理 <a href="/easy-query-doc/guide/query/dynamic-where">DynamicWhere</a>、<a href="/easy-query-doc/guide/query/dynamic-sort">DynamicOrderBy</a></li><li>软删除，软删除部分禁用启用非常方便，软删除记录删除时间,删除人 <a href="/easy-query-doc/guide/adv/logic-delete">LogicDelete</a></li>',6),_=i("a",{href:"/easy-query-doc/guide/adv/interceptor"},"拦截器",-1),f=i("li",null,[e("慢sql监听拦截,自动上报预警 "),i("a",{href:"/easy-query-doc/guide/adv/jdbc-listener"},"jdbc执行监听器")],-1),q=i("li",null,[e("数据库列的加密和加密后的模糊查询企业级解决方案 "),i("a",{href:"/easy-query-doc/guide/adv/column-encryption"},"数据库列加密")],-1),m=r('<li>VO对象直接返回 <a href="/easy-query-doc/guide/query/select">自定义vo列返回</a></li><li>数据库对象模型关联查询：一对多、一对一、多对多、多对一 <a href="/easy-query-doc/startup/nodsl">对象关系查询</a></li><li>对象关系关联查询<code>nosql</code>不仅仅是<code>sql</code>联级筛选,支持额外条件过滤比如公用中间表,多对多关联+type区分 <a href="/easy-query-doc/guide/query/relation-filter">联级筛选Include Filter</a></li><li>OLTP、OLAP强类型语法的sql查询语法 <a href="/easy-query-doc/startup/sql">DSL查询</a></li><li>智能的差异识别更新、并发更新 <a href="/easy-query-doc/guide/basic/update">更新、追踪</a></li><li>自带分页方法和无依赖分页链式返回 <a href="/easy-query-doc/guide/query/paging">分页</a></li><li>Embeddable、ValueObject对象 <a href="/easy-query-doc/guide/adv/value-object">值对象</a></li><li>数据权限,业务权限拦截器,我能查看我下面的所有组,组长可以查询所有组员的数据,组员查看自己的数据</li><li>原生sql片段使用,方便开发人员使用数据库特有的函数或者方言</li><li>java函数数据库封装支持各个数据库</li><li>group感知,在众多orm中极少数orm才会支持的group感知</li><li>无任何依赖的框架,不会有任何冲突</li><li>sql多表查询支持join、in、exists等子查询</li><li>idea插件提供更加高效快速的开发效率和开发体验</li><li>sql上下文泛型限制</li><li>大数据流式查询防止oom</li><li>自带便捷的<code>batch</code>批处理</li><li>动态报名支持对查询的表名进行动态设置可以再非分库分表模式下直接操作对应表</li><li>配合<code>easy-cache</code>实现缓存的便捷使用并且是一个企业级别的延迟双删</li><li>计算属性,额外计算列比如年龄是动态的而不是固定的,所以年龄应该是<code>(当前时间-出生日期)</code>,复杂计算属性比如班级表存在学生数量这个属性这个属性应该是<code>select count(*) from student where class_id=?</code></li>',20);function p(g,v){const l=c("RouterLink");return t(),s("div",null,[n,y,i("ul",null,[h,i("li",null,[e("枚举和数据库映射,数据脱敏,数据编码存储解码获取,枚举属性,json或者数组,计算属性等 "),a(l,{to:"/guide/prop/"},{default:o(()=>[e("ValueConverter,ColumnValueSQLConverter")]),_:1})]),i("li",null,[e("数据填充,自动赋值创建人创建时间,修改人修改时间 "),_,e("、 "),a(l,{to:"/practice/entity/"},{default:o(()=>[e("对象实战")]),_:1})]),f,q,i("li",null,[e("分库分表，读写分离 "),a(l,{to:"/guide/super/"},{default:o(()=>[e("分库分表，读写分离")]),_:1}),e(" (敬请期待已经完成功能文档还在完善中)")]),m])])}const V=d(u,[["render",p],["__file","index.html.vue"]]);export{V as default};
