// src/.vuepress/config.ts
import { defineUserConfig } from "vuepress";
import { searchProPlugin } from "vuepress-plugin-search-pro";

// src/.vuepress/theme.ts
import { hopeTheme } from "vuepress-theme-hope";

// src/.vuepress/navbar/en.ts
import { navbar } from "vuepress-theme-hope";
var enNavbar = navbar([
  "/",
  { text: "Demo", icon: "discover", link: "/demo/" },
  {
    text: "Guide",
    icon: "creative",
    prefix: "/guide/",
    children: [
      {
        text: "Bar",
        icon: "creative",
        prefix: "bar/",
        children: ["baz", { text: "...", icon: "more", link: "" }]
      },
      {
        text: "Foo",
        icon: "config",
        prefix: "foo/",
        children: ["ray", { text: "...", icon: "more", link: "" }]
      }
    ]
  },
  {
    text: "V2 Docs",
    icon: "note",
    link: "https://theme-hope.vuejs.press/"
  }
]);

// src/.vuepress/navbar/zh.ts
import { navbar as navbar2 } from "vuepress-theme-hope";
var zhNavbar = navbar2([
  "/",
  // { text: "案例", icon: "discover", link: "/demo/" },
  {
    text: "\u66F4\u65B0\u65E5\u5FD7",
    icon: "creative",
    link: "/upgrade"
    // children: [
    //   {
    //     text: "基础操作",
    //     icon: "creative",
    //     prefix: "basic/",
    //     children: ["insert","update","delete", { text: "...", icon: "more", link: "" }],
    //   },
    //   {
    //     text: "查询",
    //     icon: "creative",
    //     prefix: "query/",
    //     children: ["query","paging", { text: "...", icon: "more", link: "" }],
    //   }
    // ],
  },
  {
    text: "\u9879\u76EE\u5730\u5740",
    icon: "github",
    children: [
      {
        text: "github",
        icon: "github",
        link: "https://github.com/xuejmnet/easy-query"
      },
      {
        text: "gitee",
        icon: "gitee",
        link: "https://gitee.com/xuejm/easy-query"
      }
    ]
  }
  // {
  //   text: "V2 文档",
  //   icon: "note",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);

// src/.vuepress/sidebar/en.ts
import { sidebar } from "vuepress-theme-hope";
var enSidebar = sidebar({
  "/en": [
    "",
    {
      icon: "discover",
      text: "Demo",
      prefix: "demo/",
      link: "demo/",
      children: "structure"
    },
    {
      text: "Docs",
      icon: "note",
      prefix: "guide/",
      children: "structure"
    },
    "slides"
  ]
});

// src/.vuepress/sidebar/zh.ts
import { sidebar as sidebar2 } from "vuepress-theme-hope";
var zhSidebar = sidebar2({
  "/": [
    "",
    "quick-preview",
    "question",
    {
      text: "\u8D77\u6B65",
      prefix: "startup/",
      children: ["readme", "quick-start", "complex-query"]
    },
    {
      text: "\u914D\u7F6E",
      prefix: "config/",
      children: ["readme.md", "dependency-injection", "config-java", "config-kotlin", "config-solon", "config-spring-boot", "config-option", "annotation", "replace-configure", "logging", "api-mode", "kapt", "muti-datasource", "easy-trans", "plugin"]
    },
    {
      text: "\u57FA\u7840\u64CD\u4F5C",
      prefix: "basic/",
      children: ["readme.md", "api-use", "performance-desc", "performance", "quick-preview", "insert", "update", "delete", "insertOrUpdate", "transaction"]
    },
    {
      text: "\u67E5\u8BE2",
      prefix: "query/",
      children: ["readme.md", "basic-type", "anonymous-type", "or-condition", "paging", "multi-query", "group", "partition", "order", "select", "native-sql", "dynamic-table", "stream-query", "to-map", "select-column", "union", "select-sub", "where-sub", "relation", "relation-filter", "fill", "where", "reuse", "case-when", "dynamic-where", "dynamic-sort"]
    },
    {
      text: "\u8BA1\u7B97\u5C5E\u6027",
      prefix: "prop/",
      children: ["readme.md", "json-prop", "collection-prop", "enum-prop", "sql-column-prop", "status-prop", "combine-prop", "aggregate-prop", "sql-column-generate-prop"]
    },
    {
      text: "\u9AD8\u7EA7",
      prefix: "adv/",
      children: ["readme.md", "logic-delete", "auto-key", "interceptor", "batch", "sql-func-v1", "sql-func", "column-encryption", "column-sql-func-auto", "data-tracking", "version", "column-func-new", "column-func", "value-object", "jdbc-listener", "type-handler"]
    },
    {
      text: "\u8D85\u7EA7",
      prefix: "super/",
      children: [
        "readme.md",
        "sharding-table.md",
        "sharding-datasource.md",
        "sharding-all.md",
        "default-route-rule",
        "default-route-initializer",
        "sharding-mod.md",
        "sharding-time.md",
        "sharding-all-time.md",
        "sharding-multi.md",
        "sharding-sequence.md"
      ]
    },
    {
      text: "\u5B9E\u6218",
      icon: "note",
      prefix: "practice/",
      children: [
        {
          text: "\u57FA\u7840\u914D\u7F6E",
          prefix: "configuration/",
          collapsible: true,
          children: ["readme.md", "entity.md", "exception.md"]
        },
        {
          text: "\u6CE8\u89E3\u5904\u7406\u5668",
          prefix: "apt/",
          collapsible: true,
          children: ["readme.md", "compile-repo.md"]
        }
      ]
    },
    "support"
  ]
});

// src/.vuepress/theme.ts
var theme_default = hopeTheme({
  hostname: "https://vuepress-theme-hope-docs-demo.netlify.app",
  author: {
    name: "xuejmnet",
    url: "https://github.com/xuejmnet"
  },
  favicon: "/favicon.ico",
  iconAssets: "iconfont",
  logo: "/logo.svg",
  // repo: "https://github.com/xuejmnet/easy-query",
  docsDir: "demo/theme-docs/src",
  // themeColor:true,
  // outlookLocales:{},
  locales: {
    "/": {
      // navbar
      navbar: zhNavbar,
      // sidebar
      sidebar: zhSidebar,
      footer: "Default footer",
      displayFooter: true,
      metaLocales: {
        editLink: "Edit this page on GitHub"
      }
    },
    /**
     * Chinese locale config
     */
    "/en/": {
      // navbar
      navbar: enNavbar,
      // sidebar
      sidebar: enSidebar,
      footer: "\u9ED8\u8BA4\u9875\u811A",
      displayFooter: true,
      // page meta
      metaLocales: {
        editLink: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875"
      }
    }
  },
  encrypt: {
    config: {
      "/demo/encrypt.html": ["1234"],
      "/zh/demo/encrypt.html": ["1234"]
    }
  },
  plugins: {
    // comment: {
    //   // @ts-expect-error: You should generate and use your own comment service
    //   provider: "Waline",
    // },
    // all features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      demo: true,
      echarts: true,
      figure: true,
      flowchart: true,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ["ts", "vue"]
      },
      presentation: ["highlight", "math", "search", "notes", "zoom"],
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended"
              };
          }
        }
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: true
    }
    // uncomment these if you want a pwa
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cachePic: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  }
});

