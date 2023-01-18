# Nginx

## 一、Nginx 概述

Nginx 是开源、高性能、高可靠的 Web 和反向代理服务器，而且支持热部署，几乎可以做到 7 * 24 小时不间断运行，即使运行几个月也不需要重新启动，还能在不间断服务的情况下对软件版本进行热更新。性能是 Nginx 最重要的考量，其占用内存少、并发能力强、能支持高达 5w 个并发连接数，最重要的是， Nginx 是免费的并可以商业化，配置使用也比较简单。

## 二、Nginx 特点

- 高并发、高性能；
- 模块化架构使得它的扩展性非常好；
- 异步非阻塞的事件驱动模型这点和 `Node.js` 相似；
- 相对于其它服务器来说它可以连续几个月甚至更长而不需要重启服务器使得它具有高可靠性；
- 热部署、平滑升级；
- 完全开源，生态繁荣；

## 三、Nginx 作用

Nginx 的最重要的几个使用场景：

1. 静态资源服务，通过本地文件系统提供服务；
2. 反向代理服务，延伸出包括缓存、负载均衡等；
3. `API` 服务， `OpenResty` ；

对于前端来说 `Node.js` 并不陌生， `Nginx` 和 `Node.js` 的很多理念类似， `HTTP` 服务器、事件驱动、异步非阻塞等，且 `Nginx` 的大部分功能使用 `Node.js` 也可以实现，但 `Nginx` 和 `Node.js` 并不冲突，都有自己擅长的领域。 `Nginx` 擅长于底层服务器端资源的处理（静态资源处理转发、反向代理，负载均衡等）， `Node.js` 更擅长上层具体业务逻辑的处理，两者可以完美组合。

用一张图表示：

![1](./.nginx.assets/1.png)

## 四、Nginx 安装

## 五、Nginx 常用命令

**`systemctl` 系统命令：**

```shell
# 开机配置
systemctl enable nginx # 开机自动启动
systemctl disable nginx # 关闭开机自动启动

# 启动Nginx
systemctl start nginx # 启动Nginx成功后，可以直接访问主机IP，此时会展示Nginx默认页面

# 停止Nginx
systemctl stop nginx

# 重启Nginx
systemctl restart nginx

# 重新加载Nginx
systemctl reload nginx

# 查看 Nginx 运行状态
systemctl status nginx

# 查看Nginx进程
ps -ef | grep nginx

# 杀死Nginx进程
kill -9 pid # 根据上面查看到的Nginx进程号，杀死Nginx进程，-9 表示强制结束进程
```

**`Nginx` 应用程序命令：**

```shell
nginx -s reload  # 向主进程发送信号，重新加载配置文件，热重启
nginx -s reopen  # 重启 Nginx
nginx -s stop    # 快速关闭
nginx -s quit    # 等待工作进程处理完成后关闭
nginx -T         # 查看当前 Nginx 最终的配置
nginx -t         # 检查配置是否有问题
```



## 六、Nginx 核心配置

### 6.1 配置文件结构

`Nginx` 的典型配置示例：

```
# main段配置信息
user  nginx;                        # 运行用户，默认即是nginx，可以不进行设置
worker_processes  auto;             # Nginx 进程数，一般设置为和 CPU 核数一样
error_log  /var/log/nginx/error.log warn;   # Nginx 的错误日志存放目录
pid        /var/run/nginx.pid;      # Nginx 服务启动时的 pid 存放位置

# events段配置信息
events {
    use epoll;     # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)
    worker_connections 1024;   # 每个进程允许最大并发数
}

# http段配置信息
# 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
http { 
    # 设置日志模式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置

    sendfile            on;   # 开启高效传输模式
    tcp_nopush          on;   # 减少网络报文段的数量
    tcp_nodelay         on;
    keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
    default_type        application/octet-stream;   # 默认文件类型

    include /etc/nginx/conf.d/*.conf;   # 加载子配置项
    
    # server段配置信息
    server {
     listen       80;       # 配置监听的端口
     server_name  localhost;    # 配置的域名
      
     # location段配置信息
     location / {
      root   /usr/share/nginx/html;  # 网站根目录
      index  index.html index.htm;   # 默认首页文件
      deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
      allow 172.168.33.44；# 允许访问的ip地址，可以为all
     }
     
     error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面
     error_page 400 404 error.html;   # 同上
    }
}
```

- `main` 全局配置，对全局生效；
- `events` 配置影响 `Nginx` 服务器与用户的网络连接；
- `http` 配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置；
- `server` 配置虚拟主机的相关参数，一个 `http` 块中可以有多个 `server` 块；
- `location` 用于配置匹配的 `uri` ；
- `upstream` 配置后端服务器具体地址，负载均衡配置不可或缺的部分；

用一张图清晰的展示它的层级结构：

