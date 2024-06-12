---
home: true
icon: home
title: 项目主页
heroImage: /logo.svg
heroText: easy-query
tagline: 🚀 java下唯一一款同时支持强类型对象关系查询和强类型SQL语法查询的ORM,拥有对象模型筛选、隐式子查询、隐式join、显式子查询、显式join,支持Java/Kotlin
actions:
  - text: 开始使用 →
    link: /startup/dir
    type: primary

  - text: 爱心支持💡
    link: /support

# features:

# - title: 零依赖
#   icon: async
#   details: 核心包无任何依赖,没有历史包袱,全部自行实现
#   # link: /easy-query-doc/guide/query/relation

# - title: 零调用
#   icon: copy
#   details: 使用lambda表达式缓存实现bean对象的”零“调用耗时赋值和获取值,而不是普通的高频反射
#   # link: https://theme-hope.vuejs.press/zh/guide/layout/

# - title: 零SQL
#   icon: object
#   details: ORM 框架可以屏蔽 SQL 语句的复杂性，通过提供面向对象的查询语言、方法，简化数据查询和操作强类型更加安全
#   # link: https://theme-hope.vuejs.press/zh/guide/layout/

# - title: 零配置
#   icon: tool
#   details: ORM 框架可以通过自动扫描实体类和数据库表之间的映射关系，无需繁琐的配置文件。
#   # link: https://theme-hope.vuejs.press/zh/guide/layout/

# - title: 多语言
#   icon: language
#   details: 支持java、kotlin两种语言,并且提供了两种语言相似的api，维护同一套内部接口保证两边api仅仅是针对核心功能的扩展

# - title: 强类型
#   icon: structure
#   details: 如果一款orm不包含泛型约束,那么这个orm就没有必要存在,因为他和手写sql没有任何区别,无法在编译时为您提供错误信息,帮您做到强类型语言该有的提示

# - title: 分库分表
#   icon: condition
#   details: 一款自带分库分表读写分离的orm,拥有和市面上大部分分库分表框架抗衡的能力,并且抽象了业务逻辑可以让用户完全自定义自己的业务逻辑来实现

# - title: 列加密
#   icon: lock
#   details: 自带数据库列加密,并且支持模糊查询实现高性能而不是单纯的数据库函数调用,并且用户可以自定义自己的加密函数

# - title: VO查询
#   icon: search
#   details: 框架让VO的能得到了进一步的提升,而不是单纯的数据交换对象,用户可以针对VO的字段进行自动化列选择查询,并且支持自定义VO对象让其更加丰富
#   link: /guide/query/select-column

# - title: 差异更新
#   icon: change
#   details: 市面上基本上大部分java orm仅支持全量更新或者null列非null列更新,而不支持差异更新,框架提供差异更新追踪数据变化情况,提高更新sql的强壮性
#   link: /guide/basic/update#_3-差异更新

# - title: 原子列更新
#   icon: react
#   details: 实体对象更新如updateById是一个用户方便但是无差别更新的方法,但是框架提供了差异更新让其上升到了一个纬度并且在没有乐观锁的情况下支持库存数量级别的原子更新

# - title: 关联查询
#   icon: style
#   details: 框架不仅支持多表原始sql的join模式,也支持数据库对象模型的一对一、一对多、多对一、多对多模式,并且支持关联查询的自定义过滤,逻辑删除等一系列特性
#   link: /guide/query/relation

copyright: false
footer: 使用 <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a> 主题 | MIT 协议, 版权所有 © 2019-present Mr.Hope
---

::: code-tabs
@tab 单表查询

```java
//筛选用户名称包含小明的
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
    .where(s -> s.name().like("小明")).toList();
//筛选用户名称包含小明并且是2020年以前创建的
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
    .where(s -> {
            s.name().like("小明");
            s.createTime().lt(LocalDateTime.of(2020,1,1,0,0));
    }).toList();
//筛选用户名称包含小明的或者名称包含小红的
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
    .where(s -> {
        s.or(() -> {
            s.name().like("小明");
            s.name().like("小红");
        });
    }).toList();
```

@tab join 多表

