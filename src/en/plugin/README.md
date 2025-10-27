---
title: Plugin Assistant
category:
  - plugin
---
As the saying goes, "A good craftsman needs good tools." A master martial artist can fight without weapons, but with the right weapon, their effectiveness multiplies. `EasyQueryAssistant` is like Sun Wukong's Golden Cudgel - you can live without it, but you can't really live without it. A good assistant plugin can help us save a lot of time on repetitive tasks.

## Authors
This plugin is developed by me and another open-source enthusiast [link2fun](https://github.com/link2fun)

Plugin source code address: https://github.com/xuejmnet/easy-query-plugin


## Feature Introduction
- No need to build the project (automatic sensing), refresh maven, gradle, use the plugin to directly generate proxy classes and add interfaces
- SQL log batch generation without placeholders can be directly run
- Generate corresponding entities according to tables (custom template export and import)
- Prompt table alias when querying
- Prompt more intuitive relational operators when querying
- DTO construction shows clearer relationship tree structure
- Graphically construct Navigate relationships
- Quick prompts for entity properties in DTO classes
- Modified DTO file content
- MyBatis-Plus to easy-query annotation conversion


::: danger Note!!!
> Strongly not recommended to use `@EntityFileProxy`, recommended to use `@EntityProxy`
> Strongly not recommended to use `@EntityFileProxy`, recommended to use `@EntityProxy`
> Strongly not recommended to use `@EntityFileProxy`, recommended to use `@EntityProxy`
:::

Supported idea versions


::: tip Note!!!
> IntelliJ IDEA Ultimate
> Plugin 0.0.95<= supports idea 2022.2.5+
> Plugin 0.0.96+ supports idea 2023.1.7+
:::


Idea community edition
Can enter qq group files to download or contact the group owner

Unsupported versions can contact the group owner by joining the qq group if support is needed


Because the plugin internally comes with the `com.intellij.database` package, the community version of idea cannot install it. If you don't need the code generation tool, you can join the group and contact the group owner to compile a version without that plugin


::: warning Note!!!
> If you are not using the flagship version of idea, you may not be able to use the current plugin. You can join the group to contact the author, and I will compile a community version-supported plugin for you
:::


## Version Upgrade
If you use `@EntityProxy`, you only need to upgrade the corresponding framework version and plugin version and then re-clean. If you use `@EntityFileProxy`, after upgrading the framework and plugin version, you need to re-call the plugin's `AutoCompile` to regenerate the generated proxy files



## link
`{@link entity}` Adding `@link` to the dto or vo header can allow the plugin to connect to the corresponding entity and then detect whether there are missing fields and other related information

::: warning Note!!!
> Note that `{@link entity}` needs to be written at the very beginning of the comment header, do not add other `@` before it
:::


Correct ✅
```java
/**
 * {@link entity}
 * @author xxx
 */
```
Incorrect ❌
```java
/**
 * @author xxx
 * {@link entity}
 */
```