![image-20230118145124966](./.nginx.assets/image-20230118145124966.png)

### 6.2 配置文件 main 段核心参数

#### 6.2.1 user

指定运行 `Nginx` 的 `woker` 子进程的属主和属组，其中组可以不指定。

```shell
user USERNAME [GROUP]
user nginx lion; # 用户是nginx;组是lion
```

#### 6.2.2 pid

指定运行 `Nginx` `master` 主进程的 `pid` 文件存放路径。

```shell
pid /opt/nginx/logs/nginx.pid # master主进程的的pid存放在nginx.pid的文件
```

#### 6.2.3 worker_rlimit_nofile_number

指定 `worker` 子进程可以打开的最大文件句柄数。

```shell
worker_rlimit_nofile 20480; # 可以理解成每个worker子进程的最大连接数量。
```

#### 6.2.4 worker_rlimit_core

指定 `worker` 子进程异常终止后的 `core` 文件，用于记录分析问题。

```shell
worker_rlimit_core 50M; # 存放大小限制
working_directory /opt/nginx/tmp; # 存放目录
```

#### 6.2.5 worker_processes_number

指定 `Nginx` 启动的 `worker` 子进程数量。

```
worker_processes 4; # 指定具体子进程数量
worker_processes auto; # 与当前cpu物理核心数一致
```

#### 6.2.6 worker_cpu_affinity

将每个 `worker` 子进程与我们的 `cpu` 物理核心绑定。

```
worker_cpu_affinity 0001 0010 0100 1000; # 4个物理核心，4个worker子进程
```

![image-20230118151935428](./.nginx.assets/image-20230118151935428.png)

将每个 `worker` 子进程与特定 `CPU` 物理核心绑定，优势在于，避免同一个 `worker` 子进程在不同的 `CPU` 核心上切换，缓存失效，降低性能。但其并不能真正的避免进程切换。

#### 6.2.7 worker_priority

指定 `worker` 子进程的 `nice` 值，以调整运行 `Nginx` 的优先级，通常设定为负值，以优先调用 `Nginx` 。

```
worker_priority -10; # 120-10=110，110就是最终的优先级
```

`Linux` 默认进程的优先级值是120，值越小越优先； `nice` 定范围为 `-20` 到 `+19` 。

[备注] 应用的默认优先级值是120加上 `nice` 值等于它最终的值，这个值越小，优先级越高。

#### 6.2.8 worker_shutdown_timeout

指定 `worker` 子进程优雅退出时的超时时间。

```
worker_shutdown_timeout 5s;
```

#### 6.2.9 timer_resolution

`worker` 子进程内部使用的计时器精度，调整时间间隔越大，系统调用越少，有利于性能提升；反之，系统调用越多，性能下降。

```
timer_resolution 100ms;
```

在 `Linux` 系统中，用户需要获取计时器时需要向操作系统内核发送请求，有请求就必然会有开销，因此这个间隔越大开销就越小。

#### 6.2.10 daemon

指定 `Nginx` 的运行方式，前台还是后台，前台用于调试，后台用于生产。

```
daemon off; # 默认是on，后台运行模式
```

### 6.3 配置文件 events 段核心参数

#### 6.3.1 use

`Nginx` 使用何种事件驱动模型。

```
use method; # 不推荐配置它，让nginx自己选择
method 可选值为：select、poll、kqueue、epoll、/dev/poll、eventport
```

#### 6.3.2 worker_connections

`worker` 子进程能够处理的最大并发连接数。

```
worker_connections 1024 # 每个子进程的最大连接数为1024
```

#### 6.3.3 accept_mutex

是否打开负载均衡互斥锁。

```
accept_mutex on # 默认是off关闭的，这里推荐打开
```

### 6.4 server_name 指令

指定虚拟主机域名。

```
server_name name1 name2 name3
# 示例：
server_name www.nginx.com;
```

域名匹配的四种写法：

- 精确匹配： `server_name www.nginx.com` ;
- 左侧通配： `server_name *.nginx.com` ;
- 右侧统配： `server_name  www.nginx.*` ;
- 正则匹配： `server_name ~^www\.nginx\.*$` ;

匹配优先级：**「精确匹配 > 左侧通配符匹配 > 右侧通配符匹配 > 正则表达式匹配」**

`server_name` 配置实例：

1、配置本地  `DNS` 解析 `vim /etc/hosts` （ `macOS` 系统）

```
# 添加如下内容，其中 121.42.11.34 是阿里云服务器IP地址
121.42.11.34 www.nginx-test.com
121.42.11.34 mail.nginx-test.com
121.42.11.34 www.nginx-test.org
121.42.11.34 doc.nginx-test.com
121.42.11.34 www.nginx-test.cn
121.42.11.34 fe.nginx-test.club
```

