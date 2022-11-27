# Redis Cluster



>
> 最近在面试过程中被面试官问到 Redis 集群数据是如何复制的，由于之前没有准备直接懵了。
>
> 事后查了查这个问题其实也挺简单，如果你之前也不知道，没问题，赶紧浅尝辄止，速度3遍即可入门。

阅读本文，你可能会有哪些收获呢？

- 首先，你会知道有三种集群模式
- 然后对每种集群模式的原理有个大概了解
- 当然还能看到集群演变的影子
- 最后还会有手把手的实操

**Redis 支持三种集群方案**

- 主从复制模式
- Sentinel（哨兵）模式
- Cluster 模式



集群搭建

https://blog.csdn.net/u010784529/article/details/125178984



Redis集群架构  写的详细的文章

https://blog.csdn.net/weixin_40242845/article/details/123491390





Redis 事物

https://segmentfault.com/a/1190000023951592



## Redis 集群的三种模式

### 主从复制模式

![img](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808581.png)

#### 主从复制的作用

通过持久化功能，Redis保证了即使在服务器重启的情况下也不会丢失（或少量丢失）数据，因为持久化会把内存中数据保存到硬盘上，重启会从硬盘上加载数据。 但是由于数据是存储在一台服务器上的，如果这台服务器出现硬盘故障等问题，也会导致数据丢失。

为了避免单点故障，通常的做法是将数据库复制多个副本以部署在不同的服务器上，这样即使有一台服务器出现故障，其他服务器依然可以继续提供服务。

为此， **Redis 提供了复制（replication）功能，可以实现当一台数据库中的数据更新后，自动将更新的数据同步到其他数据库上**。