```java
//匿名对象
List<Draft3<String, LocalDateTime, String>> userInfo = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(SysUserAddress.class, (user, addr) -> user.id().eq(addr.userId()))
        .where((user, addr) -> {
            user.name().like("小明");
            addr.city().eq("杭州");
        })
        .select((user, addr) -> Select.DRAFT.of(
                user.id(),
                user.createTime(),
                addr.area()
        )).toList();


List<UserDTO> userInfo = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(SysUserAddress.class, (user, addr) -> user.id().eq(addr.userId()))
        .where((user, addr) -> {
            user.name().like("小明");
            addr.city().eq("杭州");
        })
        .select(UserDTO.class,(user, addr) -> Select.DRAFT.of(
                user.FETCHER.id().createTime(),
                addr.area()
        )).toList();
```

@tab 隐式 join 筛选

```java
//user和address一对一
//查询杭州或绍兴的用户
List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
                .where(u -> {
                    //隐式子查询会自动join用户表和地址表
                    u.or(()->{
                      //
                        u.address().city().eq("杭州市");
                        u.address().city().eq("绍兴市");
                    });
                }).toList();


//查询用户名叫小明并且家住杭州的
List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
                .where(u -> {
                    u.name().eq("小明");
                    //隐式子查询会自动join用户表和地址表
                    u.address().city().eq("杭州市");
                }).toList();
```

@tab 隐式子查询

```java
//user和role多对多
//筛选用户角色是管理员的
List<SysUser> adminUsers = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                //筛选条件为角色集合里面有角色名称叫做管理员的
                s.roles().where(role -> {
                    role.name().eq("管理员");
                }).any();
            }).toList();

//匿名返回用户id和用户所拥有的角色数量
List<Draft2<String, Long>> userIdAndRoleCount = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.name().like("小明"))
        .select(user -> Select.DRAFT.of(
                user.id(),
                user.roles().count()
        )).toList();
```

@tab 显式子查询

```java

List<SysUser> userIn = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.id().in(
                    easyEntityQuery.queryable(SysRole.class)
                            .select(s -> s.id())
            );
        }).toList();


List<SysUser> userExists = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {

            user.expression().exists(()->{
                return easyEntityQuery.queryable(SysRole.class)
                        .where(role -> {
                            role.name().eq("管理员");
                            role.id().eq(user.id());
                        });
                    });
        }).toList();


//匿名返回用户id和用户所拥有的角色数量
List<Draft2<String, Long>> userIdAndRoleCount1 = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.name().like("小明"))
        .select(user -> Select.DRAFT.of(
                user.id(),
                user.expression().subQuery(() -> {
                    return easyEntityQuery.queryable(SysRole.class)
                            .where(r -> {
                                r.expression().exists(()->{
                                    return easyEntityQuery.queryable(UserRole.class)
                                            .where(u -> {
                                                u.roleId().eq(r.id());
                                                u.userId().eq(user.id());
                                            });
                                });
                            })
                            .selectCount();
                })
        )).toList();
```

@tab 结构化数据返回

```java

//可以直接筛选出结构化DTO
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(StructSysUserDTO.class).toList();


{
	"id": "...",
	"createTime": "...",
	"roles": [{
		"id": "...",
		"name": "",
		"menus": [{
			"id": "....",
			"name": "...."
		}, {
			"id": "....",
			"name": "...."
		}]
	}]
}

//返回用户角色和菜单

@Data
public class StructSysUserDTO {

    private String id;
    private String name;
    private LocalDateTime createTime;
    @Navigate(value = RelationTypeEnum.ManyToMany)
    private List<InternalRoles> roles;
    @Data
    public static class InternalRoles {
        private String id;
        //....
        @Navigate(value = RelationTypeEnum.ManyToMany)
        private List<InternalMenus> menus;
    }
    @Data
    public static class InternalMenus {
        private String id;
        private String name;
        //....
    }
}
```

@tab 结构化穿透

```java

快速返回用户拥有的菜单,因为用户和菜单中间由角色进行关联并且两者都是多对多所以如果需要自行实现那么是非常麻烦的一件事情

用户和菜单之间隔着角色的多对多所以如果想要获取用户的菜单id直接可以通过这种方式快速筛选

方式1 仅获取用户拥有的菜单id

List<String> menuIds = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .toList(s -> s.roles().flatElement().menus().flatElement().id());


方式2 仅获取用户拥有的菜单id和菜单名称


List<SysMenu> menuIdNames = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .toList(s -> s.roles().flatElement().menus().flatElement(x->x.FETCHER.id().name()));

List<SysUserFlatDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(SysUserFlatDTO.class).toList();

@Data
public class SysUserFlatDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;

    //穿透获取用户下的roles下的menus下的id 如果穿透获取的是非基本类型那么对象只能是数据库对象而不是dto对象
    @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
            SysUser.Fields.roles,
            SysRole.Fields.menus,
            SysMenu.Fields.id
    })
    private List<String> menuIds;

//非基本对象也可以直接返回数据库对象
//    @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
//            SysUser.Fields.roles,
//            SysRole.Fields.menus
//    })
//    private List<SysMenu> menu;

    @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
            SysUser.Fields.roles,
            SysMenu.Fields.id
    })
    private List<String> roleIds;
}


```

