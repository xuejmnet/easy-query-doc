---
title: 插件助手
category:
  - plugin
---
俗话说工欲善其事必先利其器,一个好的武林高手可以没有趁手的兵器但是如果有那么将是事半功倍的,`EasyQueryAssistant`就像孙悟空的金箍棒,可以没有但是又不能没有，一款好用的助手插件可以帮助我们节省大量的时间去编写处理重复性劳动

## 作者
本插件作者有我和另一位开源爱好者提供[link2fun]()


## 功能介绍
- 无需构建项目(自动感知)，刷新maven、gradle，使用插件可以直接生成代理类并添加接口
- sql日志批量生成无占位可直接运行的sql
- 根据表生成对应的实体（自定义模板导出导入）
- 查询时提示表别名
- 查询时提示更直观的关系运算符
- dto构建展示更加清晰的关系树结构
- 图形化构建Navigate关系
- dto类对于entity的属性快速提示
- 修改的dto文件内容
- mybatis-plus转easy-query注解


::: tip 说明!!!
> 及其不推荐用户使用`@EntityFileProxy`推荐使用`@EntityProxy`
> 及其不推荐用户使用`@EntityFileProxy`推荐使用`@EntityProxy`
> 及其不推荐用户使用`@EntityFileProxy`推荐使用`@EntityProxy`
:::

支持的idea版本


::: tip 说明!!!
> IntelliJ IDEA Ultimate
> 插件0.0.95<=支持idea 2022.2.5+
> 插件0.0.96+支持idea 2023.1.7+
:::


idea 社区版
可以进入qq群文件下载或者联系群主即可


不支持的版本如果需要支持可以加qq群联系群主


因为插件内部附带`com.intellij.database`这个包所以社区版本的idea无法安装,如果不需要代码生成工具那么可以进群和联系群主会编译去除该插件的版本


::: warning 说明!!!
> 如果您非旗舰版idea可能无法使用当前插件您可以进群联系作者,我会给您编译一个社区版本支持的插件
:::


## 版本升级
如果你是`@EntityProxy`那么只需要升级对应的框架版本和插件版本然后重新clean即可,如果你是`@EntityFileProxy`那么升级完框架和插件版本后需要重新调用插件的`AutoCompile`让生成的代理文件重新生成一遍



## link
`{@link entity}`dto或者vo头部添加`@link`可以让插件连接到对应的实体然后检测是否存在漏写字段等相关信息

::: warning 说明!!!
> 注意`{@link entity}`需要写到注释头最前面在这个前面不要加其他`@`
:::


正确的✅
```java
/**
 * {@link entity}
 * @author xxx
 */
```
错误的❌
```java
/**
 * @author xxx
 * {@link entity}
 */
```