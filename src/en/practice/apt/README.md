---
title: Annotation Processor
---

Java APT (Annotation Processing Tool) is a technology used to process annotations at compile time. It allows developers to scan and process annotations during Java code compilation, and generate new source code, auxiliary files, or other types of output.

Here we simply use compile-time annotations to complete the proxy functionality.

Why use APT technology instead of dynamic proxies? Because APT technology can perfectly generate src code after project build, just like the source code. The performance is the same as the native implementation and is used to handle repetitive labor.

