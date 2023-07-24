import { defineUserConfig } from "vuepress";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/easy-query-doc/",
 
  locales: {
    "/": {
      lang: "zh-CN",
      title: "文档演示",
      description: "vuepress-theme-hope 的文档演示",
    },
    // "/en/": {
    //   lang: "en-US",
    //   title: "Docs Demo",
    //   description: "A docs demo for vuepress-theme-hope",
    // },
  },

  theme,
  pagePatterns: [
      "**/*.md",
      "!**/*.snippet.md",
      "!.vuepress",
      "!node_modules",
  ],
  plugins:[
    searchProPlugin({
      // 索引全部内容
      indexContent: true,
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
    }),
  ]
  // Enable it with pwa
  // shouldPrefetch: false,
});