[注意] 这里使用的是虚拟域名进行测试，因此需要配置本地 `DNS` 解析，如果使用阿里云上购买的域名，则需要在阿里云上设置好域名解析。

2、配置阿里云 `Nginx` ，`vim /etc/nginx/nginx.conf`

```
# 这里只列举了http端中的sever端配置

# 左匹配
server {
 listen 80;
 server_name *.nginx-test.com;
 root /usr/share/nginx/html/nginx-test/left-match/;
 location / {
  index index.html;
 }
}

# 正则匹配
server {
 listen 80;
 server_name ~^.*\.nginx-test\..*$;
 root /usr/share/nginx/html/nginx-test/reg-match/;
 location / {
  index index.html;
 }
}

# 右匹配
server {
 listen 80;
 server_name www.nginx-test.*;
 root /usr/share/nginx/html/nginx-test/right-match/;
 location / {
  index index.html;
 }
}

# 完全匹配
server {
 listen 80;
 server_name www.nginx-test.com;
 root /usr/share/nginx/html/nginx-test/all-match/;
 location / {
  index index.html;
 }
}
```

3、访问分析

当访问 www.nginx-test.com 时，都可以被匹配上，因此选择优先级最高的“完全匹配”；

当访问 mail.nginx-test.com 时，会进行“左匹配”；

当访问 www.nginx-test.org 时，会进行“右匹配”；

当访问 doc.nginx-test.com 时，会进行“左匹配”；

当访问 www.nginx-test.cn 时，会进行“右匹配”；

当访问 fe.nginx-test.club 时，会进行“正则匹配”；

### 6.5 root

指定静态资源目录位置，它可以写在 `http` 、 `server` 、 `location` 等配置中。

```
root path

# 例如：
location /image {
    root /opt/nginx/static;
}

# 当用户访问 www.test.com/image/1.png 时，实际在服务器找的路径是 /opt/nginx/static/image/1.png
```

[注意] `root` 会将定义路径与 `URI` 叠加， `alias` 则只取定义路径。



### 6.6 alias

它也是指定静态资源目录位置，它只能写在 `location` 中。

```
location /image {
    alias /opt/nginx/static/image/;
}

# 当用户访问 www.test.com/image/1.png 时，实际在服务器找的路径是 /opt/nginx/static/image/1.png
```

[注意] 使用 alias 末尾一定要添加 `/` ，并且它只能位于 `location` 中。

### 6.7 location

配置路径。

```
location [ = | ~ | ~* | ^~ ] uri {
 ...
}
```

匹配规则：

- `=` 精确匹配；
- `~` 正则匹配，区分大小写；
- `~*` 正则匹配，不区分大小写；
- `^~` 匹配到即停止搜索；

匹配优先级： `=` > `^~` >  `~` > `~*` > 不带任何字符。

实例：

```shell
server {
  listen 80;
  server_name www.nginx-test.com;
  
  # 只有当访问 www.nginx-test.com/match_all/ 时才会匹配到/usr/share/nginx/html/match_all/index.html
  location = /match_all/ {
      root /usr/share/nginx/html
      index index.html
  }
  
  # 当访问 www.nginx-test.com/1.jpg 等路径时会去 /usr/share/nginx/images/1.jpg 找对应的资源
  location ~ \.(jpeg|jpg|png|svg)$ {
      root /usr/share/nginx/images;
  }
  
  # 当访问 www.nginx-test.com/bbs/ 时会匹配上 /usr/share/nginx/html/bbs/index.html
  location ^~ /bbs/ {
      root /usr/share/nginx/html;
      index index.html index.htm;
  }
}
```

#### 6.7.1 location 中的反斜线

```
location /test {
 ...
}

location /test/ {
 ...
}
```

- 不带 `/` 当访问 `www.nginx-test.com/test` 时， `Nginx` 先找是否有 `test` 目录，如果有则找 `test` 目录下的 `index.html` ；如果没有 `test` 目录， `nginx` 则会找是否有 `test` 文件。
- 带 `/` 当访问 `www.nginx-test.com/test` 时， `Nginx` 先找是否有 `test` 目录，如果有则找 `test` 目录下的 `index.html` ，如果没有它也不会去找是否存在 `test` 文件。



#### 6.7.2 return

停止处理请求，直接返回响应码或重定向到其他 `URL` ；执行 `return` 指令后， `location` 中后续指令将不会被执行。

```
return code [text];
return code URL;
return URL;

例如：
location / {
    return 404; # 直接返回状态码
}

location / {
    return 404 "pages not found"; # 返回状态码 + 一段文本
}

location / {
    return 302 /bbs ; # 返回状态码 + 重定向地址
}

location / {
    return https://www.baidu.com ; # 返回重定向地址
}
```

#### 6.7.3 rewrite

根据指定正则表达式匹配规则，重写 `URL` 。