在复制的概念中，数据库分为两类，一类是主数据库（master），另一类是从数据库(slave）。主数据库可以进行读写操作，当写操作导致数据变化时会自动将数据同步给从数据库。而从数据库一般是只读的，并接受主数据库同步过来的数据。一个主数据库可以拥有多个从数据库，而一个从数据库只能拥有一个主数据库。

**总结：引入主从复制机制的目的有两个**

- 一个是读写分离，分担 "master" 的读写压力
- 一个是方便做容灾恢复

#### **主从复制原理**

![img](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808583.png)

- 从数据库启动成功后，连接主数据库，发送 SYNC 命令；
- 主数据库接收到 SYNC 命令后，开始执行 BGSAVE 命令生成 RDB 文件并使用缓冲区记录此后执行的所有写命令；
- 主数据库 BGSAVE 执行完后，向所有从数据库发送快照文件，并在发送期间继续记录被执行的写命令；
- 从数据库收到快照文件后丢弃所有旧数据，载入收到的快照；
- 主数据库快照发送完毕后开始向从数据库发送缓冲区中的写命令；
- 从数据库完成对快照的载入，开始接收命令请求，并执行来自主数据库缓冲区的写命令；（**从数据库初始化完成**）
- 主数据库每执行一个写命令就会向从数据库发送相同的写命令，从数据库接收并执行收到的写命令（**从数据库初始化完成后的操作**）
- 出现断开重连后，2.8之后的版本会将断线期间的命令传给重数据库，增量复制。
- 主从刚刚连接的时候，进行全量同步；全同步结束后，进行增量同步。当然，如果有需要，slave 在任何时候都可以发起全量同步。Redis 的策略是，无论如何，首先会尝试进行增量同步，如不成功，要求从机进行全量同步。

#### 主从复制优缺点

**主从复制优点**

- 支持主从复制，主机会自动将数据同步到从机，可以进行读写分离；
- 为了分载 Master 的读操作压力，Slave 服务器可以为客户端提供只读操作的服务，写服务仍然必须由Master来完成；
- Slave 同样可以接受其它 Slaves 的连接和同步请求，这样可以有效的分载 Master 的同步压力；
- Master Server 是以非阻塞的方式为 Slaves 提供服务。所以在 Master-Slave 同步期间，客户端仍然可以提交查询或修改请求；
- Slave Server 同样是以非阻塞的方式完成数据同步。在同步期间，如果有客户端提交查询请求，Redis则返回同步之前的数据；

**主从复制缺点**

- Redis不具备自动容错和恢复功能，主机从机的宕机都会导致前端部分读写请求失败，需要等待机器重启或者手动切换前端的IP才能恢复（**也就是要人工介入**）；
- 主机宕机，宕机前有部分数据未能及时同步到从机，切换IP后还会引入数据不一致的问题，降低了系统的可用性；
- 如果多个 Slave 断线了，需要重启的时候，尽量不要在同一时间段进行重启。因为只要 Slave 启动，就会发送sync 请求和主机全量同步，当多个 Slave 重启的时候，可能会导致 Master IO 剧增从而宕机。
- Redis 较难支持在线扩容，在集群容量达到上限时在线扩容会变得很复杂；

### Sentinel（哨兵）模式

第一种主从同步/复制的模式，当主服务器宕机后，需要手动把一台从服务器切换为主服务器，这就需要人工干预，费事费力，还会造成一段时间内服务不可用。这不是一种推荐的方式，更多时候，我们优先考虑哨兵模式。

哨兵模式是一种特殊的模式，首先 Redis 提供了哨兵的命令，**哨兵是一个独立的进程，作为进程，它会独立运行。其原理是哨兵通过发送命令，等待Redis服务器响应，从而监控运行的多个 Redis 实例**。

![单哨兵](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808580.png)

#### **哨兵模式的作用**

- 通过发送命令，让 Redis 服务器返回监控其运行状态，包括主服务器和从服务器；
- 当哨兵监测到 master 宕机，会自动将 slave 切换成 master ，然后通过**发布订阅模式**通知其他的从服务器，修改配置文件，让它们切换主机；

然而一个哨兵进程对Redis服务器进行监控，也可能会出现问题，为此，我们可以使用多个哨兵进行监控。各个哨兵之间还会进行监控，这样就形成了多哨兵模式。

![多哨兵](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808582.png)

#### **故障切换的过程**

假设主服务器宕机，哨兵1先检测到这个结果，系统并不会马上进行 failover 过程，仅仅是哨兵1主观的认为主服务器不可用，这个现象成为**主观下线**。当后面的哨兵也检测到主服务器不可用，并且数量达到一定值时，那么哨兵之间就会进行一次投票，投票的结果由一个哨兵发起，进行 failover 操作。切换成功后，就会通过发布订阅模式，让各个哨兵把自己监控的从服务器实现切换主机，这个过程称为**客观下线**。这样对于客户端而言，一切都是透明的。

#### 哨兵模式的工作方式：

- 每个Sentinel（哨兵）进程以每秒钟一次的频率向整个集群中的 Master 主服务器，Slave 从服务器以及其他Sentinel（哨兵）进程发送一个 PING 命令。
- 如果一个实例（instance）距离最后一次有效回复 PING 命令的时间超过 down-after-milliseconds 选项所指定的值， 则这个实例会被 Sentinel（哨兵）进程标记为主观下线（SDOWN）
- 如果一个 Master 主服务器被标记为主观下线（SDOWN），则正在监视这个 Master 主服务器的所有 Sentinel（哨兵）进程要以每秒一次的频率确认 Master 主服务器的确进入了主观下线状态
- 当有足够数量的 Sentinel（哨兵）进程（大于等于配置文件指定的值）在指定的时间范围内确认 Master 主服务器进入了主观下线状态（SDOWN）， 则 Master 主服务器会被标记为客观下线（ODOWN）
- 在一般情况下， 每个 Sentinel（哨兵）进程会以每 10 秒一次的频率向集群中的所有 Master 主服务器、Slave 从服务器发送 INFO 命令。
- 当 Master 主服务器被 Sentinel（哨兵）进程标记为客观下线（ODOWN）时，Sentinel（哨兵）进程向下线的 Master 主服务器的所有 Slave 从服务器发送 INFO 命令的频率会从 10 秒一次改为每秒一次。
- 若没有足够数量的 Sentinel（哨兵）进程同意 Master主服务器下线， Master 主服务器的客观下线状态就会被移除。若 Master 主服务器重新向 Sentinel（哨兵）进程发送 PING 命令返回有效回复，Master主服务器的主观下线状态就会被移除。

#### 哨兵模式的优缺点

**优点：**

- 哨兵模式是基于主从模式的，所有主从的优点，哨兵模式都具有。
- 主从可以自动切换，系统更健壮，可用性更高(**可以看作自动版的主从复制**)。

**缺点：**

- Redis较难支持在线扩容，在集群容量达到上限时在线扩容会变得很复杂。

### Cluster 集群模式（Redis官方）

集群中并没有sentinel，如何做到高可用？

这里并没有说清楚。看这里https://cloud.tencent.com/developer/article/1592432

Redis Cluster是一种服务器 Sharding 技术，3.0版本开始正式提供。

Redis 的哨兵模式基本已经可以实现高可用，读写分离 ，但是在这种模式下每台 Redis 服务器都存储相同的数据，很浪费内存，所以在 redis3.0上加入了 Cluster 集群模式，实现了 Redis 的分布式存储，**也就是说每台 Redis 节点上存储不同的内容**。

![image-20200531184321294](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808584.png)

在这个图中，每一个蓝色的圈都代表着一个 redis 的服务器节点。它们任何两个节点之间都是相互连通的。客户端可以与任何一个节点相连接，然后就可以访问集群中的任何一个节点。对其进行存取和其他操作。

#### **集群的数据分片**

Redis 集群没有使用一致性 hash，而是引入了哈希槽【hash slot】的概念。

Redis 集群有16384 个哈希槽，每个 key 通过 CRC16 校验后对 16384 取模来决定放置哪个槽。集群的每个节点负责一部分hash槽，举个例子，比如当前集群有3个节点，那么：

- 节点 A 包含 0 到 5460 号哈希槽
- 节点 B 包含 5461 到 10922 号哈希槽
- 节点 C 包含 10923 到 16383 号哈希槽

这种结构很容易添加或者删除节点。比如如果我想新添加个节点 D ， 我需要从节点 A， B， C 中得部分槽到 D 上。如果我想移除节点 A ，需要将 A 中的槽移到 B 和 C 节点上，然后将没有任何槽的 A 节点从集群中移除即可。由于从一个节点将哈希槽移动到另一个节点并不会停止服务，所以无论添加删除或者改变某个节点的哈希槽的数量都不会造成集群不可用的状态。

在 Redis 的每一个节点上，都有这么两个东西，一个是插槽（slot），它的的取值范围是：0-16383。还有一个就是 cluster，可以理解为是一个集群管理的插件。当我们的存取的 Key到达的时候，Redis 会根据 CRC16 的算法得出一个结果，然后把结果对 16384 求余数，这样每个 key 都会对应一个编号在 0-16383 之间的哈希槽，通过这个值，去找到对应的插槽所对应的节点，然后直接自动跳转到这个对应的节点上进行存取操作。

#### Redis 集群的主从复制模型

为了保证高可用，redis-cluster集群引入了主从复制模型，一个主节点对应一个或者多个从节点，当主节点宕机的时候，就会启用从节点。当其它主节点 ping 一个主节点 A 时，如果半数以上的主节点与 A 通信超时，那么认为主节点 A 宕机了。如果主节点 A 和它的从节点 A1 都宕机了，那么该集群就无法再提供服务了。

#### **集群的特点**

- 所有的 redis 节点彼此互联(PING-PONG机制)，内部使用二进制协议优化传输速度和带宽。
- 节点的 fail 是通过集群中超过半数的节点检测失效时才生效。
- 客户端与 Redis 节点直连，不需要中间代理层.客户端不需要连接集群所有节点，连接集群中任何一个可用节点即可。

------

> 理论课结束了，不如实操下感受一下？

## 手把手体验集群配置

前提条件

- 安装 redis， 我从[Redis 官网](https://link.segmentfault.com/?enc=KULyH%2BPG3BmWq4qFIvjIhg%3D%3D.LV9e%2BRRFkTMF5LdiKwnvY4N7Co35zTsZuGlw8vaj2ukWOWMpKjOmjNZVtwkTWs%2F1)下载的最新版 redis-5.0.5
- linux 环境，我用的 centos 7.7， VM 环境

```shell
# redis 准备
$ cd /opt
$ wget http://download.redis.io/releases/redis-5.0.5.tar.gz
$ tar xzf redis-5.0.5.tar.gz
$ cd redis-5.0.5
$ make
$ make install
```

生产环境做集群一般会采用多个独立主机，这里做演示在一台虚拟机上同时运行多个节点的，这点注意一下。

### 主从复制

主要有两步

- 准备 master/slave 配置文件
- 先启动 master 再启动 slave，进行验证

##### 集群规划

| 节点   | 配置文件       | 端口 |
| ------ | -------------- | ---- |
| master | redis6379.conf | 6379 |
| slave1 | redis6380.conf | 6380 |
| slave1 | redis6381.conf | 6380 |

##### 配置文件

内容如下

```shell
# redis6379.conf    master
# 包含命令，有点复用的意思
include /opt/redis-5.0.5/redis.conf
pidfile /var/run/redis_6379.pid
port    6379
dbfilename dump6379.rdb
logfile "my-redis-6379.log"

# redis6380.conf    slave1
include /opt/redis-5.0.5/redis.conf
pidfile /var/run/redis_6380.pid
port    6380
dbfilename dump6380.rdb
logfile "my-redis-6380.log"
# 最后一行设置了主节点的 ip 端口
replicaof 127.0.0.1 6379

# redis6381.conf    slave2
include /opt/redis-5.0.5/redis.conf
pidfile /var/run/redis_6381.pid
port    6381
dbfilename dump6381.rdb
logfile "my-redis-6381.log"
# 最后一行设置了主节点的 ip 端口
replicaof 127.0.0.1 6379

## 注意 redis.conf 要调整一项，设置后台运行，对咱们操作比较友好
daemonize yes
```

![image-20200531215821358](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808585.png)

##### 启动节点

启动节点，然后查看节点信息

```shell
# 顺序启动节点
$ redis-server redis6379.conf
$ redis-server redis6380.conf
$ redis-server redis6381.conf

# 进入redis 客户端，开多个窗口查看方便些
$ redis-cli -p 6379
$ info replication
```

**info replication** 命令可以查看连接该数据库的其它库的信息，可看到有两个 slave 连接到 master

![主节点信息](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808586.png)

![从节点信息](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808587.png)

##### 数据同步验证

**在 master 节点设置值，在 slave1/slave2 节点可以查看数据同步情况**

```accesslog
# master
$ redis-cli -p 6379
127.0.0.1:6379> set k1 v1
OK

# slave1
$ redis-cli -p 6380
127.0.0.1:6380> get k1
"v1"
```

### Sentinel（哨兵）模式

上面也说了哨兵其实主动复制的自动版，所以需要先配置好主从复制，不同点在于要增加几个哨兵进行监控。

主要有两步：

- 准备主从复制集群，并启动
- 增加哨兵配置，启动验证

##### 集群规划

一般来说，哨兵模式的集群是：一主，二从，三哨兵。

那咱们就来演示一下三个哨兵的集群。

| 节点      | 配置           | 端口  |
| --------- | -------------- | ----- |
| master    | redis6379.conf | 6379  |
| slave1    | redis6380.conf | 6380  |
| slave2    | redis6381.conf | 6381  |
| sentinel1 | sentinel1.conf | 26379 |
| sentinel2 | sentinel2.conf | 26380 |
| sentinel3 | sentinel3.conf | 26381 |

##### 哨兵配置

哨兵的配置其实跟 redis.conf 有点像，可以看一下自带的 `sentinel.conf`

这里咱们创建三个哨兵文件， **哨兵文件的区别在于启动端口不同**

```smali
# 文件内容
# sentinel1.conf
port 26379
sentinel monitor mymaster 127.0.0.1 6379 1
# sentinel2.conf
port 26380
sentinel monitor mymaster 127.0.0.1 6379 1
# sentinel3.conf
port 26381
sentinel monitor mymaster 127.0.0.1 6379 1
```

![image-20200531225859175](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808590.png)

##### 启动哨兵

先把 master-slave 启动！

然后，挨个把三个都启动了

```shell
$ redis-sentinel sentinel1.conf
$ redis-sentinel sentinel2.conf
$ redis-sentinel sentinel3.conf
```

启动之后日志如下，可以看到监听到的主/从节点情况以及哨兵集群情况

![image-20200531230243940](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808588.png)

##### 主节点下线模拟

我们在 master(6379) 节点 执行 `shutdown`，然后观察哨兵会帮我做什么？

可以看到哨兵扫描到了 master 下线， 然后经过一系列判断，投票等操作重新选举了master(6381) 节点

![image-20200531230641149](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808592.png)

可以查看到，6381 已成为 master

![image-20200531231015090](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808589.png)

然后我们可以看到， 即使我们把原 master 节点恢复运行， 它也只是 slave 身份了存在了， 失去了大哥的身份， 可谓是风水轮流转了

![image-20200531231120269](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808594.png)

### Cluster 集群模式

Redis 的 Cluster 集群模式， 启动还挺简单

主要有两步

- 配置文件
- 启动验证

##### 集群规划

根据官方推荐，集群部署至少要 3 台以上的master节点，最好使用 3 主 3 从六个节点的模式。

| 节点            | 配置           | 端口 |
| --------------- | -------------- | ---- |
| cluster-master1 | redis7001.conf | 7001 |
| cluster-master2 | redis7002.conf | 7002 |
| cluster-master3 | redis7003.conf | 7003 |
| cluster-slave1  | redis7004.conf | 7004 |
| cluster-slave2  | redis7006.conf | 7005 |
| cluster-slave3  | redis7006.conf | 7006 |

##### 配置文件

咱们准备 6 个配置文件 ，端口 7001，7002，7003，7004，7005，7006

分别命名成 redis7001.conf ......redis7006.conf

redis7001.conf 配置文件内容如下(记得复制6份并替换端口号)

```shell
# 端口
port 7001  
# 启用集群模式
cluster-enabled yes 
# 根据你启用的节点来命名，最好和端口保持一致，这个是用来保存其他节点的名称，状态等信息的
cluster-config-file nodes_7001.conf 
# 超时时间
cluster-node-timeout 5000
appendonly yes
# 后台运行
daemonize yes
# 非保护模式
protected-mode no 
pidfile  /var/run/redis_7001.pid
```

##### 启动 redis 节点

- 挨个启动节点

```shell
redis-server redis7001.conf
...
redis-server redis7006.conf
```

看以下启动情况

![image-20200601002803562](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808591.png)

- 启动集群

```shell
# 执行命令
# --cluster-replicas 1 命令的意思是创建master的时候同时创建一个slave

$ redis-cli --cluster create 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 --cluste    r-replicas 1
# 执行成功结果如下
# 我们可以看到 7001，7002，7003 成为了 master 节点，
# 分别占用了 slot [0-5460]，[5461-10922]，[10923-16383]
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 127.0.0.1:7005 to 127.0.0.1:7001
Adding replica 127.0.0.1:7006 to 127.0.0.1:7002
Adding replica 127.0.0.1:7004 to 127.0.0.1:7003
>>> Trying to optimize slaves allocation for anti-affinity
[WARNING] Some slaves are in the same host as their master
M: 0313641a28e42014a48cdaee47352ce88a2ae083 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
M: 4ada3ff1b6dbbe57e7ba94fe2a1ab4a22451998e 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
M: 719b2f9daefb888f637c5dc4afa2768736241f74 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
S: 987b3b816d3d1bb07e6c801c5048b0ed626766d4 127.0.0.1:7004
   replicates 4ada3ff1b6dbbe57e7ba94fe2a1ab4a22451998e
S: a876e977fc2ff9f18765a89c12fbd2c5b5b1f3bf 127.0.0.1:7005
   replicates 719b2f9daefb888f637c5dc4afa2768736241f74
S: ac8d6c4067dec795168ca705bf16efaa5f04095a 127.0.0.1:7006
   replicates 0313641a28e42014a48cdaee47352ce88a2ae083
Can I set the above configuration? (type 'yes' to accept): yes 
# 这里有个要手动输入 yes 确认的过程
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
...
>>> Performing Cluster Check (using node 127.0.0.1:7001)
M: 0313641a28e42014a48cdaee47352ce88a2ae083 127.0.0.1:7001
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
M: 4ada3ff1b6dbbe57e7ba94fe2a1ab4a22451998e 127.0.0.1:7002
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: ac8d6c4067dec795168ca705bf16efaa5f04095a 127.0.0.1:7006
   slots: (0 slots) slave
   replicates 0313641a28e42014a48cdaee47352ce88a2ae083
S: a876e977fc2ff9f18765a89c12fbd2c5b5b1f3bf 127.0.0.1:7005
   slots: (0 slots) slave
   replicates 719b2f9daefb888f637c5dc4afa2768736241f74
M: 719b2f9daefb888f637c5dc4afa2768736241f74 127.0.0.1:7003
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
S: 987b3b816d3d1bb07e6c801c5048b0ed626766d4 127.0.0.1:7004
   slots: (0 slots) slave
   replicates 4ada3ff1b6dbbe57e7ba94fe2a1ab4a22451998e
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

![image-20200601001049144](../../../.img/redis-%E9%9B%86%E7%BE%A4%E6%A8%A1%E5%BC%8F-%E5%BE%85%E6%95%B4%E7%90%86/1460000022808593.png)

##### 数据验证

```shell
# 注意 集群模式下要带参数 -c，表示集群，否则不能正常存取数据！！！
[root@localhost redis-5.0.5]# redis-cli -p 7100 -c
# 设置 k1 v1
127.0.0.1:7001> set k1 v1
-> Redirected to slot [12706] located at 127.0.0.1:7003
OK
# 这可以看到集群的特点:把数据存到计算得出的 slot，这里还自动跳到了 7003
127.0.0.1:7003> get k1
"v1"

# 我们还回到 7001 获取 k1 试试
[root@localhost redis-5.0.5]# redis-cli -p 7001 -c
127.0.0.1:7001> get k1
-> Redirected to slot [12706] located at 127.0.0.1:7003
"v1"
# 我们可以看到重定向的过程
127.0.0.1:7003> 
```

### TODO ?