# Redis 基础

## 一：Redis的基础数据结构

### 1.1 Redis的安装

#### 下载源码

```
 wget https://download.redis.io/redis-stable.tar.gz
```

#### 编译Redis

```
// 解压
tar zxvf redis-stable.tar.gz

// 编译之前需要安装make和gcc
sudo apt install make
sudo apt-get install gcc
sudo apt install pkg-config

// 编译
make
```

编译过程中报了个错误

```
cd src && make all
make[1]: Entering directory '/home/xuliang/developer/env/redis-stable/src'
/bin/sh: 1: pkg-config: not found
    CC adlist.o
In file included from adlist.c:34:
zmalloc.h:50:10: fatal error: jemalloc/jemalloc.h: No such file or directory
   50 | #include <jemalloc/jemalloc.h>
      |          ^~~~~~~~~~~~~~~~~~~~~
compilation terminated.
make[1]: *** [Makefile:374: adlist.o] Error 1
make[1]: Leaving directory '/home/xuliang/developer/env/redis-stable/src'
```

可以尝试在编译的时候添加一个参数

```
make MALLOC=libc
```

#### 启动服务

编译完成之后在src目录下会生成一下文件

| 文件名          | 描述                            | 备注                 |
| --------------- | ------------------------------- | -------------------- |
| redis-server    | Redis服务端                     |                      |
| redis-sentinel  | Redis Sentinel                  | redis-server的软连接 |
| redis-cli       | Redis命令行工具                 |                      |
| redis-check-rdb | Redis RDB检查工具               |                      |
| redis-check-aof | Redis Append Only File 检查工具 |                      |
| redis-benchmark | Redis 基准/性能测试工具         |                      |

### 1.2 五种基础的数据类型

#### String

#### List

#### Set

#### Hash

#### ZSet



### 1.3 容器型数据结构的通用规则

- create if not exists

- drop if not exists



### 1.4 过期时间

Redis中所有





























































































































----