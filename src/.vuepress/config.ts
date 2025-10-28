import { defineUserConfig } from "vuepress";
import vuepressPluginTypedjs2 from "vuepress-plugin-typedjs2";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/easy-query-doc/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "文档演示",
      description: "easy-query的文档演示",
    },
    "/en/": {
      lang: "en-US",
      title: "Documentation",
      description: "Documentation for easy-query",
    },
  },

  // 减少并发构建数量，降低内存使用
  shouldPrefetch: false,

  theme,
  plugins:[
    vuepressPluginTypedjs2({
      // 路径白名单（默认是所有页面生效，如果配置了白名单，那么只有白名单页面才会生效，支持*通配符）
      withePathList: ['*'],
      // 对应的标签选择器
      selector: '.vuepress_typed',
      // 打字内容
      strings: ['<b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">asc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>'
        ,'<b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">best</span>().<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(<span class="color-lambda">orm</span> -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">asc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>'
      ,' <b><span class="color-clazz">List</span>&lt;<span class="color-clazz">ORM</span>&gt; orm = <span class="color-var">eq</span>.<span class="color-method">queryable</span>(<span class="color-clazz">ORM</span>.<span class="color-key">class</span>)</br><span class="margin-right-home"></span>.<span class="color-method">leftJoin</span>(<span class="color-clazz">BEST</span>.<span class="color-key">class</span>, (<span class="color-lambda">orm</span>, <span class="color-lambda">best</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">id</span>().<span class="color-method">eq</span>(<span class="color-lambda">best</span>.<span class="color-method">id</span>()))</br><span class="margin-right-home"></span>.<span class="color-method">where</span>(( <span class="color-lambda">orm</span>, <span class="color-lambda">best</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">name</span>().<span class="color-method">like</span>(<span class="color-const">"easy-query"</span>))</br><span class="margin-right-home"></span>.<span class="color-method">orderBy</span>(( <span class="color-lambda">orm</span>, <span class="color-lambda">conf</span>) -> <span class="color-lambda">orm</span>.<span class="color-method">time</span>().<span class="color-method">desc</span>())</br><span class="margin-right-home"></span>.<span class="color-method">toList</span>()</b>'],
      typeSpeed: 20, // 打字速度
      backSpeed: 0, // 回退速度
      loop: true, // 循环
    }),
    // docsearchPlugin({
    //   appId: "CPA56QJD7T",
    //   apiKey: "5b2c36f4caaaee20e10ec50f0e048d46",
    //   indexName: "easy-query",
    //   locales: {
    //     '/zh/': {
    //       placeholder: '搜索文档',
    //       translations: {
    //         button: {
    //           buttonText: '搜索文档',
    //         },
    //       },
    //     },
    //   },
    // }),
  ]
  // Enable it with pwa
  // shouldPrefetch: false,
});