// src/.vuepress/config.ts
var config_default = defineUserConfig({
  base: "/easy-query-doc/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "\u6587\u6863\u6F14\u793A",
      description: "vuepress-theme-hope \u7684\u6587\u6863\u6F14\u793A"
    }
    // "/en/": {
    //   lang: "en-US",
    //   title: "Docs Demo",
    //   description: "A docs demo for vuepress-theme-hope",
    // },
  },
  theme: theme_default,
  pagePatterns: [
    "**/*.md",
    "!**/*.snippet.md",
    "!.vuepress",
    "!node_modules"
  ],
  plugins: [
    searchProPlugin({
      // 索引全部内容
      indexContent: true
      // 为分类和标签添加索引
      // customFields: [
      //   {
      //     getter: (page) => page.frontmatter.category,
      //     formatter: "分类：$content",
      //   },
      //   {
      //     getter: (page) => page.frontmatter.tag,
      //     formatter: "标签：$content",
      //   },
      // ],
    })
  ]
  // Enable it with pwa
  // shouldPrefetch: false,
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjLy52dWVwcmVzcy9jb25maWcudHMiLCAic3JjLy52dWVwcmVzcy90aGVtZS50cyIsICJzcmMvLnZ1ZXByZXNzL25hdmJhci9lbi50cyIsICJzcmMvLnZ1ZXByZXNzL25hdmJhci96aC50cyIsICJzcmMvLnZ1ZXByZXNzL3NpZGViYXIvZW4udHMiLCAic3JjLy52dWVwcmVzcy9zaWRlYmFyL3poLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3h1ZWppYW1pbmcvRGVza3RvcC9naXRodWJzL2Vhc3ktcXVlcnktZG9jL3NyYy8udnVlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL2NvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVVc2VyQ29uZmlnIH0gZnJvbSBcInZ1ZXByZXNzXCI7XG5pbXBvcnQgeyBzZWFyY2hQcm9QbHVnaW4gfSBmcm9tIFwidnVlcHJlc3MtcGx1Z2luLXNlYXJjaC1wcm9cIjtcbmltcG9ydCB0aGVtZSBmcm9tIFwiLi90aGVtZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVVc2VyQ29uZmlnKHtcbiAgYmFzZTogXCIvZWFzeS1xdWVyeS1kb2MvXCIsXG4gXG4gIGxvY2FsZXM6IHtcbiAgICBcIi9cIjoge1xuICAgICAgbGFuZzogXCJ6aC1DTlwiLFxuICAgICAgdGl0bGU6IFwiXHU2NTg3XHU2ODYzXHU2RjE0XHU3OTNBXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJ2dWVwcmVzcy10aGVtZS1ob3BlIFx1NzY4NFx1NjU4N1x1Njg2M1x1NkYxNFx1NzkzQVwiLFxuICAgIH0sXG4gICAgLy8gXCIvZW4vXCI6IHtcbiAgICAvLyAgIGxhbmc6IFwiZW4tVVNcIixcbiAgICAvLyAgIHRpdGxlOiBcIkRvY3MgRGVtb1wiLFxuICAgIC8vICAgZGVzY3JpcHRpb246IFwiQSBkb2NzIGRlbW8gZm9yIHZ1ZXByZXNzLXRoZW1lLWhvcGVcIixcbiAgICAvLyB9LFxuICB9LFxuXG4gIHRoZW1lLFxuICBwYWdlUGF0dGVybnM6IFtcbiAgICAgIFwiKiovKi5tZFwiLFxuICAgICAgXCIhKiovKi5zbmlwcGV0Lm1kXCIsXG4gICAgICBcIiEudnVlcHJlc3NcIixcbiAgICAgIFwiIW5vZGVfbW9kdWxlc1wiLFxuICBdLFxuICBwbHVnaW5zOltcbiAgICBzZWFyY2hQcm9QbHVnaW4oe1xuICAgICAgLy8gXHU3RDIyXHU1RjE1XHU1MTY4XHU5MEU4XHU1MTg1XHU1QkI5XG4gICAgICBpbmRleENvbnRlbnQ6IHRydWUsXG4gICAgICAvLyBcdTRFM0FcdTUyMDZcdTdDN0JcdTU0OENcdTY4MDdcdTdCN0VcdTZERkJcdTUyQTBcdTdEMjJcdTVGMTVcbiAgICAgIC8vIGN1c3RvbUZpZWxkczogW1xuICAgICAgLy8gICB7XG4gICAgICAvLyAgICAgZ2V0dGVyOiAocGFnZSkgPT4gcGFnZS5mcm9udG1hdHRlci5jYXRlZ29yeSxcbiAgICAgIC8vICAgICBmb3JtYXR0ZXI6IFwiXHU1MjA2XHU3QzdCXHVGRjFBJGNvbnRlbnRcIixcbiAgICAgIC8vICAgfSxcbiAgICAgIC8vICAge1xuICAgICAgLy8gICAgIGdldHRlcjogKHBhZ2UpID0+IHBhZ2UuZnJvbnRtYXR0ZXIudGFnLFxuICAgICAgLy8gICAgIGZvcm1hdHRlcjogXCJcdTY4MDdcdTdCN0VcdUZGMUEkY29udGVudFwiLFxuICAgICAgLy8gICB9LFxuICAgICAgLy8gXSxcbiAgICB9KSxcbiAgXVxuICAvLyBFbmFibGUgaXQgd2l0aCBwd2FcbiAgLy8gc2hvdWxkUHJlZmV0Y2g6IGZhbHNlLFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy90aGVtZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy90aGVtZS50c1wiO2ltcG9ydCB7IGhvcGVUaGVtZSB9IGZyb20gXCJ2dWVwcmVzcy10aGVtZS1ob3BlXCI7XG5pbXBvcnQgeyBlbk5hdmJhciwgemhOYXZiYXIgfSBmcm9tIFwiLi9uYXZiYXIvaW5kZXguanNcIjtcbmltcG9ydCB7IGVuU2lkZWJhciwgemhTaWRlYmFyIH0gZnJvbSBcIi4vc2lkZWJhci9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBob3BlVGhlbWUoe1xuICBob3N0bmFtZTogXCJodHRwczovL3Z1ZXByZXNzLXRoZW1lLWhvcGUtZG9jcy1kZW1vLm5ldGxpZnkuYXBwXCIsXG4gIGF1dGhvcjoge1xuICAgIG5hbWU6IFwieHVlam1uZXRcIixcbiAgICB1cmw6IFwiaHR0cHM6Ly9naXRodWIuY29tL3h1ZWptbmV0XCIsXG4gIH0sXG4gIGZhdmljb246XCIvZmF2aWNvbi5pY29cIixcbiAgaWNvbkFzc2V0czogXCJpY29uZm9udFwiLFxuXG4gIGxvZ286IFwiL2xvZ28uc3ZnXCIsXG5cbiAgLy8gcmVwbzogXCJodHRwczovL2dpdGh1Yi5jb20veHVlam1uZXQvZWFzeS1xdWVyeVwiLFxuXG4gIGRvY3NEaXI6IFwiZGVtby90aGVtZS1kb2NzL3NyY1wiLFxuICAvLyB0aGVtZUNvbG9yOnRydWUsXG4gIC8vIG91dGxvb2tMb2NhbGVzOnt9LFxuXG4gIGxvY2FsZXM6IHtcbiAgICBcIi9cIjoge1xuICAgICAgLy8gbmF2YmFyXG4gICAgICBuYXZiYXI6IHpoTmF2YmFyLFxuXG4gICAgICAvLyBzaWRlYmFyXG4gICAgICBzaWRlYmFyOiB6aFNpZGViYXIsXG5cbiAgICAgIGZvb3RlcjogXCJEZWZhdWx0IGZvb3RlclwiLFxuXG4gICAgICBkaXNwbGF5Rm9vdGVyOiB0cnVlLFxuXG4gICAgICBtZXRhTG9jYWxlczoge1xuICAgICAgICBlZGl0TGluazogXCJFZGl0IHRoaXMgcGFnZSBvbiBHaXRIdWJcIixcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoaW5lc2UgbG9jYWxlIGNvbmZpZ1xuICAgICAqL1xuICAgIFwiL2VuL1wiOiB7XG4gICAgICAvLyBuYXZiYXJcbiAgICAgIG5hdmJhcjogZW5OYXZiYXIsXG5cbiAgICAgIC8vIHNpZGViYXJcbiAgICAgIHNpZGViYXI6IGVuU2lkZWJhcixcblxuICAgICAgZm9vdGVyOiBcIlx1OUVEOFx1OEJBNFx1OTg3NVx1ODExQVwiLFxuXG4gICAgICBkaXNwbGF5Rm9vdGVyOiB0cnVlLFxuXG4gICAgICAvLyBwYWdlIG1ldGFcbiAgICAgIG1ldGFMb2NhbGVzOiB7XG4gICAgICAgIGVkaXRMaW5rOiBcIlx1NTcyOCBHaXRIdWIgXHU0RTBBXHU3RjE2XHU4RjkxXHU2QjY0XHU5ODc1XCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgZW5jcnlwdDoge1xuICAgIGNvbmZpZzoge1xuICAgICAgXCIvZGVtby9lbmNyeXB0Lmh0bWxcIjogW1wiMTIzNFwiXSxcbiAgICAgIFwiL3poL2RlbW8vZW5jcnlwdC5odG1sXCI6IFtcIjEyMzRcIl0sXG4gICAgfSxcbiAgfSxcblxuICBwbHVnaW5zOiB7XG4gICAgLy8gY29tbWVudDoge1xuICAgIC8vICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogWW91IHNob3VsZCBnZW5lcmF0ZSBhbmQgdXNlIHlvdXIgb3duIGNvbW1lbnQgc2VydmljZVxuICAgIC8vICAgcHJvdmlkZXI6IFwiV2FsaW5lXCIsXG4gICAgLy8gfSxcblxuICAgIC8vIGFsbCBmZWF0dXJlcyBhcmUgZW5hYmxlZCBmb3IgZGVtbywgb25seSBwcmVzZXJ2ZSBmZWF0dXJlcyB5b3UgbmVlZCBoZXJlXG4gICAgbWRFbmhhbmNlOiB7XG4gICAgICBhbGlnbjogdHJ1ZSxcbiAgICAgIGF0dHJzOiB0cnVlLFxuICAgICAgY2hhcnQ6IHRydWUsXG4gICAgICBjb2RldGFiczogdHJ1ZSxcbiAgICAgIGRlbW86IHRydWUsXG4gICAgICBlY2hhcnRzOiB0cnVlLFxuICAgICAgZmlndXJlOiB0cnVlLFxuICAgICAgZmxvd2NoYXJ0OiB0cnVlLFxuICAgICAgZ2ZtOiB0cnVlLFxuICAgICAgaW1nTGF6eWxvYWQ6IHRydWUsXG4gICAgICBpbWdTaXplOiB0cnVlLFxuICAgICAgaW5jbHVkZTogdHJ1ZSxcbiAgICAgIGthdGV4OiB0cnVlLFxuICAgICAgbWFyazogdHJ1ZSxcbiAgICAgIG1lcm1haWQ6IHRydWUsXG4gICAgICBwbGF5Z3JvdW5kOiB7XG4gICAgICAgIHByZXNldHM6IFtcInRzXCIsIFwidnVlXCJdLFxuICAgICAgfSxcbiAgICAgIHByZXNlbnRhdGlvbjogW1wiaGlnaGxpZ2h0XCIsIFwibWF0aFwiLCBcInNlYXJjaFwiLCBcIm5vdGVzXCIsIFwiem9vbVwiXSxcbiAgICAgIHN0eWxpemU6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1hdGNoZXI6IFwiUmVjb21tZW5kZWRcIixcbiAgICAgICAgICByZXBsYWNlcjogKHsgdGFnIH0pID0+IHtcbiAgICAgICAgICAgIGlmICh0YWcgPT09IFwiZW1cIilcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWc6IFwiQmFkZ2VcIixcbiAgICAgICAgICAgICAgICBhdHRyczogeyB0eXBlOiBcInRpcFwiIH0sXG4gICAgICAgICAgICAgICAgY29udGVudDogXCJSZWNvbW1lbmRlZFwiLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgc3ViOiB0cnVlLFxuICAgICAgc3VwOiB0cnVlLFxuICAgICAgdGFiczogdHJ1ZSxcbiAgICAgIHZQcmU6IHRydWUsXG4gICAgICB2dWVQbGF5Z3JvdW5kOiB0cnVlLFxuICAgIH0sXG5cbiAgICAvLyB1bmNvbW1lbnQgdGhlc2UgaWYgeW91IHdhbnQgYSBwd2FcbiAgICAvLyBwd2E6IHtcbiAgICAvLyAgIGZhdmljb246IFwiL2Zhdmljb24uaWNvXCIsXG4gICAgLy8gICBjYWNoZUhUTUw6IHRydWUsXG4gICAgLy8gICBjYWNoZVBpYzogdHJ1ZSxcbiAgICAvLyAgIGFwcGVuZEJhc2U6IHRydWUsXG4gICAgLy8gICBhcHBsZToge1xuICAgIC8vICAgICBpY29uOiBcIi9hc3NldHMvaWNvbi9hcHBsZS1pY29uLTE1Mi5wbmdcIixcbiAgICAvLyAgICAgc3RhdHVzQmFyQ29sb3I6IFwiYmxhY2tcIixcbiAgICAvLyAgIH0sXG4gICAgLy8gICBtc1RpbGU6IHtcbiAgICAvLyAgICAgaW1hZ2U6IFwiL2Fzc2V0cy9pY29uL21zLWljb24tMTQ0LnBuZ1wiLFxuICAgIC8vICAgICBjb2xvcjogXCIjZmZmZmZmXCIsXG4gICAgLy8gICB9LFxuICAgIC8vICAgbWFuaWZlc3Q6IHtcbiAgICAvLyAgICAgaWNvbnM6IFtcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBzcmM6IFwiL2Fzc2V0cy9pY29uL2Nocm9tZS1tYXNrLTUxMi5wbmdcIixcbiAgICAvLyAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAvLyAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAvLyAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBzcmM6IFwiL2Fzc2V0cy9pY29uL2Nocm9tZS1tYXNrLTE5Mi5wbmdcIixcbiAgICAvLyAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAvLyAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAvLyAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBzcmM6IFwiL2Fzc2V0cy9pY29uL2Nocm9tZS01MTIucG5nXCIsXG4gICAgLy8gICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgLy8gICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgc3JjOiBcIi9hc3NldHMvaWNvbi9jaHJvbWUtMTkyLnBuZ1wiLFxuICAgIC8vICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgIC8vICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgICBdLFxuICAgIC8vICAgICBzaG9ydGN1dHM6IFtcbiAgICAvLyAgICAgICB7XG4gICAgLy8gICAgICAgICBuYW1lOiBcIkRlbW9cIixcbiAgICAvLyAgICAgICAgIHNob3J0X25hbWU6IFwiRGVtb1wiLFxuICAgIC8vICAgICAgICAgdXJsOiBcIi9kZW1vL1wiLFxuICAgIC8vICAgICAgICAgaWNvbnM6IFtcbiAgICAvLyAgICAgICAgICAge1xuICAgIC8vICAgICAgICAgICAgIHNyYzogXCIvYXNzZXRzL2ljb24vZ3VpZGUtbWFza2FibGUucG5nXCIsXG4gICAgLy8gICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwibWFza2FibGVcIixcbiAgICAvLyAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgIC8vICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgXSxcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgICBdLFxuICAgIC8vICAgfSxcbiAgICAvLyB9LFxuICB9LFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL25hdmJhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3h1ZWppYW1pbmcvRGVza3RvcC9naXRodWJzL2Vhc3ktcXVlcnktZG9jL3NyYy8udnVlcHJlc3MvbmF2YmFyL2VuLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL25hdmJhci9lbi50c1wiO2ltcG9ydCB7IG5hdmJhciB9IGZyb20gXCJ2dWVwcmVzcy10aGVtZS1ob3BlXCI7XG5cbmV4cG9ydCBjb25zdCBlbk5hdmJhciA9IG5hdmJhcihbXG4gIFwiL1wiLFxuICB7IHRleHQ6IFwiRGVtb1wiLCBpY29uOiBcImRpc2NvdmVyXCIsIGxpbms6IFwiL2RlbW8vXCIgfSxcbiAge1xuICAgIHRleHQ6IFwiR3VpZGVcIixcbiAgICBpY29uOiBcImNyZWF0aXZlXCIsXG4gICAgcHJlZml4OiBcIi9ndWlkZS9cIixcbiAgICBjaGlsZHJlbjogW1xuICAgICAge1xuICAgICAgICB0ZXh0OiBcIkJhclwiLFxuICAgICAgICBpY29uOiBcImNyZWF0aXZlXCIsXG4gICAgICAgIHByZWZpeDogXCJiYXIvXCIsXG4gICAgICAgIGNoaWxkcmVuOiBbXCJiYXpcIiwgeyB0ZXh0OiBcIi4uLlwiLCBpY29uOiBcIm1vcmVcIiwgbGluazogXCJcIiB9XSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6IFwiRm9vXCIsXG4gICAgICAgIGljb246IFwiY29uZmlnXCIsXG4gICAgICAgIHByZWZpeDogXCJmb28vXCIsXG4gICAgICAgIGNoaWxkcmVuOiBbXCJyYXlcIiwgeyB0ZXh0OiBcIi4uLlwiLCBpY29uOiBcIm1vcmVcIiwgbGluazogXCJcIiB9XSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIHRleHQ6IFwiVjIgRG9jc1wiLFxuICAgIGljb246IFwibm90ZVwiLFxuICAgIGxpbms6IFwiaHR0cHM6Ly90aGVtZS1ob3BlLnZ1ZWpzLnByZXNzL1wiLFxuICB9LFxuXSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL25hdmJhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3h1ZWppYW1pbmcvRGVza3RvcC9naXRodWJzL2Vhc3ktcXVlcnktZG9jL3NyYy8udnVlcHJlc3MvbmF2YmFyL3poLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL25hdmJhci96aC50c1wiO2ltcG9ydCB7IG5hdmJhciB9IGZyb20gXCJ2dWVwcmVzcy10aGVtZS1ob3BlXCI7XG5cbmV4cG9ydCBjb25zdCB6aE5hdmJhciA9IG5hdmJhcihbXG4gIFwiL1wiLFxuICAvLyB7IHRleHQ6IFwiXHU2ODQ4XHU0RjhCXCIsIGljb246IFwiZGlzY292ZXJcIiwgbGluazogXCIvZGVtby9cIiB9LFxuICB7XG4gICAgdGV4dDogXCJcdTY2RjRcdTY1QjBcdTY1RTVcdTVGRDdcIixcbiAgICBpY29uOiBcImNyZWF0aXZlXCIsXG4gICAgbGluazogXCIvdXBncmFkZVwiLFxuICAgIC8vIGNoaWxkcmVuOiBbXG4gICAgLy8gICB7XG4gICAgLy8gICAgIHRleHQ6IFwiXHU1N0ZBXHU3ODQwXHU2NENEXHU0RjVDXCIsXG4gICAgLy8gICAgIGljb246IFwiY3JlYXRpdmVcIixcbiAgICAvLyAgICAgcHJlZml4OiBcImJhc2ljL1wiLFxuICAgIC8vICAgICBjaGlsZHJlbjogW1wiaW5zZXJ0XCIsXCJ1cGRhdGVcIixcImRlbGV0ZVwiLCB7IHRleHQ6IFwiLi4uXCIsIGljb246IFwibW9yZVwiLCBsaW5rOiBcIlwiIH1dLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIHtcbiAgICAvLyAgICAgdGV4dDogXCJcdTY3RTVcdThCRTJcIixcbiAgICAvLyAgICAgaWNvbjogXCJjcmVhdGl2ZVwiLFxuICAgIC8vICAgICBwcmVmaXg6IFwicXVlcnkvXCIsXG4gICAgLy8gICAgIGNoaWxkcmVuOiBbXCJxdWVyeVwiLFwicGFnaW5nXCIsIHsgdGV4dDogXCIuLi5cIiwgaWNvbjogXCJtb3JlXCIsIGxpbms6IFwiXCIgfV0sXG4gICAgLy8gICB9XG4gICAgLy8gXSxcbiAgfSxcbiAge1xuICAgIHRleHQ6IFwiXHU5ODc5XHU3NkVFXHU1NzMwXHU1NzQwXCIsXG4gICAgaWNvbjogXCJnaXRodWJcIixcbiAgICBjaGlsZHJlbjpbXG4gICAgICB7XG4gICAgICAgIHRleHQ6IFwiZ2l0aHViXCIsXG4gICAgICAgIGljb246IFwiZ2l0aHViXCIsXG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3h1ZWptbmV0L2Vhc3ktcXVlcnlcIlxuICAgICAgfSxcblxuICAgICAge1xuICAgICAgICB0ZXh0OiBcImdpdGVlXCIsXG4gICAgICAgIGljb246IFwiZ2l0ZWVcIixcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGVlLmNvbS94dWVqbS9lYXN5LXF1ZXJ5XCJcbiAgICAgIH1cbiAgICBdXG4gIH1cbiAgLy8ge1xuICAvLyAgIHRleHQ6IFwiVjIgXHU2NTg3XHU2ODYzXCIsXG4gIC8vICAgaWNvbjogXCJub3RlXCIsXG4gIC8vICAgbGluazogXCJodHRwczovL3RoZW1lLWhvcGUudnVlanMucHJlc3MvemgvXCIsXG4gIC8vIH0sXG5dKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3h1ZWppYW1pbmcvRGVza3RvcC9naXRodWJzL2Vhc3ktcXVlcnktZG9jL3NyYy8udnVlcHJlc3Mvc2lkZWJhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3h1ZWppYW1pbmcvRGVza3RvcC9naXRodWJzL2Vhc3ktcXVlcnktZG9jL3NyYy8udnVlcHJlc3Mvc2lkZWJhci9lbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy9zaWRlYmFyL2VuLnRzXCI7aW1wb3J0IHsgc2lkZWJhciB9IGZyb20gXCJ2dWVwcmVzcy10aGVtZS1ob3BlXCI7XG5cbmV4cG9ydCBjb25zdCBlblNpZGViYXIgPSBzaWRlYmFyKHtcbiAgXCIvZW5cIjogW1xuICAgIFwiXCIsXG4gICAge1xuICAgICAgaWNvbjogXCJkaXNjb3ZlclwiLFxuICAgICAgdGV4dDogXCJEZW1vXCIsXG4gICAgICBwcmVmaXg6IFwiZGVtby9cIixcbiAgICAgIGxpbms6IFwiZGVtby9cIixcbiAgICAgIGNoaWxkcmVuOiBcInN0cnVjdHVyZVwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJEb2NzXCIsXG4gICAgICBpY29uOiBcIm5vdGVcIixcbiAgICAgIHByZWZpeDogXCJndWlkZS9cIixcbiAgICAgIGNoaWxkcmVuOiBcInN0cnVjdHVyZVwiLFxuICAgIH0sXG4gICAgXCJzbGlkZXNcIixcbiAgXSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy9zaWRlYmFyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveHVlamlhbWluZy9EZXNrdG9wL2dpdGh1YnMvZWFzeS1xdWVyeS1kb2Mvc3JjLy52dWVwcmVzcy9zaWRlYmFyL3poLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy94dWVqaWFtaW5nL0Rlc2t0b3AvZ2l0aHVicy9lYXN5LXF1ZXJ5LWRvYy9zcmMvLnZ1ZXByZXNzL3NpZGViYXIvemgudHNcIjtpbXBvcnQgeyBzaWRlYmFyIH0gZnJvbSBcInZ1ZXByZXNzLXRoZW1lLWhvcGVcIjtcblxuZXhwb3J0IGNvbnN0IHpoU2lkZWJhciA9IHNpZGViYXIoe1xuICBcIi9cIjogW1xuICAgIFwiXCIsXG4gICAgXCJxdWljay1wcmV2aWV3XCIsXG4gICAgXCJxdWVzdGlvblwiLFxuICAgIHtcbiAgICAgIHRleHQ6IFwiXHU4RDc3XHU2QjY1XCIsXG4gICAgICBwcmVmaXg6IFwic3RhcnR1cC9cIixcbiAgICAgIGNoaWxkcmVuOiBbXCJyZWFkbWVcIixcInF1aWNrLXN0YXJ0XCIsXCJjb21wbGV4LXF1ZXJ5XCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJcdTkxNERcdTdGNkVcIixcbiAgICAgIHByZWZpeDogXCJjb25maWcvXCIsXG4gICAgICBjaGlsZHJlbjogW1wicmVhZG1lLm1kXCIsXCJkZXBlbmRlbmN5LWluamVjdGlvblwiLFwiY29uZmlnLWphdmFcIixcImNvbmZpZy1rb3RsaW5cIixcImNvbmZpZy1zb2xvblwiLFwiY29uZmlnLXNwcmluZy1ib290XCIsXCJjb25maWctb3B0aW9uXCIsXCJhbm5vdGF0aW9uXCIsXCJyZXBsYWNlLWNvbmZpZ3VyZVwiLFwibG9nZ2luZ1wiLFwiYXBpLW1vZGVcIixcImthcHRcIixcIm11dGktZGF0YXNvdXJjZVwiLFwiZWFzeS10cmFuc1wiLFwicGx1Z2luXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJcdTU3RkFcdTc4NDBcdTY0Q0RcdTRGNUNcIixcbiAgICAgIHByZWZpeDogXCJiYXNpYy9cIixcbiAgICAgIGNoaWxkcmVuOiBbXCJyZWFkbWUubWRcIixcImFwaS11c2VcIixcInBlcmZvcm1hbmNlLWRlc2NcIixcInBlcmZvcm1hbmNlXCIsXCJxdWljay1wcmV2aWV3XCIsXCJpbnNlcnRcIixcInVwZGF0ZVwiLFwiZGVsZXRlXCIsXCJpbnNlcnRPclVwZGF0ZVwiLFwidHJhbnNhY3Rpb25cIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlx1NjdFNVx1OEJFMlwiLFxuICAgICAgcHJlZml4OiBcInF1ZXJ5L1wiLFxuICAgICAgY2hpbGRyZW46IFtcInJlYWRtZS5tZFwiLFwiYmFzaWMtdHlwZVwiLFwiYW5vbnltb3VzLXR5cGVcIixcIm9yLWNvbmRpdGlvblwiLFwicGFnaW5nXCIsXCJtdWx0aS1xdWVyeVwiLFwiZ3JvdXBcIixcInBhcnRpdGlvblwiLFwib3JkZXJcIixcInNlbGVjdFwiLFwibmF0aXZlLXNxbFwiLFwiZHluYW1pYy10YWJsZVwiLFwic3RyZWFtLXF1ZXJ5XCIsXCJ0by1tYXBcIixcInNlbGVjdC1jb2x1bW5cIixcInVuaW9uXCIsXCJzZWxlY3Qtc3ViXCIsXCJ3aGVyZS1zdWJcIixcInJlbGF0aW9uXCIsXCJyZWxhdGlvbi1maWx0ZXJcIixcImZpbGxcIixcIndoZXJlXCIsXCJyZXVzZVwiLFwiY2FzZS13aGVuXCIsXCJkeW5hbWljLXdoZXJlXCIsXCJkeW5hbWljLXNvcnRcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlx1OEJBMVx1N0I5N1x1NUM1RVx1NjAyN1wiLFxuICAgICAgcHJlZml4OiBcInByb3AvXCIsXG4gICAgICBjaGlsZHJlbjogW1wicmVhZG1lLm1kXCIsXCJqc29uLXByb3BcIixcImNvbGxlY3Rpb24tcHJvcFwiLFwiZW51bS1wcm9wXCIsXCJzcWwtY29sdW1uLXByb3BcIixcInN0YXR1cy1wcm9wXCIsXCJjb21iaW5lLXByb3BcIixcImFnZ3JlZ2F0ZS1wcm9wXCIsXCJzcWwtY29sdW1uLWdlbmVyYXRlLXByb3BcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlx1OUFEOFx1N0VBN1wiLFxuICAgICAgcHJlZml4OiBcImFkdi9cIixcbiAgICAgIGNoaWxkcmVuOiBbXCJyZWFkbWUubWRcIixcImxvZ2ljLWRlbGV0ZVwiLFwiYXV0by1rZXlcIixcImludGVyY2VwdG9yXCIsXCJiYXRjaFwiLFwic3FsLWZ1bmMtdjFcIixcInNxbC1mdW5jXCIsXCJjb2x1bW4tZW5jcnlwdGlvblwiLFwiY29sdW1uLXNxbC1mdW5jLWF1dG9cIixcImRhdGEtdHJhY2tpbmdcIixcInZlcnNpb25cIixcImNvbHVtbi1mdW5jLW5ld1wiLFwiY29sdW1uLWZ1bmNcIixcInZhbHVlLW9iamVjdFwiLFwiamRiYy1saXN0ZW5lclwiLFwidHlwZS1oYW5kbGVyXCJdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogXCJcdThEODVcdTdFQTdcIixcbiAgICAgIHByZWZpeDogXCJzdXBlci9cIixcbiAgICAgIGNoaWxkcmVuOiBbXCJyZWFkbWUubWRcIixcInNoYXJkaW5nLXRhYmxlLm1kXCIsXCJzaGFyZGluZy1kYXRhc291cmNlLm1kXCIsXCJzaGFyZGluZy1hbGwubWRcIixcImRlZmF1bHQtcm91dGUtcnVsZVwiLFwiZGVmYXVsdC1yb3V0ZS1pbml0aWFsaXplclwiLFwic2hhcmRpbmctbW9kLm1kXCIsXCJzaGFyZGluZy10aW1lLm1kXCIsXG4gICAgICBcInNoYXJkaW5nLWFsbC10aW1lLm1kXCIsXCJzaGFyZGluZy1tdWx0aS5tZFwiLFwic2hhcmRpbmctc2VxdWVuY2UubWRcIl0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiBcIlx1NUI5RVx1NjIxOFwiLFxuICAgICAgaWNvbjogXCJub3RlXCIsXG4gICAgICBwcmVmaXg6IFwicHJhY3RpY2UvXCIsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJcdTU3RkFcdTc4NDBcdTkxNERcdTdGNkVcIixcbiAgICAgICAgICBwcmVmaXg6IFwiY29uZmlndXJhdGlvbi9cIixcbiAgICAgICAgICBjb2xsYXBzaWJsZTp0cnVlLFxuICAgICAgICAgIGNoaWxkcmVuOiBbXCJyZWFkbWUubWRcIixcImVudGl0eS5tZFwiLFwiZXhjZXB0aW9uLm1kXCJdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogXCJcdTZDRThcdTg5RTNcdTU5MDRcdTc0MDZcdTU2NjhcIixcbiAgICAgICAgICBwcmVmaXg6IFwiYXB0L1wiLFxuICAgICAgICAgIGNvbGxhcHNpYmxlOnRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IFtcInJlYWRtZS5tZFwiLFwiY29tcGlsZS1yZXBvLm1kXCJdLFxuICAgICAgICB9XG4gICAgICBdLFxuICAgIH0sXG4gICAgXCJzdXBwb3J0XCJcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVyxTQUFTLHdCQUF3QjtBQUNuWSxTQUFTLHVCQUF1Qjs7O0FDRGdVLFNBQVMsaUJBQWlCOzs7QUNBWCxTQUFTLGNBQWM7QUFFL1gsSUFBTSxXQUFXLE9BQU87QUFBQSxFQUM3QjtBQUFBLEVBQ0EsRUFBRSxNQUFNLFFBQVEsTUFBTSxZQUFZLE1BQU0sU0FBUztBQUFBLEVBQ2pEO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sTUFB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
