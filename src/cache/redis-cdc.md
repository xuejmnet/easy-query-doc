---
title: redis缓存cdc一致性
order: 50
---

# redis缓存cdc一致性
借助redis的缓存能力加cdc的及时数据变更通知来实现缓存对象的一致性保证。

## 技术要求
- 1.需要有redis也可以换成别的缓存
- 2.数据库需要开启cdc相关技术(譬如:binlog订阅)