@tab 原生 sql

```java
//原生sql执行

List<SysUser> filterTime = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.expression().sql("{0} > {1}", c -> {
                c.value(LocalDateTime.now()).expression(user.createTime());
            });
        }).toList();

//原生sql片段


List<Draft2<String, String>> idAndName = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.createTime().gt(LocalDateTime.now());
        }).select(user -> Select.DRAFT.of(
                user.id(),
                user.expression().sqlType("IFNULL({0},'')", c -> c.expression(user.name())).setPropertyType(String.class)
        )).toList();

```

:::

<div align="center">
    <a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
        <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
    </a>
    <a target="_blank" href="https://www.apache.org/licenses/LICENSE-2.0.txt">
		<img src="https://img.shields.io/:license-Apache2-blue.svg" alt="Apache 2" />
	</a>
    <a target="_blank" href="https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html">
		<img src="https://img.shields.io/badge/JDK-8-green.svg" alt="jdk-8" />
	</a>
    <a target="_blank" href="https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html">
		<img src="https://img.shields.io/badge/JDK-11-green.svg" alt="jdk-11" />
	</a>
    <a target="_blank" href="https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html">
		<img src="https://img.shields.io/badge/JDK-17-green.svg" alt="jdk-17" />
	</a>
    <br />
        <img src="https://img.shields.io/badge/SpringBoot-v2.x-blue">
        <img src="https://img.shields.io/badge/SpringBoot-v3.x-blue">
        <a target="_blank" href='https://gitee.com/noear/solon'><img src="https://img.shields.io/badge/Solon-v2.x-blue"></a>
    <br />
    <a target="_blank" href='https://gitee.com/xuejm/easy-query'>
		<img src='https://gitee.com/xuejm/easy-query/badge/star.svg' alt='Gitee star'/>
	</a>
    <a target="_blank" href='https://github.com/xuejmnet/easy-query'>
		<img src="https://img.shields.io/github/stars/xuejmnet/easy-query.svg?logo=github" alt="Github star"/>
	</a>
    
</div>

## 🔔  QQ 群: 170029046

<br/>

# Dromara 成员项目

