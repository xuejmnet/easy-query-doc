---
title: 结构化DTO提示
order: 40
category:
  - plugin
---


# 结构化DTO提示
有时候我们DTO不是通过结构化DTO快速创建，可能是通过手动构建的那么我们是否可以快速提示对应的DTO信息呢

## 第一步创建DTO
```java
/**
 * create time 2025/10/26 10:56
 * 文件说明
 *
 * @author xuejiaming
 */
public class UserTestDTO {
}

```

## 第二步添加连接
添加`{@link com.eq.samples.domain.SysUser}`在dto注释最上方
```java

/**
 * create time 2025/10/26 10:56
 * 文件说明
 * {@link com.eq.samples.domain.SysUser}
 *
 * @author xuejiaming
 */
public class UserTestDTO {
}

```

## 智能提示输入eq

<img :src="$withBase('/images/dto-plugin-tip.jpg')">


## 功能解释
我们通过上面的智能提示能够看到eq的提示主要有三种
- 1.eq字段 就是普通的拷贝字段和字段相关注释到当前dto
- 2.eq字段InternalClass 就是拷贝导航属性生成内部类到当前dto
- 3.eq_extra_auto_include_configure 就是对当前dto的当前节点层进行额外的操作比如筛选或者select额外字段