```
语法：rewrite 正则表达式 要替换的内容 [flag];

上下文：server、location、if

示例：rewirte /images/(.*\.jpg)$ /pic/$1; # $1是前面括号(.*\.jpg)的反向引用
```

`flag` 可选值的含义：

- `last` 重写后的 `URL` 发起新请求，再次进入 `server` 段，重试 `location` 的中的匹配；
- `break` 直接使用重写后的 `URL` ，不再匹配其它 `location` 中语句；
- `redirect` 返回302临时重定向；
- `permanent` 返回301永久重定向；

```
server{
  listen 80;
  server_name fe.lion.club; # 要在本地hosts文件进行配置
  root html;
  location /search {
      rewrite ^/(.*) https://www.baidu.com redirect;
  }
  
  location /images {
      rewrite /images/(.*) /pics/$1;
  }
  
  location /pics {
      rewrite /pics/(.*) /photos/$1;
  }
  
  location /photos {
  
  }
}
```

按照这个配置我们来分析：

- 当访问 `fe.lion.club/search` 时，会自动帮我们重定向到 `https://www.baidu.com`。
- 当访问 `fe.lion.club/images/1.jpg` 时，第一步重写 `URL` 为 `fe.lion.club/pics/1.jpg` ，找到 `pics` 的 `location` ，继续重写 `URL` 为 `fe.lion.club/photos/1.jpg` ，找到 `/photos` 的 `location` 后，去 `html/photos` 目录下寻找 `1.jpg` 静态资源。

### 6.8 if 指令

```
语法：if (condition) {...}

上下文：server、location

示例：
if($http_user_agent ~ Chrome){
  rewrite /(.*)/browser/$1 break;
}
```

`condition` 判断条件：

- `$variable` 仅为变量时，值为空或以0开头字符串都会被当做 `false` 处理；
- `=` 或 `!=` 相等或不等；
- `~` 正则匹配；
- `! ~` 非正则匹配；
- `~*` 正则匹配，不区分大小写；
- `-f` 或 `! -f` 检测文件存在或不存在；
- `-d` 或 `! -d` 检测目录存在或不存在；
- `-e` 或 `! -e` 检测文件、目录、符号链接等存在或不存在；
- `-x` 或 `! -x` 检测文件可以执行或不可执行；

实例：

```
server {
  listen 8080;
  server_name localhost;
  root html;
  
  location / {
   if ( $uri = "/images/" ){
     rewrite (.*) /pics/ break;
    }
  }
}
```

当访问 `localhost:8080/images/` 时，会进入 `if` 判断里面执行 `rewrite` 命令。

### 6.9 autoindex

用户请求以 `/` 结尾时，列出目录结构，可以用于快速搭建静态资源下载网站。

`autoindex.conf` 配置信息：

```
server {
  listen 80;
  server_name fe.lion-test.club;
  
  location /download/ {
    root /opt/source;
    
    autoindex on; # 打开 autoindex，，可选参数有 on | off
    autoindex_exact_size on; # 修改为off，以KB、MB、GB显示文件大小，默认为on，以bytes显示出⽂件的确切⼤⼩
    autoindex_format html; # 以html的方式进行格式化，可选参数有 html | json | xml
    autoindex_localtime off; # 显示的⽂件时间为⽂件的服务器时间。默认为off，显示的⽂件时间为GMT时间
  }
}
```

当访问 `fe.lion.com/download/` 时，会把服务器 `/opt/source/download/` 路径下的文件展示出来，如下图所示：

![图片](./.nginx.assets/640.png)

## 七、变量

`Nginx` 提供给使用者的变量非常多，但是终究是一个完整的请求过程所产生数据， `Nginx` 将这些数据以变量的形式提供给使用者。

下面列举些项目中常用的变量：

| 变量名             | 含义                     |
| ------------------ | ------------------------ |
| remote_addr        | 客户端IP地址             |
| remote_port        | 客户端端口               |
| server_addr        | 服务端IP地址             |
| server_port        | 服务端端口               |
| server_protocol    | 服务端协议               |
| binary_remote_addr | 二进制格式的客户端IP地址 |
| connection         | TCP连接的序号，递增      |
|                    |                          |
|                    |                          |
|                    |                          |
|                    |                          |
|                    |                          |
|                    |                          |














connection_reques
TCP
连接当前的请求数量
uri
请求的URL,不包含参数
request_uri
请求的URL,包含参数
scheme
协议名，
nttp或
https
request method
请求方法
request_length
全部请求的长度，包含请求行、请求头、请求体
args
全部参数字符串
arg_参效名
获取特定参数值
is_args
URL中是否有参数，有的话返回？，否则返回空
query_string
与
args
相同
请求信息中的Host,如果请求中没有Host
行，则在请求头中找，最后使用
host
nginx中设置的server._name。