<div>
    <div class="com-box-f s-width">
        <div class="com-box com-box-you">
            <a href="https://gitee.com/dromara/TLog" target="_blank">
                <img src="/dromara/tlog.png" msg="一个轻量级的分布式日志标记追踪神器，10分钟即可接入，自动对日志打标签完成微服务的链路追踪">
            </a>
            <a href="https://gitee.com/dromara/liteFlow" target="_blank">
                <img src="/dromara/liteflow.png" msg="轻量，快速，稳定，可编排的组件式流程引擎">
            </a>
            <a href="https://hutool.cn/" target="_blank">
                <img src="/dromara/hutool.jpg" msg="🍬小而全的Java工具类库，使Java拥有函数式语言般的优雅，让Java语言也可以“甜甜的”。">
            </a>
            <a href="https://sa-token.dev33.cn/" target="_blank">
                <img src="/dromara/sa-token.png" msg="一个轻量级 java 权限认证框架，让鉴权变得简单、优雅！">
            </a>
            <a href="https://gitee.com/dromara/hmily" target="_blank">
                <img src="/dromara/hmily.png" msg="高性能一站式分布式事务解决方案。">
            </a>
            <a href="https://gitee.com/dromara/Raincat" target="_blank">
                <img src="/dromara/raincat.png" msg="强一致性分布式事务解决方案。">
            </a>
            <a href="https://gitee.com/dromara/myth" target="_blank">
                <img src="/dromara/myth.png" msg="可靠消息分布式事务解决方案。">
            </a>
            <a href="https://cubic.jiagoujishu.com/" target="_blank">
                <img src="/dromara/cubic.png" msg="一站式问题定位平台，以agent的方式无侵入接入应用，完整集成arthas功能模块，致力于应用级监控，帮助开发人员快速定位问题">
            </a>
            <a href="https://maxkey.top/" target="_blank">
                <img src="/dromara/maxkey.png" msg="业界领先的身份管理和认证产品">
            </a>
            <a href="http://forest.dtflyx.com/" target="_blank">
                <img src="/dromara/forest-logo.png" msg="Forest能够帮助您使用更简单的方式编写Java的HTTP客户端" nf>
            </a>
            <a href="https://jpom.top/" target="_blank">
                <img src="/dromara/jpom.png" msg="一款简而轻的低侵入式在线构建、自动部署、日常运维、项目监控软件">
            </a>
            <a href="https://su.usthe.com/" target="_blank">
                <img src="/dromara/sureness.png" msg="面向 REST API 的高性能认证鉴权框架">
            </a>
            <a href="https://easy-es.cn/" target="_blank">
                <img src="/dromara/easy-es2.png" msg="🚀傻瓜级ElasticSearch搜索引擎ORM框架">
            </a>
            <a href="https://gitee.com/dromara/northstar" target="_blank">
                <img src="/dromara/northstar_logo.png" msg="Northstar盈富量化交易平台">
            </a>
            <a href="https://dromara.gitee.io/fast-request/" target="_blank">
                <img src="/dromara/fast-request.gif" msg="Idea 版 Postman，为简化调试API而生">
            </a>
            <a href="https://www.jeesuite.com/" target="_blank">
                <img src="/dromara/mendmix.png" msg="开源分布式云原生架构一站式解决方案">
            </a>
            <a href="https://gitee.com/dromara/koalas-rpc" target="_blank">
                <img src="/dromara/koalas-rpc2.png" msg="企业生产级百亿日PV高可用可拓展的RPC框架。">
            </a>
            <a href="https://async.sizegang.cn/" target="_blank">
                <img src="/dromara/gobrs-async.png" msg="🔥 配置极简功能强大的异步任务动态编排框架">
            </a>
            <a href="https://dynamictp.cn/" target="_blank">
                <img src="/dromara/dynamic-tp.png" msg="🔥🔥🔥 基于配置中心的轻量级动态可监控线程池">
            </a>
            <a href="https://www.x-easypdf.cn" target="_blank">
                <img src="/dromara/x-easypdf.png" msg="一个用搭积木的方式构建pdf的框架（基于pdfbox）">
            </a>
            <a href="http://dromara.gitee.io/image-combiner" target="_blank">
                <img src="/dromara/image-combiner.png" msg="一个专门用于图片合成的工具，没有很复杂的功能，简单实用，却不失强大">
            </a>
            <a href="https://www.herodotus.cn/" target="_blank">
				<img src="/dromara/dante-cloud2.png" msg="Dante-Cloud 是一款企业级微服务架构和服务能力开发平台。">
            </a>
            <a href="https://www.mtruning.club/" target="_blank">
				<img src="/dromara/go-view.png" msg="GoView 是一个高效的拖拽式低代码数据可视化开发平台。">
            </a>
						<a href="https://tangyh.top/" target="_blank">
							<img src="/dromara/lamp-cloud.png"
								msg="微服务中后台快速开发平台，支持租户(SaaS)模式、非租户模式">
						</a>
						<a href="https://www.redisfront.com/" target="_blank">
							<img src="/dromara/redis-front.png"
								msg="RedisFront 是一款开源免费的跨平台 Redis 桌面客户端工具, 支持单机模式, 集群模式, 哨兵模式以及 SSH 隧道连接, 可轻松管理Redis缓存数据.">
						</a>
						<a href="https://www.yuque.com/u34495/mivcfg" target="_blank">
							<img src="/dromara/electron-egg.png"
								msg="一个入门简单、跨平台、企业级桌面软件开发框架">
						</a>
						<a href="https://gitee.com/dromara/open-capacity-platform" target="_blank">
							<img src="/dromara/open-capacity-platform.jpg"
								msg="简称ocp是基于Spring Cloud的企业级微服务框架(用户权限管理，配置中心管理，应用管理，....)">
						</a>
						<a href="http://easy-trans.fhs-opensource.top/" target="_blank">
							<img src="/dromara/easy_trans.png"
								msg="Easy-Trans 一个注解搞定数据翻译,减少30%SQL代码量">
						</a>
						<a href="https://gitee.com/dromara/neutrino-proxy" target="_blank">
							<img src="/dromara/neutrino-proxy.svg"
								msg="一款基于 Netty 的、开源的内网穿透神器。">
						</a>
						<a href="https://chatgpt.cn.obiscr.com/" target="_blank">
							<img src="/dromara/chatgpt.png"
								msg="一个支持在 JetBrains 系列 IDE 上运行的 ChatGPT 的插件。">
						</a>
						<a href="https://gitee.com/dromara/zyplayer-doc" target="_blank">
							<img src="/dromara/zyplayer-doc.png"
								msg="zyplayer-doc是一款适合团队和个人使用的WIKI文档管理工具，同时还包含数据库文档、Api接口文档。">
						</a>
						<a href="https://gitee.com/dromara/payment-spring-boot" target="_blank">
							<img src="/dromara/payment-spring-boot.png"
								msg="最全最好用的微信支付V3 Spring Boot 组件。">
						</a>
						<a href="https://www.j2eefast.com/" target="_blank">
							<img src="/dromara/j2eefast.png"
								msg="J2eeFAST 是一个致力于中小企业 Java EE 企业级快速开发平台,我们永久开源!">
						</a>
						<a href="https://gitee.com/dromara/data-compare" target="_blank">
							<img src="/dromara/dataCompare.png"
								msg="数据库比对工具：hive 表数据比对，mysql、Doris 数据比对，实现自动化配置进行数据比对，避免频繁写sql 进行处理，低代码(Low-Code) 平台">
						</a>
						<a href="https://gitee.com/dromara/open-giteye-api" target="_blank">
							<img src="/dromara/open-giteye-api.svg"
								msg="giteye.net 是专为开源作者设计的数据图表服务工具类站点，提供了包括 Star 趋势图、贡献者列表、Gitee指数等数据图表服务。">
						</a>
						<a href="https://gitee.com/dromara/RuoYi-Vue-Plus" target="_blank">
							<img src="/dromara/RuoYi-Vue-Plus.png"
								msg="后台管理系统 重写 RuoYi-Vue 所有功能 集成 Sa-Token + Mybatis-Plus + Jackson + Xxl-Job + SpringDoc + Hutool + OSS 定期同步">
						</a>
						<a href="https://gitee.com/dromara/RuoYi-Cloud-Plus" target="_blank">
							<img src="/dromara/RuoYi-Cloud-Plus.png"
								msg="微服务管理系统 重写RuoYi-Cloud所有功能 整合 SpringCloudAlibaba Dubbo3.0 Sa-Token Mybatis-Plus MQ OSS ES Xxl-Job Docker 全方位升级 定期同步">
						</a>
						<a href="https://gitee.com/dromara/stream-query" target="_blank">
							<img src="/dromara/stream-query.png"
								msg="允许完全摆脱 Mapper 的 mybatis-plus 体验！封装 stream 和 lambda 操作进行数据返回处理。">
						</a>
						<a href="https://wind.kim/" target="_blank">
							<img src="/dromara/sms4j.png"
								msg="短信聚合工具，让发送短信变的更简单。">
						</a>
						<a href="https://cloudeon.top/" target="_blank">
							<img src="/dromara/cloudeon.png"
								msg="简化kubernetes上大数据集群的运维管理">
						</a>
						<a href="https://github.com/dromara/hodor" target="_blank">
							<img src="/dromara/hodor.png"
								msg="Hodor是一个专注于任务编排和高可用性的分布式任务调度系统。">
						</a>
						<a href="http://nsrule.com/" target="_blank">
							<img src="/dromara/test-hub.png"
								msg="流程编排，插件驱动，测试无限可能">
						</a>
						<a href="https://gitee.com/dromara/disjob" target="_blank">
							<img src="/dromara/disjob-2.png"
								msg="Disjob是一个分布式的任务调度框架">
						</a>
						<a href="https://gitee.com/dromara/binlog4j" target="_blank">
							<img src="/dromara/Binlog4j.png"
								msg="轻量级 Mysql Binlog 客户端, 提供宕机续读, 高可用集群等特性">
						</a>
						<a href="https://gitee.com/dromara/yft-design" target="_blank">
							<img src="/dromara/yft-design.png"
								msg="基于 Canvas 的开源版 创客贴 支持导出json，svg, image文件。">
						</a>
						<a href="https://gitee.com/dromara/x-file-storage" target="_blank">
							<img src="/dromara/x-file-storage.svg"
								msg="在 SpringBoot 中通过简单的方式将文件存储到 本地、阿里云 OSS、腾讯云 COS、七牛云 Kodo等">
						</a>
						<a href="https://wemq.nicholasld.cn/" target="_blank">
							<img src="/dromara/wemq.png"
								msg="开源、高性能、安全、功能强大的物联网调试和管理解决方案。">
						</a>
						<a href="https://gitee.com/dromara/mayfly-go" target="_blank">
							<img src="/dromara/mayfly-go.png"
								msg="web 版 linux(终端[终端回放] 文件 脚本 进程 计划任务)、数据库（mysql postgres）、redis(单机 哨兵 集群)、mongo 统一管理操作平台">
						</a>
						<a href="https://akali.yomahub.com/" target="_blank">
							<img src="/dromara/akali.png"
								msg="Akali(阿卡丽)，轻量级本地化热点检测/降级框架，10秒钟即可接入使用！大流量下的神器">
						</a>
						<a href="https://gitee.com/dromara/dbswitch" target="_blank">
							<img src="/dromara/dbswitch.png"
								msg="异构数据库迁移同步(搬家)工具。">
						</a>
						<a href="https://gitee.com/dromara/easyAi" target="_blank">
							<img src="/dromara/easyAI.png"
								msg="Java 傻瓜式 AI 框架。">
						</a>
						<a href="https://gitee.com/dromara/mybatis-plus-ext" target="_blank">
							<img src="/dromara/mybatis-plus-ext.png"
								msg="mybatis-plus 框架的增强拓展包。">
						</a>
						<a href="https://gitee.com/dromara/dax-pay" target="_blank">
							<img src="/dromara/dax-pay.png"
								msg="免费开源的支付网关。">
						</a>
						<a href="https://gitee.com/dromara/sayOrder" target="_blank">
							<img src="/dromara/sayorder.png"
								msg="基于easyAi引擎的JAVA高性能，低成本，轻量级智能客服。">
						</a>
						<a href="https://gitee.com/dromara/mybatis-jpa-extra" target="_blank">
							<img src="/dromara/mybatis-jpa-extra.png"
								msg="扩展MyBatis JPA支持，简化CUID操作，增强SELECT分页查询">
						</a>
						<a href="https://newcar.js.org/zh/" target="_blank">
							<img src="/dromara/newcar.png"
								msg="现代化的动画引擎">
						</a>
						<a href="http://warm-flow.cn" target="_blank">
							<img src="/dromara/warm-flow.png"
								msg="国产自研工作流，其特点简洁(只有6张表)但又不简单，五脏俱全，组件独立，可扩展，可满足中小项目的组件。">
						</a>
						<a href="https://gitee.com/dromara/dy-java" target="_blank">
							<img src="/dromara/dy-java.png"
								msg="DyJava是一款功能强大的抖音Java开发工具包">
						</a>
						<a href="https://gitee.com/dromara/MilvusPlus" target="_blank">
							<img src="/dromara/MilvusPlus.jpg"
								msg="MilvusPlus（简称 MP）是一个 Milvus 的操作工具，旨在简化与 Milvus 向量数据库的交互，为开发者提供类似 MyBatis-Plus 注解和方法调用风格的直观 API,提高效率而生。">
						</a>
						<a href="http://www.easy-query.com/easy-query-doc/" target="_blank">
							<img src="/dromara/easy-query.png"
								msg="java下唯一一款同时支持强类型对象关系查询和强类型SQL语法查询的ORM,拥有对象模型筛选、隐式子查询、隐式join、显式子查询、显式join,支持Java/Kotlin">
						</a>
        </div>
        <div style="height: 10px; clear: both;"></div>
        <p>
            为往圣继绝学，一个人或许能走的更快，但一群人会走的更远。
        </p>
    </div>
    <div style="height: 60px;"></div>
</div>



## 🔔 交流 QQ 群

::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery 官方 QQ 群: 170029046

## github 仓库

[easy-query](https://github.com/xuejmnet/easy-query)

## gitee 仓库

[easy-query](https://gitee.com/xuejm/easy-query)

## 许可证

[Apache-2.0 License](https://github.com/xuejmnet/easy-query/blob/main/LICENSE)

## 文档主题

[vuepress-theme-hope](https://vuepress-theme-hope.github.io/)

<link rel="stylesheet" href="/index.css">
