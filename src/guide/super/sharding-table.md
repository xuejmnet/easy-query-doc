---
title: 分表
order: 10
---

`easy-query`提供了高效,高性能的分片机制,不同于`sharding-jdbc`的sql的`antlr`解析采用自带的表达式解析性能高效,并且不同于`ShardingSphere-Proxy`的代理模式,导致未分片的对象也需要走代理,并且需要多次jdbc,`easy-query`采用客户端分片保证单次

