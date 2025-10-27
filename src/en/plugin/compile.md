---
title: Compile Generate APT Files
order: 20
category:
  - plugin
---


# Auto Compile APT
In regular projects, the framework cannot sense and process APT annotations. They need to be compiled to generate corresponding files. So if a class has already been compiled to generate the corresponding proxy object, and you modify the properties in this class, the framework cannot sense and generate the corresponding proxy object in real-time.

For example, if `private String name;` is changed to `private String name1;` by the user, the plugin will compile the corresponding `name1` into the `proxy` class in real-time. Of course, if you don't have the plugin installed, you can recompile the project, but when the project becomes large, recompiling each time will bring very long waiting times.

The plugin also thoughtfully prepares two shortcuts: `CompileCurrentFile` and `AutoCompile`.

## CompileCurrentFile
Immediately compile the current class as long as the class has the `@EntityProxy` annotation.


## CompileAll
Immediately compile all classes in the current project as long as the classes have the `@EntityProxy` annotation.

## Usage

Call up the get set shortcut in the corresponding class to see the corresponding operations.
<img  :src="$withBase('/images/plugin-compile.jpg')">

## Summary
Sometimes the plugin or framework will not 100% correctly generate Proxy. Sometimes due to some errors, the latest proxy object is not compiled and generated in time. So eq provides `CompileCurrentFile` to compile only the current file, preventing the long-time blocking compilation generation brought by `AutoCompile`.

