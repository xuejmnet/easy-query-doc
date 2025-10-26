---
title: Performance Related Chapters
---
# Performance Related Chapters
This chapter describes how `eq` balances performance and maintainability when writing implicit query expressions. `eq`'s explicit ORM does not need to consider performance and maintainability because it is very similar to SQL expressions, and SQL itself is difficult to maintain and read under complex SQL scenarios.

You can't have both fish (performance) and bear's paw (maintainability) is unavoidable for most ORMs, but `eq` achieves dual guarantees of maintainability and performance, allowing users to dynamically generate SQL while keeping performance in the best state. `eq` will absolutely not become a bottleneck of the entire system.

- Implicit join performance optimization
- Implicit subquery performance optimization
- Property + filter improves readability and maintainability
- Deep pagination uses reverse sorting to improve pagination query performance
