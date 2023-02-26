## Linux资源管理之cgroups简介

cgroups 是Linux内核提供的一种可以限制单个进程或者多个进程所使用资源的机制，可以对 cpu，内存等资源实现精细化的控制，目前越来越火的轻量级容器 Docker 就使用了 cgroups 提供的资源限制能力来完成cpu，内存等部分的资源控制。

另外，开发者也可以使用 cgroups 提供的精细化控制能力，限制某一个或者某一组进程的资源使用。比如在一个既部署了前端 web 服务，也部署了后端计算模块的八核服务器上，可以使用 cgroups 限制 web server 仅可以使用其中的六个核，把剩下的两个核留给后端计算模块。

本文从以下四个方面描述一下 cgroups 的原理及用法：

1. cgroups 的概念及原理
2. cgroups 文件系统概念及原理
3. cgroups 使用方法介绍
4. cgroups 实践中的例子



https://tech.meituan.com/2015/03/31/cgroups.html