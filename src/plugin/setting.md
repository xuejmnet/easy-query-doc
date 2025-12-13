---
title: 配置文件
order: 5
category:
  - plugin
---

# 配置文件
默认插件会读取当前项目下的根目录文件`easy-query.setting`,通过插件配置和文件保存可以将配置项保存到文件内，这样在多个用户之间既可以使用当前项目的配置


配置内容如下
```text
# EasyQuery 默认项目配置文件
# 在此处添加您的自定义配置
# 可配置的内容请参见 https://github.com/xuejmnet/easy-query-plugin
# 配置语法参见 https://doc.hutool.cn/pages/setting/example

# DTO是否保留Column注解 true/false
## DTO是否保留 @Column 注解, 当字段映射为 属性优先/属性唯一 的时候可以不用保留 @Column 注解
dto.keepAnnoColumn=true

# 启动项配置

## 启动时是否检查扫描问题
startup.runInspection=true

# 具体参考 com.alibaba.druid.util.FnvHash.DbType  如果是generic那么还是原先的格式化 如果不是generic且未匹配到则使用DbType.other
sql.format=postgresql,mysql,sqlserver,oracle,h2,sqlite

# lambda快速提示
lambda.tip=

# dto配置忽略json
dto.columns.ignores=



# 数据库生成配置文件
sql.generate = 
```