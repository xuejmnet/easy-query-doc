---
home: true
icon: home
title: 项目主页
heroImage: /logo.svg
heroText: easy-query
tagline: 🚀 一款Java/Kotlin 语言下无依赖、高性能、轻量级、强类型的ORM框架支持分库分表读写分离
actions:
  - text: 开始使用 →
    link: /guide/
    type: primary

  - text: 爱心支持💡
    link: /support

features:
  - title: 零依赖
    icon: async
    details: 核心包无任何依赖,没有历史包袱,全部自行实现
    # link: /easy-query-doc/guide/query/relation

  - title: 零调用
    icon: copy
    details: 使用lambda表达式缓存实现bean对象的”零“调用耗时赋值和获取值,而不是普通的高频反射
    # link: https://theme-hope.vuejs.press/zh/guide/layout/

  - title: 零SQL
    icon: object
    details: ORM 框架可以屏蔽 SQL 语句的复杂性，通过提供面向对象的查询语言、方法，简化数据查询和操作强类型更加安全
    # link: https://theme-hope.vuejs.press/zh/guide/layout/

  - title: 零配置
    icon: tool
    details: ORM 框架可以通过自动扫描实体类和数据库表之间的映射关系，无需繁琐的配置文件。
    # link: https://theme-hope.vuejs.press/zh/guide/layout/

  - title: 多语言
    icon: language
    details: 支持java、kotlin两种语言,并且提供了两种语言相似的api，维护同一套内部接口保证两边api仅仅是针对核心功能的扩展


  - title: 强类型
    icon: structure
    details: 如果一款orm不包含泛型约束,那么这个orm就没有必要存在,因为他和手写sql没有任何区别,无法在编译时为您提供错误信息,帮您做到强类型语言该有的提示

  - title: 分库分表
    icon: condition
    details: 一款自带分库分表读写分离的orm,拥有和市面上大部分分库分表框架抗衡的能力,并且抽象了业务逻辑可以让用户完全自定义自己的业务逻辑来实现

  - title: 列加密
    icon: lock
    details: 自带数据库列加密,并且支持模糊查询实现高性能而不是单纯的数据库函数调用,并且用户可以自定义自己的加密函数

  - title: VO查询
    icon: search
    details: 框架让VO的能得到了进一步的提升,而不是单纯的数据交换对象,用户可以针对VO的字段进行自动化列选择查询,并且支持自定义VO对象让其更加丰富
    link: /guide/query/select-column

  - title: 差异更新
    icon: change
    details: 市面上基本上大部分java orm仅支持全量更新或者null列非null列更新,而不支持差异更新,框架提供差异更新追踪数据变化情况,提高更新sql的强壮性
    link: /guide/basic/update#_3-差异更新


  - title: 原子列更新
    icon: react
    details: 实体对象更新如updateById是一个用户方便但是无差别更新的方法,但是框架提供了差异更新让其上升到了一个纬度并且在没有乐观锁的情况下支持库存数量级别的原子更新

  - title: 关联查询
    icon: style
    details: 框架不仅支持多表原始sql的join模式,也支持数据库对象模型的一对一、一对多、多对一、多对多模式,并且支持关联查询的自定义过滤,逻辑删除等一系列特性
    link: /guide/query/relation
    
copyright: false
footer: 使用 <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a> 主题 | MIT 协议, 版权所有 © 2019-present Mr.Hope
---
## github仓库
[easy-query](https://github.com/xuejmnet/easy-query)

## gitee仓库
[easy-query](https://gitee.com/xuejm/easy-query)

## 许可证
[Apache-2.0 License](https://github.com/xuejmnet/easy-query/blob/main/LICENSE)


## 文档主题
[vuepress-theme-hope](https://vuepress-theme-hope.github.io/)

## 🔔交流QQ群
::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery官方QQ群: 170029046
:::


<br/>

