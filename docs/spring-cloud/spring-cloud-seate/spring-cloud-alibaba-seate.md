# Spring Cloud Alibaba Seate



## 分布式事务问题



### 1.1.本地事务

本地事务，也就是传统的**单机事务**。在传统数据库事务中，必须要满足四个原则：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724165045186.png" alt="image-20210724165045186" style="zoom:67%;" />



### 1.2.分布式事务

**分布式事务**，就是指不是在单个服务或单个数据库架构下，产生的事务，例如：

- 跨数据源的分布式事务
- 跨服务的分布式事务
- 综合情况



在数据库水平拆分、服务垂直拆分之后，一个业务操作通常要跨多个数据库、服务才能完成。例如电商行业中比较常见的下单付款案例，包括下面几个行为：

- 创建新订单
- 扣减商品库存
- 从用户账户余额扣除金额



完成上面的操作需要访问三个不同的微服务和三个不同的数据库。

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724165338958.png" alt="image-20210724165338958" style="zoom:67%;" />



订单的创建、库存的扣减、账户扣款在每一个服务和数据库内是一个本地事务，可以保证ACID原则。

但是当我们把三件事情看做一个"业务"，要满足保证“业务”的原子性，要么所有操作全部成功，要么全部失败，不允许出现部分成功部分失败的现象，这就是**分布式系统下的事务**了。

此时ACID难以满足，这是分布式事务要解决的问题



## 理论基础

解决分布式事务问题，需要一些分布式系统的基础知识作为理论指导。

### CAP定理

1998年，加州大学的计算机科学家 Eric Brewer 提出，分布式系统有三个指标。

> - Consistency（一致性）
> - Availability（可用性）
> - Partition tolerance （分区容错性）

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724170517944.png" alt="image-20210724170517944" style="zoom:67%" />



它们的第一个字母分别是 C、A、P。

Eric Brewer 说，这三个指标不可能同时做到。这个结论就叫做 CAP 定理。



#### 一致性

Consistency（一致性）：用户访问分布式系统中的任意节点，得到的数据必须一致。

比如现在包含两个节点，其中的初始数据是一致的：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724170704694.png" alt="image-20210724170704694" style="zoom:60%;" />

当我们修改其中一个节点的数据时，两者的数据产生了差异：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724170735847.png" alt="image-20210724170735847" style="zoom:60%" />

要想保住一致性，就必须实现node01 到 node02的数据 同步：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724170834855.png" alt="image-20210724170834855" style="zoom:60%;" />

<br>

#### 可用性

Availability （可用性）：用户访问集群中的任意健康节点，必须能得到响应，而不是超时或拒绝。

如图，有三个节点的集群，访问任何一个都可以及时得到响应：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724170932072.png" alt="image-20210724170932072" style="zoom:60%;" />

当有部分节点因为网络故障或其它原因无法访问时，代表节点不可用：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724171007516.png" alt="image-20210724171007516" style="zoom:60%;" />



#### 分区容错

**Partition（分区）**：因为网络故障或其它原因导致分布式系统中的部分节点与其它节点失去连接，形成独立分区。

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724171041210.png" alt="image-20210724171041210" style="zoom:60%;" />



**Tolerance（容错）**：在集群出现分区时，整个系统也要持续对外提供服务



#### 矛盾

在分布式系统中，系统间的网络不能100%保证健康，一定会有故障的时候，而服务有必须对外保证服务。因此Partition Tolerance不可避免。

当节点接收到新的数据变更时，就会出现问题了：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724171546472.png" alt="image-20210724171546472" style="zoom:60%;" />

如果此时要保证**一致性**，就必须等待网络恢复，完成数据同步后，整个集群才对外提供服务，服务处于阻塞状态，不可用。

如果此时要保证**可用性**，就不能等待网络恢复，那node01、node02与node03之间就会出现数据不一致。



也就是说，在P一定会出现的情况下，A和C之间只能实现一个。



### BASE理论

BASE理论是对CAP的一种解决思路，包含三个思想：

- **Basically Available** **（基本可用）**：分布式系统在出现故障时，允许损失部分可用性，即保证核心可用。
- **Soft State（软状态）：**在一定时间内，允许出现中间状态，比如临时的不一致状态。
- **Eventually Consistent（最终一致性）**：虽然无法保证强一致性，但是在软状态结束后，最终达到数据一致。



