---
home: true
icon: house
title: 项目主页
heroFullScreen: true
heroImage: /images/logo.svg
bgImage: /images/bg/6-light.svg
bgImageDark: /images/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: easy-query
tagline: 🚀 java下最强ORM没有之一(支持kotlin)</br><span class="vuepress_typed"></span> 
actions:
  - text: 开始使用 →
    icon: lightbulb
    link: ./what-is-easy-query
    type: primary

  - text: 爱心支持💡
    link: ./support

highlights:
  # - header: 优雅的dsl
  #   # image: /assets/image/features.svg
  #   # bgImage: /images/bg/1-light.svg
  #   # bgImageDark: /images/bg/1-dark.svg
  #   # image: https://jowayyoung.github.io/static/bruce/feature.svg
  #   # bgImage: /images/bg/9-light.svg
  #   # bgImageDark: /images/bg/9-dark.svg
  #   image: https://jowayyoung.github.io/static/bruce/summary.svg
  #   bgImage: /images/bg/3-light.svg
  #   bgImageDark: /images/bg/3-dark.svg
  #   highlights:
  #     - title: 123


  - header: 隐式查询
    image: /assets/image/features.svg
    bgImage: /easy-query-doc/images/bg/1-light.svg
    bgImageDark: /easy-query-doc/images/bg/1-dark.svg
    highlights:
      - title: 隐式join
        icon: network-wired
        details: OneToOne、ManyToOne 自动实现join查询筛选、排序和结果获取
        # link: https://theme-hope.vuejs.press/zh/guide/feature/catalog.html

      - title: 隐式子查询
        icon: comment-dots
        details: OneToMany、ManyToMany 自动实现子查询查询筛选、排序和聚合函数结果获取
        # link: https://theme-hope.vuejs.press/zh/guide/feature/comment.html

      - title: 隐式分组
        icon: circle-info
        details: OneToMany、ManyToMany 自动实现子查询优化合并将多个子查询合并成一个分组查询支持筛选、排序和聚合函数结果获取
        # link: https://theme-hope.vuejs.press/zh/guide/feature/page-info.html

      - title: 隐式分区分组
        icon: lock
        details: OneToMany、ManyToMany 自动实现第一个、第N个数据的筛选、排序和聚合函数结果获取
        # link: https://theme-hope.vuejs.press/zh/guide/feature/encrypt.html

      - title: 隐式CASE WHEN
        icon: code
        details: 属性.聚合函数.筛选，o.age().sum().filter(()->o.name().like("123"))
        # link: https://theme-hope.vuejs.press/zh/guide/feature/search.html

  - header: 功能
    description: 一套完整的针对jdbc的关系型数据库查询解决方案
    # image: https://jowayyoung.github.io/static/bruce/scheme.svg
    bgImage: /easy-query-doc/images/bg/2-light.svg
    bgImageDark: /easy-query-doc/images/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: code-first
        icon: clipboard-check
        details: 基于对象实体的数据库表结构快速生成与维护的解决方案
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/others.html#link-check

      - title: 优雅的对象关系
        icon: box-archive
        details: 完美的将dsl和对象关系结合做到点点点即可实现数据库的数据库查询操作
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/hint.html

      - title: 任意sql片段
        icon: bell
        details: 支持在dsl中穿插任意sql片段来保证各种个性化sql的实现
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/alert.html

      - title: 基于POJO
        icon: table-columns
        details: 框架基于POJO实现与数据库之间的访问,可以保证与市面上大部分ORM兼容一套对象代码
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/content/tabs.html

      - title: 零依赖
        icon: code
        details: 框架本身基于java8和org.jetbrains.annotations(编译时)真正做到了零依赖,完全基于jdbc的高性能开发orm完全自主可控
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/code/code-tabs.html

      - title: 一套dsl
        icon: align-center
        details: 使用优雅的dsl将多个数据库方案进行高度抽象为'类'java方法,用户只需要一套代码便可在多个数据库之间运行
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/hint.html

      - title: 低学习成本
        icon: code
        details: 实现'类'stream api将操作数据库转换成操作java集合的方法来实现数据库的操作
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/attrs.html

      - title: 原生分库分表
        icon: superscript
        details: 无需引入和部署任意中间件和引入任意jar包即可实现高性能分库分表和任意自定义分库分表
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/sup-sub.html

      - title: 结构化对象拉取
        icon: quote-left
        details: 实现按数据库对象的映射关系快速创建dto并且拉取结构化数据
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/content/footnote.html

      - title: 无感apt
        icon: highlighter
        details: 使用插件快速生成apt所需的类来实现idea下的无感apt,无需build||compile即可马上使用apt类
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/mark.html

      - title: 快速lambda入参
        icon: eraser
        details: 基于插件快速实现lambda入参参数并且可以以最快速度实现dsl的编写
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/stylize/spoiler.html

      - title: group感知
        icon: square-check
        details: java下唯一一款支持group感知的orm能够做到数据在编写dsl的时候由扁平转向结构化的变化
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/grammar/tasklist.html

      - title: 丰富的api
        icon: image
        details: 提供了常用的返回集合、返回单个对象、返回分页并且提供动态条件、动态排序等一些列功能
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/grammar/image.html

      - title: 计算属性
        icon: puzzle-piece
        details: 提供了强大的内存计算属性和数据库计算属性,其中数据库计算属性还支持dsl内的筛选、排序和返回
        # link: https://theme-hope.vuejs.press/zh/guide/component/grammar.html

      - title: 无限的扩展性
        icon: puzzle-piece
        details: eq框架是一个基于多例的由ioc容器提供服务隔离的框架,内部所有服务都可以被用户自行替换,并且用户还可以自行注入任意服务来达到和eq的配合
        # link: https://theme-hope.vuejs.press/zh/guide/component/built-in.html

      - title: DTO、VO直接返回
        icon: chart-simple
        details: 直接由数据库结果集映射到DTO、VO支持显式或者隐式赋值达到数据拉取的目的完全不需要map-struct之类的框架辅助entity到dto、vo
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/chart/chartjs.html

      - title: 企业级数据库列加密
        icon: route
        details: 支持企业级数据库列加密和解密,让脱库后的数据安全性提升，并且支持高性能的数据库加密列的like检索
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/chart/flowchart.html

      - title: 乐观锁
        icon: chart-pie
        details: 原生支持乐观锁来实现数据库的数据并发安全性保证业务逻辑的准确性
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/chart/mermaid.html

      - title: 数据追踪
        icon: diagram-project
        details: 基于aop实现数据库的数据在查询的时候进行数据库变更的追踪来实现最小颗粒的update生成
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/chart/plantuml.html

      - title: 逻辑删除
        icon: square-root-variable
        details: 原生支持逻辑删除和个性化逻辑删除支持记录删除时间删除人和删除原因等一些列自定义功能
        # link: https://theme-hope.vuejs.press/zh/guide/markdown/grammar/math.html


  # - header: 特性
  #   # description: 完整无障碍支持的可定制外观
  #   image: https://jowayyoung.github.io/static/bruce/feature.svg
  #   bgImage: /images/bg/9-light.svg
  #   bgImageDark: /images/bg/9-dark.svg
  #   highlights:
  #     - title: 📦 开箱即用
  #       # icon: circle-half-stroke
  #       details: 默认适配了springboot和solon等相关starter引入设置相关数据库类型即可
  #       link: https://theme-hope.vuejs.press/zh/guide/interface/darkmode.html

  #     - title: 🛡️ 强类型
  #       # icon: palette
  #       details: 使用强类型dsl满足开发业务阶段保证类型安全问题和智能提示
  #       link: https://theme-hope.vuejs.press/zh/guide/interface/theme-color.html

  #     - title: 🔥 弱类型
  #       # icon: ellipsis
  #       details: 为业务动态性提供无限可能性支持用户自定义低代码相关平台
  #       link: https://theme-hope.vuejs.press/zh/guide/interface/others.html



  - header: 结构化DTO
    # description: 一个完美的响应式布局。
    image: https://jowayyoung.github.io/static/bruce/install.svg
    bgImage: /easy-query-doc/images/bg/5-light.svg
    bgImageDark: /easy-query-doc/images/bg/5-dark.svg
    highlights:
      - title: 创建DTO
        icon: window-maximize
        details: 使用插件在指定包上右键"Create Struct DTO",选择起始实体,勾选需要返回的结构类型
        link: https://theme-hope.vuejs.press/zh/guide/layout/navbar.html

      - title: 查询
        icon: fas fa-window-maximize fa-rotate-270
        details: 使用<b>selectAutoInclude(DTO.class)</b>对其进行查询
        link: https://theme-hope.vuejs.press/zh/guide/layout/sidebar.html

  # - header: 博客
  #   description: 通过主题创建个人博客
  #   image: /assets/image/blog.svg
  #   bgImage: /images/bg/5-light.svg
  #   bgImageDark: /images/bg/5-dark.svg
  #   highlights:
  #     - title: 博客功能
  #       icon: blog
  #       details: 通过文章的日期、标签和分类展示文章
  #       link: https://theme-hope.vuejs.press/zh/guide/blog/intro.html

  #     - title: 博客主页
  #       icon: house
  #       details: 全新博客主页
  #       link: https://theme-hope.vuejs.press/zh/guide/blog/home.html

  #     - title: 博主信息
  #       icon: circle-info
  #       details: 自定义名称、头像、座右铭和社交媒体链接
  #       link: https://theme-hope.vuejs.press/zh/guide/blog/blogger.html

  #     - title: 时间线
  #       icon: clock
  #       details: 在时间线中浏览和通读博文
  #       link: https://theme-hope.vuejs.press/zh/guide/blog/timeline.html

  - header: 计算属性
    description: 一种特殊的属性列与常规的表的列不同他是一种通过表的列或者更加复杂的函数得出的属性
    image: /assets/image/advanced.svg
    bgImage: /easy-query-doc/images/bg/4-light.svg
    bgImageDark: /easy-query-doc/images/bg/4-dark.svg
    highlights:
      - title: json计算属性
        icon: dumbbell
        details: 将对象映射到数据库列使用json的方式
        # link: https://theme-hope.vuejs.press/zh/guide/advanced/seo.html

      - title: 枚举计算属性
        icon: sitemap
        details: 将枚举映射到数据库列,在java使用时通过枚举自带的提示可以清晰的了解值与其含义
        # link: https://theme-hope.vuejs.press/zh/guide/advanced/sitemap.html

      - title: 列计算属性
        icon: rss
        details: 通过数据库函数让列进行特殊处理,比如存储到数据库使用数据库的base64 encode,取出来后也是数据库的base64 decode
        # link: https://theme-hope.vuejs.press/zh/guide/advanced/feed.html

      - title: 无列计算属性
        icon: mobile-screen
        details: 数据库中并不存在当前列,比如age是通过当前时间和birthday计算出来的一种属性,并且可用于筛选、排序和返回
        # link: https://theme-hope.vuejs.press/zh/guide/advanced/pwa.html


      - title: 跨表计算属性
        icon: circle-info
        details: 当前属性是通过跨多张表组合得到的值,比如班级表在不冗余班级人数的情况下可以通过子查询来实现人数
        # link: https://theme-hope.vuejs.press/zh/guide/advanced/pwa.html

  - header: 联系我们
    # description: 通过主题创建个人博客
    image: /assets/image/blog.svg
    bgImage: /easy-query-doc/images/bg/5-light.svg
    bgImageDark: /easy-query-doc/images/bg/5-dark.svg
    highlights:
      - title: 博客功能
        icon: blog
        details: 通过文章的日期、标签和分类展示文章
        # link: https://theme-hope.vuejs.press/zh/guide/blog/intro.html

      - title: 博客主页
        icon: house
        details: 全新博客主页
        # link: https://theme-hope.vuejs.press/zh/guide/blog/home.html

      - title: 博主信息
        icon: circle-info
        details: 自定义名称、头像、座右铭和社交媒体链接
        # link: https://theme-hope.vuejs.press/zh/guide/blog/blogger.html

      - title: 时间线
        icon: clock
        details: 在时间线中浏览和通读博文
        # link: https://theme-hope.vuejs.press/zh/guide/blog/timeline.html

copyright: false
footer: Apache 2.0 协议, 版权所有 © 2022-至今 xuejmnet
---
<!-- 

这是项目主页的案例。你可以在这里放置你的主体内容。

想要使用此布局，你需要在页面 front matter 中设置 `home: true`。

配置项的相关说明详见 [项目主页配置](https://theme-hope.vuejs.press/zh/guide/layout/home/)。 -->
