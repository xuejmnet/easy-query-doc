import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  // "/startup/",
  // "/portfolio",
  "/demo/",
  "/discussions",
  {
    text: "项目地址",
    icon: "github",
    children:[
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
  //   text: "Guide",
  //   icon: "lightbulb",
  //   prefix: "/guide/",
  //   children: [
  //     {
  //       text: "Bar",
  //       icon: "lightbulb",
  //       prefix: "bar/",
  //       children: ["baz", { text: "...", icon: "ellipsis", link: "#" }],
  //     },
  //     {
  //       text: "Foo",
  //       icon: "lightbulb",
  //       prefix: "foo/",
  //       children: ["ray", { text: "...", icon: "ellipsis", link: "#" }],
  //     },
  //   ],
  // },
  // {
  //   text: "V2 Docs",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/",
  // },
]);