### 解决分布式事务的思路

分布式事务最大的问题是各个子事务的一致性问题，因此可以借鉴CAP定理和BASE理论，有两种解决思路：

- AP模式：各子事务分别执行和提交，允许出现结果不一致，然后采用弥补措施恢复数据即可，实现最终一致。

- CP模式：各个子事务执行后互相等待，同时提交，同时回滚，达成强一致。但事务等待过程中，处于弱可用状态。



但不管是哪一种模式，都需要在子系统事务之间互相通讯，协调事务状态，也就是需要一个**事务协调者(TC)**：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724172123567.png" alt="image-20210724172123567" style="zoom:60%;" />



这里的子系统事务，称为**分支事务**；有关联的各个分支事务在一起称为**全局事务**。











## 初识Seate

Seata是 2019 年 1 月份蚂蚁金服和阿里巴巴共同开源的分布式事务解决方案。致力于提供高性能和简单易用的分布式事务服务，为用户打造一站式的分布式解决方案。

官网地址：http://seata.io/，其中的文档、播客中提供了大量的使用说明、源码分析。



### Seata的架构

Seata事务管理中有三个重要的角色：

- **TC (Transaction Coordinator) -** **事务协调者：**维护全局和分支事务的状态，协调全局事务提交或回滚。

- **TM (Transaction Manager) -** **事务管理器：**定义全局事务的范围、开始全局事务、提交或回滚全局事务。

- **RM (Resource Manager) -** **资源管理器：**管理分支事务处理的资源，与TC交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。



整体的架构如图：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724172326452.png" alt="image-20210724172326452" style="zoom:60%;" />



Seata基于上述架构提供了四种不同的分布式事务解决方案：

- XA模式：强一致性分阶段事务模式，牺牲了一定的可用性，无业务侵入
- TCC模式：最终一致的分阶段事务模式，有业务侵入
- AT模式：最终一致的分阶段事务模式，无业务侵入，也是Seata的默认模式
- SAGA模式：长事务模式，有业务侵入

无论哪种方案，都离不开TC，也就是事务的协调者。





## Seate的部署和集成

### 部署TC服务

略



### 集成Seate

略









## Seate中的事物模型

### XA模式

XA 规范 是 X/Open 组织定义的分布式事务处理（DTP，Distributed Transaction Processing）标准，XA 规范 描述了全局的TM与局部的RM之间的接口，几乎所有主流的数据库都对 XA 规范 提供了支持。



#### 两阶段提交

XA是规范，目前主流数据库都实现了这种规范，实现的原理都是基于两阶段提交。

正常情况：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724174102768.png" alt="image-20210724174102768" style="zoom: 67%; " />

异常情况：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724174234987.png" alt="image-20210724174234987" style="zoom:67%;" />



一阶段：

- 事务协调者通知每个事物参与者执行本地事务
- 本地事务执行完成后报告事务执行状态给事务协调者，此时事务不提交，继续持有数据库锁

二阶段：

- 事务协调者基于一阶段的报告来判断下一步操作
  - 如果一阶段都成功，则通知所有事务参与者，提交事务
  - 如果一阶段任意一个参与者失败，则通知所有事务参与者回滚事务



### 4.1.2.Seata的XA模型

Seata对原始的XA模式做了简单的封装和改造，以适应自己的事务模型，基本架构如图：

<img src="./.spring-cloud-alibaba-seate.assets/image-20210724174424070.png" alt="image-20210724174424070" style="zoom:67%;" />



RM一阶段的工作：

​	① 注册分支事务到TC

​	② 执行分支业务sql但不提交

​	③ 报告执行状态到TC

TC二阶段的工作：

- TC检测各分支事务执行状态

  a.如果都成功，通知所有RM提交事务

  b.如果有失败，通知所有RM回滚事务

RM二阶段的工作：

- 接收TC指令，提交或回滚事务





### 4.1.3.优缺点

XA模式的优点是什么？

- 事务的强一致性，满足ACID原则。
- 常用数据库都支持，实现简单，并且没有代码侵入

XA模式的缺点是什么？

- 因为一阶段需要锁定数据库资源，等待二阶段结束才释放，性能较差
- 依赖关系型数据库实现事务





























































































































































嘁嘁嘁请求