# 个人知识库

个人的知识体系总结

[线上链接](https://x-liang.github.io/)



## 本地环境搭建

### 依赖环境

Node.js v14+

## 搭建项目

- 第一步： 克隆仓库到本地

  ```shell
  git clone git@github.com:x-liang/note.git
  ```

- 第二步：初始化项目

  ```shell
  npm init
  ```

- 第三步：安装Vuepress

  ```shell
  npm install -D vuepress@next
  ```

- 第四步：在package.js中添加一些脚本

  ```json
  {
    "scripts": {
      "docs:dev": "vuepress dev docs",
      "docs:build": "vuepress build docs"
    }
  }
  ```

- 第五步：运行命令

  ```shell
  npm run docs:dev
  ```

  运行该命令后，就会启动一个服务，默认在8080端口，就可以通过浏览器进行访问了
  
- 使用主题vuepress-theme-hope

  URL：https://vuepress-theme-hope.gitee.io/v2/zh/

## 编译项目

运行如下命令即可编译项目

```shell
npm run docs:build
```

编译后的文件在docs/.vuepress/dist 目录下

## 友情宣传

该博客采用Vuepress进行搭建，有关Vuepress的详细信息，可以参考[Vuepress官网](https://v2.vuepress.vuejs.org/zh/)
