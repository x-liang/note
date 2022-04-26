# MySQL



## 进阶篇-存储引擎

### MySQL体系结构

<img src=".image/mysql/image-20220426093437386.png" alt="image-20220426093437386" style="zoom: 50%;" />

- 连接层

最上层是一些客户端和链接服务，包含本地sock 通信和大多数基于客户端/服务端工具实现的类似于TCP/IP的通信。主要完成一些类似于连接处理、授权认证、及相关的安全方案。在该层上引入了线程池的概念，为通过认证安全接入的客户端提供线程。同样在该层上可以实现基于SSL的安全链接。服务器也会为安全接入的每个客户端验证它所具有的操作权限。

- 服务层

第二层架构主要完成大多数的核心服务功能，如SQL接口，并完成缓存的查询，SQL的分析和优化，部分内置函数的执行。所有跨存储引擎的功能也在这一层实现，如 过程、函数等。在该层，服务器会解析查询并创建相应的内部解析树，并对其完成相应的优化如确定表的查询的顺序，是否利用索引等，最后生成相应的执行操作。如果是select语句，服务器还会查询内部的缓存，如果缓存空间足够大，这样在解决大量读操作的环境中能够很好的提升系统的性能。

- 引擎层

存储引擎层， 存储引擎真正的负责了MySQL中数据的存储和提取，服务器通过API和存储引擎进行通信。不同的存储引擎具有不同的功能，这样我们可以根据自己的需要，来选取合适的存储引擎。数据库中的索引是在存储引擎层实现的。

- 存储层

数据存储层， 主要是将数据(如: redolog、undolog、数据、索引、二进制日志、错误日志、查询日志、慢查询日志等)存储在文件系统之上，并完成与存储引擎的交互。

### MySQL存储引擎介绍

存储引擎就是存储数据、建立索引、更新/查询数据等技术的实现方式 。存储引擎是基于表的，而不是基于库的，所以存储引擎也可被称为表类型。我们可以在创建表的时候，来指定选择的存储引擎，如果没有指定将自动选择默认的存储引擎。

查询当前数据库支持的存储引擎

```sql
show engines;
```

创建表时指定存储引擎

```sql
CREATE TABLE name( 
	字段1 字段1类型 [ COMMENT 字段1注释 ] , 
	...... 
	字段n 字段n类型 [COMMENT 字段n注释 ] 
) ENGINE = INNODB [ COMMENT 表注释 ] ;
```



### 存储引擎的特点

#### InnoDB

InnoDB是一种兼顾高可靠性和高性能的通用存储引擎，在 MySQL 5.5 之后，InnoDB是默认的MySQL 存储引擎。

##### **特点**

- DML操作遵循ACID模型，支持事务；
- 行级锁，提高并发访问性能；

- 支持外键FOREIGN KEY约束，保证数据的完整性和正确性；



##### **文件**

xxx.ibd：xxx代表的是表名，innoDB引擎的每张表都会对应这样一个表空间文件，存储该表的表结构（frm-早期的 、sdi-新版的）、数据和索引。

参数：innodb_file_per_table

```
show variables like 'innodb_file_per_table';
```

<img src=".image/mysql/image-20220426095518142.png" alt="image-20220426095518142" style="zoom:50%;float:left" />

如果该参数开启，代表对于InnoDB引擎的表，每一张表都对应一个ibd文件。 我们直接打开MySQL的数据存放目录： C:\ProgramData\MySQL\MySQL Server 8.0\Data ， 这个目录下有很多文件夹，不同的文件夹代表不同的数据库，我们直接打开itcast文件夹。

<img src=".image/mysql/image-20220426095639059.png" alt="image-20220426095639059" style="zoom:50%;float:left" />

可以看到里面有很多的ibd文件，每一个ibd文件就对应一张表，比如：我们有一张表 account，就有这样的一个account.ibd文件，而在这个ibd文件中不仅存放表结构、数据，还会存放该表对应的索引信息。 而该文件是基于二进制存储的，不能直接基于记事本打开，我们可以使用mysql提供的一个指令 ibd2sdi ，通过该指令就可以从ibd文件中提取sdi信息，而sdi数据字典信息中就包含该表的表结构。

##### 存储逻辑

![image-20220426095957217](.image/mysql/image-20220426095957217.png)

- 表空间 : InnoDB存储引擎逻辑结构的最高层，ibd文件其实就是表空间文件，在表空间中可以包含多个Segment段。

- 段 : 表空间是由各个段组成的， 常见的段有数据段、索引段、回滚段等。InnoDB中对于段的管理，都是引擎自身完成，不需要人为对其控制，一个段中包含多个区。

- 区 : 区是表空间的单元结构，每个区的大小为1M。 默认情况下， InnoDB存储引擎页大小为16K， 即一个区中一共有64个连续的页。

- 页 : 页是组成区的最小单元，**页也是****InnoDB** **存储引擎磁盘管理的最小单元**，每个页的大小默认为 16KB。为了保证页的连续性，InnoDB 存储引擎每次从磁盘申请 4-5 个区。

- 行 : InnoDB 存储引擎是面向行的，也就是说数据是按行进行存放的，在每一行中除了定义表时所指定的字段以外，还包含两个隐藏字段



#### **MyISAM**

MyISAM是MySQL早期的默认存储引擎。

##### 特点

不支持事务，不支持外键

支持表锁，不支持行锁

访问速度快

##### 文件

xxx.sdi：存储表结构信息

xxx.MYD: 存储数据

xxx.MYI: 存储索引

<img src=".image/mysql/image-20220426101050220.png" alt="image-20220426101050220" style="zoom:50%;float:left" />

#### Memory

Memory引擎的表数据时存储在内存中的，由于受到硬件问题、或断电问题的影响，只能将这些表作为临时表或缓存使用。

##### 特点

内存存放，hash索引（默认）

##### 文件

xxx.sdi：存储表结构信息



#### 区别及特点



### 存储引擎的选择

在选择存储引擎时，应该根据应用系统的特点选择合适的存储引擎。对于复杂的应用系统，还可以根据实际情况选择多种存储引擎进行组合。

- InnoDB: 是Mysql的默认存储引擎，支持事务、外键。如果应用对事务的完整性有比较高的要求，在并发条件下要求数据的一致性，数据操作除了插入和查询之外，还包含很多的更新、删除操作，那么InnoDB存储引擎是比较合适的选择。

- MyISAM ： 如果应用是以读操作和插入操作为主，只有很少的更新和删除操作，并且对事务的完整性、并发性要求不是很高，那么选择这个存储引擎是非常合适的。

- MEMORY：将所有数据保存在内存中，访问速度快，通常用于临时表及缓存。MEMORY的缺陷就是对表的大小有限制，太大的表无法缓存在内存中，而且无法保障数据的安全性。







## 进阶篇-索引

索引（index）是帮助MySQL高效获取数据的数据结构(有序)。在数据之外，数据库系统还维护着满足特定查找算法的数据结构，这些数据结构以某种方式引用（指向）数据， 这样就可以在这些数据结构上实现高级查找算法，这种数据结构就是索引。

| 优势                                                         | 劣势                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 提高数据检索的效率，降低数据库的IO成本                       | 索引列也是要占用空间的。                                     |
| 通过索引列对数据进行排序，降低数据排序的成本，降低CPU的消耗。 | 索引大大提高了查询效率，同时却也降低更新表的速度，如对表进行INSERT、UPDATE、DELETE时，效率降低。 |

### 索引结构

MySQL的索引是在存储引擎层实现的，不同的存储引擎有不同的索引结构，主要包含以下几种：

| **索引结构**        | **描述**                                                     |
| ------------------- | ------------------------------------------------------------ |
| B+Tree索引          | 最常见的索引类型，大部分引擎都支持 B+ 树索引                 |
| Hash索引            | 底层数据结构是用哈希表实现的, 只有精确匹配索引列的查询才有效, 不支持范围查询 |
| R-tree(空间索引）   | 空间索引是MyISAM引擎的一个特殊索引类型，主要用于地理空间数据类型，通常使用较少 |
| Full-text(全文索引) | 是一种通过建立倒排索引,快速匹配文档的方式。类似于Lucene,Solr,ES |

上述是MySQL中所支持的所有的索引结构，接下来，我们再来看看不同的存储引擎对于索引结构的支持情况。

| 索引       | InnoDB          | MyISAM | Memory |
| ---------- | --------------- | ------ | ------ |
| B+tree索引 | 支持            | 支持   | 支持   |
| Hash索引   | 不支持          | 不支持 | 支持   |
| R-tree索引 | 不支持          | 支持   | 不支持 |
| Full-text  | 5.6版本之后支持 | 支持   | 不支持 |



#### 二叉树

假如说MySQL的索引结构采用二叉树的数据结构，比较理想的结构如下：

<img src=".image/mysql/image-20220426125410635.png" alt="image-20220426125410635" style="zoom:33%;float:left" />

如果主键是顺序插入的，则会形成一个单向链表，结构如下：

<img src=".image/mysql/image-20220426125454233.png" alt="image-20220426125454233" style="zoom:33%;float:left" />

所以，如果选择二叉树作为索引结构，会存在以下缺点：

- 顺序插入时，会形成一个链表，查询性能大大降低。

- 大数据量情况下，层级较深，检索速度慢。

此时大家可能会想到，我们可以选择红黑树，红黑树是一颗自平衡二叉树，那这样即使是顺序插入数据，最终形成的数据结构也是一颗平衡的二叉树,结构如下:

<img src=".image/mysql/image-20220426125558905.png" alt="image-20220426125558905" style="zoom:33%;float:left" />

但是，即使如此，由于红黑树也是一颗二叉树，所以也会存在一个缺点：

- 大数据量情况下，层级较深，检索速度慢。

所以，在MySQL的索引结构中，并没有选择二叉树或者红黑树，而选择的是B+Tree，那么什么是B+Tree呢？在详解B+Tree之前，先来介绍一个B-Tree。 



#### B-Tree

B-Tree，B树是一种多叉路衡查找树，相对于二叉树，B树每个节点可以有多个分支，即多叉。以一颗最大度数（max-degree）为5(5阶)的b-tree为例，那这个B树每个节点最多存储4个key，5个指针：

<img src=".image/mysql/image-20220426125715435.png" alt="image-20220426125715435" style="zoom:40%;float:left" />



特点：

- 5阶的B树，每一个节点最多存储4个key，对应5个指针。

- 一旦节点存储的key数量到达5，就会裂变，中间元素向上分裂。

- 在B树中，非叶子节点和叶子节点都会存放数据。



#### B+Tree

B+Tree是B-Tree的变种，我们以一颗最大度数（max-degree）为4（4阶）的b+tree为例，来看一下其结构示意图：

<img src=".image/mysql/image-20220426125836198.png" alt="image-20220426125836198" style="zoom:50%;float:left" />

我们可以看到，两部分：

- 绿色框框起来的部分，是索引部分，仅仅起到索引数据的作用，不存储数据。

- 红色框框起来的部分，是数据存储部分，在其叶子节点中要存储具体的数据。



最终我们看到，B+Tree 与 B-Tree相比，主要有以下三点区别：

- 所有的数据都会出现在叶子节点。

- 叶子节点形成一个单向链表。

- 非叶子节点仅仅起到索引数据作用，具体的数据都是在叶子节点存放的。



上述我们所看到的结构是标准的B+Tree的数据结构，接下来，我们再来看看MySQL中优化之后的B+Tree。

MySQL索引数据结构对经典的B+Tree进行了优化。在原B+Tree的基础上，增加一个指向相邻叶子节点的链表指针，就形成了带有顺序指针的B+Tree，提高区间访问的性能，利于排序。

<img src=".image/mysql/image-20220426130002472.png" alt="image-20220426130002472" style="zoom:50%;float:left" />

#### Hash

MySQL中除了支持B+Tree索引，还支持一种索引类型---Hash索引。

##### 结构

哈希索引就是采用一定的hash算法，将键值换算成新的hash值，映射到对应的槽位上，然后存储在hash表中。

<img src=".image/mysql/image-20220426130112307.png" alt="image-20220426130112307" style="zoom:50%;float:left" />

如果两个(或多个)键值，映射到一个相同的槽位上，他们就产生了hash冲突（也称为hash碰撞），可以通过链表来解决。

<img src=".image/mysql/image-20220426130147436.png" alt="image-20220426130147436" style="zoom:50%;float:left" />

##### 特点

- Hash索引只能用于对等比较(=，in)，不支持范围查询（between，>，< ，...）

- 无法利用索引完成排序操作

- 查询效率高，通常(不存在hash冲突的情况)只需要一次检索就可以了，效率通常要高于B+tree索引

##### 存储引擎支持

在MySQL中，支持hash索引的是Memory存储引擎。 而InnoDB中具有自适应hash功能，hash索引是InnoDB存储引擎根据B+Tree索引在指定条件下自动构建的。



> 思考题： 为什么InnoDB存储引擎选择使用B+tree索引结构?
>
> - 相对于二叉树，层级更少，搜索效率高；
>
> - 对于B-tree，无论是叶子节点还是非叶子节点，都会保存数据，这样导致一页中存储的键值减少，指针跟着减少，要同样保存大量数据，只能增加树的高度，导致性能降低；
>
> - 相对Hash索引，B+tree支持范围匹配及排序操作；

### 索引分类

在MySQL数据库，将索引的具体类型主要分为以下几类：主键索引、唯一索引、常规索引、全文索引。

| 分类     | 含义                                                 | 特点                     | 关键字   |
| -------- | ---------------------------------------------------- | ------------------------ | -------- |
| 主键索引 | 针对与表中主键穿件的索引                             | 默认自动创建, 只能有一个 | PRIMARY  |
| 唯一索引 | 避免同一个表中某数据列中的值重复                     | 可以有多个               | UNIQUE   |
| 常规索引 | 快速定位特定数据                                     | 可以有多个               |          |
| 全文索引 | 全文索引查找的是文本中的关键词，而不是比较索引中的值 | 可以有多个               | FULLTEXT |



#### 聚集索引&二级索引

而在在InnoDB存储引擎中，根据索引的存储形式，又可以分为以下两种：

| 分类                      | 含有                                                       | 特点                |
| ------------------------- | ---------------------------------------------------------- | ------------------- |
| 聚集索引(Clustered Index) | 将数据存储与索引放到了一块，索引结构的叶子节点保存了行数据 | 必须有,而且只有一个 |
| 二级索引(Secondary Index) | 将数据与索引分开存储，索引结构的叶子节点关联的是对应的主键 | 可以存在多个        |

聚集索引选取规则:

- 如果存在主键，主键索引就是聚集索引。
- 如果不存在主键，将使用第一个唯一（UNIQUE）索引作为聚集索引。
- 如果表没有主键，或没有合适的唯一索引，则InnoDB会自动生成一个rowid作为隐藏的聚集索引。

聚集索引和二级索引的具体结构如下：

<img src=".image/mysql/image-20220426132101688.png" alt="image-20220426132101688" style="zoom:50%;float:left" />

- 聚集索引的叶子节点下挂的是这一行的数据 。

- 二级索引的叶子节点下挂的是该字段值对应的主键值



接下来，我们来分析一下，当我们执行如下的SQL语句时，具体的查找过程是什么样子的。

<img src=".image/mysql/image-20220426132221890.png" alt="image-20220426132221890" style="zoom:50%;float:left" />

具体过程如下: 

①. 由于是根据name字段进行查询，所以先根据name='Arm'到name字段的二级索引中进行匹配查找。但是在二级索引中只能查找到 Arm 对应的主键值 10。

②. 由于查询返回的数据是*，所以此时，还需要根据主键值10，到聚集索引中查找10对应的记录，最终找到10对应的行row。 

③. 最终拿到这一行的数据，直接返回即可。

> **回表查询**： 这种先到二级索引中查找数据，找到主键值，然后再到聚集索引中根据主键值，获取数据的方式，就称之为回表查询。
>
> 
>
> **思考题：**
>
> 以下两条SQL语句，那个执行效率高? 为什么?
>
> A. select * from user where id = 10 ;
>
> B. select * from user where name = 'Arm' ;
>
> 备注: id为主键，name字段创建的有索引；
>
> 解答：
>
> A 语句的执行性能要高于B 语句。因为A语句直接走聚集索引，直接返回数据。 而B语句需要先查询name字段的二级索引，然后再查询聚集索引，也就是需要进行回表查询。
>
> 
>
> **思考题：**
>
> InnoDB主键索引的B+tree高度为多高呢?
>
> 假设:
>
> 一行数据大小为1k，一页中可以存储16行这样的数据。InnoDB的指针占用6个字节的空间，主键即使为bigint，占用字节数为8。
>
> 高度为2：
>
> n * 8 + (n + 1) * 6 = 16*1024 , 算出n约为 1170
>
> 1171* 16 = 18736
>
> 也就是说，如果树的高度为2，则可以存储 18000 多条记录。
>
> 高度为3：
>
> 1171 * 1171 * 16 = 21939856
>
> 也就是说，如果树的高度为3，则可以存储 2200w 左右的记录。

### 索引语法

创建索引

```sql
CREATE [ UNIQUE | FULLTEXT ] INDEX index_name ON table_name ( index_col_name,... ) ;
```

查看索引

```sql
SHOW INDEX FROM table_name ;
```

 删除索引

```sql
DROP INDEX index_name ON table_name ;
```

### SQL性能分析

#### SQL执行频率

MySQL 客户端连接成功后，通过 show [session|global] status 命令可以提供服务器状态信息。通过如下指令，可以查看当前数据库的INSERT、UPDATE、DELETE、SELECT的访问频次：

```sql
-- session 是查看当前会话 ; 
-- global 是查询全局数据 ; 
SHOW GLOBAL STATUS LIKE 'Com_______'; 
```

<img src=".image/mysql/image-20220426133035695.png" alt="image-20220426133035695" style="zoom:50%;float:left" />

Com_delete: 删除次数

Com_insert: 插入次数

Com_select: 查询次数

Com_update: 更新次数

> 通过上述指令，我们可以查看到当前数据库到底是以查询为主，还是以增删改为主，从而为数据库优化提供参考依据。 如果是以增删改为主，我们可以考虑不对其进行索引的优化。 如果是以查询为主，那么就要考虑对数据库的索引进行优化了。

#### 慢查询日志

慢查询日志记录了所有执行时间超过指定参数（long_query_time，单位：秒，默认10秒）的所有SQL语句的日志。

MySQL的慢查询日志默认没有开启，我们可以查看一下系统变量 slow_query_log。

<img src=".image/mysql/image-20220426133244664.png" alt="image-20220426133244664" style="zoom:50%;float:left" />

如果要开启慢查询日志，需要在MySQL的配置文件（/etc/my.cnf）中配置如下信息：

```properties
# 开启MySQL慢日志查询开关 
slow_query_log=1 
# 设置慢日志的时间为2秒，SQL语句执行时间超过2秒，就会视为慢查询，记录慢查询日志 
long_query_time=2
```

配置完毕之后，通过以下指令重新启动MySQL服务器进行测试，查看慢日志文件中记录的信息/var/lib/mysql/localhost-slow.log。

```shell
systemctl restart mysqld
```

然后，再次查看开关情况，慢查询日志就已经打开了。



**测试**

执行如下SQL语句 ：

```
select * from tb_user; -- 这条SQL执行效率比较高, 执行耗时 0.00sec
select count(*) from tb_sku; -- 由于tb_sku表中, 预先存入了1000w的记录, count一次,耗时 13.35sec
```

<img src=".image/mysql/image-20220426133553213.png" alt="image-20220426133553213" style="zoom:50%;float:left" />

**检查慢查询日志**

最终我们发现，在慢查询日志中，只会记录执行时间超多我们预设时间（2s）的SQL，执行较快的SQL是不会记录的。那这样，通过慢查询日志，就可以定位出执行效率比较低的SQL，从而有针对性的进行优化。

<img src=".image/mysql/image-20220426133716953.png" alt="image-20220426133716953" style="zoom:50%;float:left" />



 

#### profile详情

show profiles 能够在做SQL优化时帮助我们了解时间都耗费到哪里去了。通过have_profiling参数，能够看到当前MySQL是否支持profile操作：

```sql
SELECT @@have_profiling ;
```

<img src=".image/mysql/image-20220426133851894.png" alt="image-20220426133851894" style="zoom:50%;float:left" />

可以看到，当前MySQL是支持 profile操作的，但是开关是关闭的。可以通过set语句在session/global级别开启profiling：

```sql
SET profiling = 1;
```

开关已经打开了，接下来，我们所执行的SQL语句，都会被MySQL记录，并记录执行时间消耗到哪儿去了。 我们直接执行如下的SQL语句：

```sql
select * from tb_user; 
select * from tb_user where id = 1; 
select * from tb_user where name = '白起'; 
select count(*) from tb_sku;
```

执行一系列的业务SQL的操作，然后通过如下指令查看指令的执行耗时：

```sql
-- 查看每一条SQL的耗时基本情况 
show profiles; 
-- 查看指定query_id的SQL语句各个阶段的耗时情况 
show profile for query query_id; 
-- 查看指定query_id的SQL语句CPU的使用情况 
show profile cpu for query query_id;
```

查看每一条SQL的耗时情况: 

<img src=".image/mysql/image-20220426134116001.png" alt="image-20220426134116001" style="zoom:50%;float:left" />

查看指定SQL各个阶段的耗时情况 :

<img src=".image/mysql/image-20220426134155085.png" alt="image-20220426134155085" style="zoom:50%;float:left" />

#### explain

EXPLAIN 或者 DESC命令获取 MySQL 如何执行 SELECT 语句的信息，包括在 SELECT 语句执行过程中表如何连接和连接的顺序。

语法:

```sql
-- 直接在select语句之前加上关键字 
explain / desc EXPLAIN SELECT 字段列表 FROM 表名 WHERE 条件 ;
```

<img src=".image/mysql/image-20220426134818605.png" alt="image-20220426134818605" style="zoom:50%;float:left" />

Explain 执行计划中各个字段的含义:

| 字段         | 含义                                                         |
| ------------ | ------------------------------------------------------------ |
| id           | select查询的序列号，表示查询中执行select子句或者是操作表的顺序(id相同，执行顺序从上到下；id不同，值越大，越先执行)。 |
| select_type  | 表示 SELECT 的类型，常见的取值有 SIMPLE（简单表，即不使用表连接或者子查询）、PRIMARY（主查询，即外层的查询）、UNION（UNION 中的第二个或者后面的查询语句）、SUBQUERY（SELECT/WHERE之后包含了子查询）等 |
| type         | 表示连接类型，性能由好到差的连接类型为NULL、system、const、eq_ref、ref、range、 index、all 。 |
| possible_key | 显示可能应用在这张表上的索引，一个或多个。                   |
| key          | 实际使用的索引，如果为NULL，则没有使用索引。                 |
| key_len      | 表示索引中使用的字节数， 该值为索引字段最大可能长度，并非实际使用长度，在不损失精确性的前提下， 长度越短越好 。 |
| rows         | MySQL认为必须要执行查询的行数，在innodb引擎的表中，是一个估计值，可能并不总是准确的。 |
| filtered     | 表示返回结果的行数占需读取行数的百分比， filtered 的值越大越好。 |

### 索引使用

#### 最左前缀法则

如果索引了多列（联合索引），要遵守最左前缀法则。最左前缀法则指的是查询从索引的最左列开始，并且不跳过索引中的列。如果跳跃某一列，索引将会部分失效(后面的字段索引失效)。 

以 tb_user 表为例，我们先来查看一下之前 tb_user 表所创建的索引。

<img src=".image/mysql/image-20220426135255321.png" alt="image-20220426135255321" style="zoom:50%;float:left" />

在 tb_user 表中，有一个联合索引，这个联合索引涉及到三个字段，顺序分别为：profession，age，status。

对于最左前缀法则指的是，查询时，最左变的列，也就是profession必须存在，否则索引全部失效。而且中间不能跳过某一列，否则该列后面的字段索引将失效。 接下来，我们来演示几组案例，看一下

具体的执行计划：

```sql
explain select * from tb_user where profession = '软件工程' and age = 31 and status = '0';
```

<img src=".image/mysql/image-20220426135401081.png" alt="image-20220426135401081" style="zoom:50%;float:left" />

```sql
explain select * from tb_user where profession = '软件工程' and age = 31;
```

<img src=".image/mysql/image-20220426135541380.png" alt="image-20220426135541380" style="zoom:50%;float:left" />

```sql
explain select * from tb_user where profession = '软件工程';
```

<img src=".image/mysql/image-20220426135632221.png" alt="image-20220426135632221" style="zoom:50%;float:left" />

以上的这三组测试中，我们发现只要联合索引最左边的字段 profession存在，索引就会生效，只不过索引的长度不同。 而且由以上三组测试，我们也可以推测出profession字段索引长度为47、age字段索引长度为2、status字段索引长度为5。

```sql
explain select * from tb_user where age = 31 and status = '0'; 
```

<img src=".image/mysql/image-20220426135730402.png" alt="image-20220426135730402" style="zoom:50%;float:left" />

```sql
explain select * from tb_user where status = '0';
```

<img src=".image/mysql/image-20220426135807560.png" alt="image-20220426135807560" style="zoom:50%;float:left" />

而通过上面的这两组测试，我们也可以看到索引并未生效，原因是因为不满足最左前缀法则，联合索引最左边的列profession不存在。

```sql
explain select * from tb_user where profession = '软件工程' and status = '0';
```

<img src=".image/mysql/image-20220426135900534.png" alt="image-20220426135900534" style="zoom:50%;float:left" />

上述的SQL查询时，存在profession字段，最左边的列是存在的，索引满足最左前缀法则的基本条件。但是查询时，跳过了age这个列，所以后面的列索引是不会使用的，也就是索引部分生效，所以索引的长度就是47。



> 思考题：
>
> 当执行SQL语句: explain select * from tb_user where age = 31 and status = '0' and profession = '软件工程'； 时，是否满足最左前缀法则，走不走上述的联合索引，索引长度？
>
> <img src=".image/mysql/image-20220426140032442.png" alt="image-20220426140032442" style="zoom:50%;float:left" />
>
> 可以看到，是完全满足最左前缀法则的，索引长度54，联合索引是生效的。
>
> 注意 ： 最左前缀法则中指的最左边的列，是指在查询时，联合索引的最左边的字段(即是第一个字段)必须存在，与我们编写SQL时，条件编写的先后顺序无关。



#### 范围查询

联合索引中，出现范围查询(>,<)，范围查询右侧的列索引失效。

```
explain select * from tb_user where profession = '软件工程' and age > 30 and status = '0';
```

<img src=".image/mysql/image-20220426140210209.png" alt="image-20220426140210209" style="zoom:50%;float:left" />

当范围查询使用> 或 < 时，走联合索引了，但是索引的长度为49，就说明范围查询右边的status字段是没有走索引的。

```
explain select * from tb_user where profession = '软件工程' and age >= 30 and status = '0';
```

所以，在业务允许的情况下，尽可能的使用类似于 >= 或 <= 这类的范围查询，而避免使用 > 或 < 。 



#### 索引失效情况

#####  索引列运算

不要在索引列上进行运算操作， 索引将失效。

在tb_user表中，除了前面介绍的联合索引之外，还有一个索引，是phone字段的单列索引。



当根据phone字段进行等值匹配查询时, 索引生效。

```sql
explain select * from tb_user where phone = '17799990015';
```

<img src=".image/mysql/image-20220426140525159.png" alt="image-20220426140525159" style="zoom:50%;float:left" />

当根据phone字段进行函数运算操作之后，索引失效。

```
explain select * from tb_user where substring(phone,10,2) = '15';
```

<img src=".image/mysql/image-20220426140602887.png" alt="image-20220426140602887" style="zoom:50%;float:left" />



#####  字符串不加引号

字符串类型字段使用时，不加引号，索引将失效。

接下来，我们通过两组示例，来看看对于字符串类型的字段，加单引号与不加单引号的区别：

```sql
explain select * from tb_user where profession = '软件工程' and age = 31 and status = '0'; 
explain select * from tb_user where profession = '软件工程' and age = 31 and status = 0;
```

<img src=".image/mysql/image-20220426140707371.png" alt="image-20220426140707371" style="zoom:50%;float:left" />

```
explain select * from tb_user where phone = '17799990015';
explain select * from tb_user where phone = 17799990015;
```

<img src=".image/mysql/image-20220426140843786.png" alt="image-20220426140843786" style="zoom:50%;float:left" />

经过上面两组示例，我们会明显的发现，如果字符串不加单引号，对于查询结果，没什么影响，但是数据库存在隐式类型转换，索引将失效。

##### 模糊查询

如果仅仅是尾部模糊匹配，索引不会失效。如果是头部模糊匹配，索引失效。

接下来，我们来看一下这三条SQL语句的执行效果，查看一下其执行计划：

由于下面查询语句中，都是根据profession字段查询，符合最左前缀法则，联合索引是可以生效的，我们主要看一下，模糊查询时，%加在关键字之前，和加在关键字之后的影响。

```
explain select * from tb_user where profession like '软件%'; 
explain select * from tb_user where profession like '%工程'; 
explain select * from tb_user where profession like '%工%';
```

<img src=".image/mysql/image-20220426141016243.png" alt="image-20220426141016243" style="zoom:50%;float:left" />

经过上述的测试，我们发现，在like模糊查询中，在关键字后面加%，索引可以生效。而如果在关键字前面加了%，索引将会失效。

##### or连接条件

用or分割开的条件， 如果or前的条件中的列有索引，而后面的列中没有索引，那么涉及的索引都不会被用到。

```
explain select * from tb_user where id = 10 or age = 23; 
explain select * from tb_user where phone = '17799990017' or age = 23; 
```

<img src=".image/mysql/image-20220426141147408.png" alt="image-20220426141147408" style="zoom:50%;float:left" />

由于age没有索引，所以即使id、phone有索引，索引也会失效。所以需要针对于age也要建立索引。

然后，我们可以对age字段建立索引。

```
create index idx_user_age on tb_user(age);
```

建立了索引之后，我们再次执行上述的SQL语句，看看前后执行计划的变化。

<img src=".image/mysql/image-20220426141312971.png" alt="image-20220426141312971" style="zoom:50%;float:left" />

最终，我们发现，当or连接的条件，左右两侧字段都有索引时，索引才会生效。

##### 数据分布影响

如果MySQL评估使用索引比全表更慢，则不使用索引。

```
select * from tb_user where phone >= '17799990005'; 
select * from tb_user where phone >= '17799990015';
```

<img src=".image/mysql/image-20220426141420100.png" alt="image-20220426141420100" style="zoom:50%;float:left" />

经过测试我们发现，相同的SQL语句，只是传入的字段值不同，最终的执行计划也完全不一样，这是为什么呢？

就是因为MySQL在查询时，会评估使用索引的效率与走全表扫描的效率，如果走全表扫描更快，则放弃索引，走全表扫描。 因为索引是用来索引少量数据的，如果通过索引查询返回大批量的数据，则还不如走全表扫描来的快，此时索引就会失效。

接下来，我们再来看看 is null 与 is not null 操作是否走索引。

执行如下两条语句 ：

```
explain select * from tb_user where profession is null; 
explain select * from tb_user where profession is not null;
```

<img src=".image/mysql/image-20220426141550959.png" alt="image-20220426141550959" style="zoom:50%;float:left" />

接下来，我们做一个操作将profession字段值全部更新为null。然后，再次执行上述的两条SQL，查看SQL语句的执行计划。

<img src=".image/mysql/image-20220426141639442.png" alt="image-20220426141639442" style="zoom:50%;float:left" />

最终我们看到，一模一样的SQL语句，先后执行了两次，结果查询计划是不一样的，为什么会出现这种现象，这是和数据库的数据分布有关系。查询时MySQL会评估，走索引快，还是全表扫描快，如果全表扫描更快，则放弃索引走全表扫描。 因此，is null 、is not null是否走索引，得具体情况具体分析，并不是固定的。

#### SQL提示

目前tb_user表的数据情况如下:

<img src=".image/mysql/image-20220426142000554.png" alt="image-20220426142000554" style="zoom:50%;float:left" />

索引情况如下:

<img src=".image/mysql/image-20220426142104568.png" alt="image-20220426142104568" style="zoom:50%;float:left" />

把上述的 idx_user_age, idx_email 这两个之前测试使用过的索引直接删除。

```
drop index idx_user_age on tb_user; 
drop index idx_email on tb_user;
```

执行SQL : explain select * from tb_user where profession = '软件工程';

<img src=".image/mysql/image-20220426144116562.png" alt="image-20220426144116562" style="zoom:50%;float:left" />

查询走了联合索引。

执行SQL，创建profession的单列索引：create index idx_user_pro on tb_user(profession);

创建单列索引后，再次执行A中的SQL语句，查看执行计划，看看到底走哪个索引。

<img src=".image/mysql/image-20220426144253275.png" alt="image-20220426144253275" style="zoom:50%;float:left" />

测试结果，我们可以看到，possible_keys中 idx_user_pro_age_sta,idx_user_pro 这两个索引都可能用到，最终MySQL选择了idx_user_pro_age_sta索引。这是MySQL自动选择的结果。

那么，我们能不能在查询的时候，自己来指定使用哪个索引呢？ 答案是肯定的，此时就可以借助于MySQL的SQL提示来完成。 接下来，介绍一下SQL提示。

SQL提示，是优化数据库的一个重要手段，简单来说，就是在SQL语句中加入一些人为的提示来达到优化操作的目的。

1). use index ： 建议MySQL使用哪一个索引完成此次查询（仅仅是建议，mysql内部还会再次进行评估）。

```
explain select * from tb_user use index(idx_user_pro) where profession = '软件工程';
```

2). ignore index ： 忽略指定的索引。

```
explain select * from tb_user ignore index(idx_user_pro) where profession = '软件工程';
```

3). force index ： 强制使用索引。

```
explain select * from tb_user force index(idx_user_pro) where profession = '软件工程';
```



#### 覆盖索引

尽量使用覆盖索引，减少select *。 那么什么是覆盖索引呢？ 覆盖索引是指 查询使用了索引，并且需要返回的列，在该索引中已经全部能够找到 。

接下来，我们来看一组SQL的执行计划，看看执行计划的差别，然后再来具体做一个解析。

```
explain select id, profession from tb_user where profession = '软件工程' and age = 31 and status = '0' ; 
explain select id,profession,age, status from tb_user where profession = '软件工程' and age = 31 and status = '0' ; 
explain select id,profession,age, status, name from tb_user where profession = '软 件工程' and age = 31 and status = '0' ;
explain select * from tb_user where profession = '软件工程' and age = 31 and status = '0';
```

上述这几条SQL的执行结果为:

<img src=".image/mysql/image-20220426144634023.png" alt="image-20220426144634023" style="zoom:50%;float:left" />

从上述的执行计划我们可以看到，这四条SQL语句的执行计划前面所有的指标都是一样的，看不出来差异。但是此时，我们主要关注的是后面的Extra，前面两天SQL的结果为 Using where; UsingIndex ; 而后面两条SQL的结果为: Using index condition 。

| **Extra**                | 含义                                                         |
| ------------------------ | ------------------------------------------------------------ |
| Using where; Using Index | 查找使用了索引，但是需要的数据都在索引列中能找到，所以不需要回表查询数据 |
| Using index condition    | 查找使用了索引，但是需要回表查询数据                         |

因为，在tb_user表中有一个联合索引 idx_user_pro_age_sta，该索引关联了三个字段profession、age、status，而这个索引也是一个二级索引，所以叶子节点下面挂的是这一行的主键id。 所以当我们查询返回的数据在 id、profession、age、status 之中，则直接走二级索引直接返回数据了。 如果超出这个范围，就需要拿到主键id，再去扫描聚集索引，再获取额外的数据了，这个过程就是回表。 而我们如果一直使用select * 查询返回所有字段值，很容易就会造成回表查询（除非是根据主键查询，此时只会扫描聚集索引）。

为了大家更清楚的理解，什么是覆盖索引，什么是回表查询，我们一起再来看下面的这组SQL的执行过程。

A. 表结构及索引示意图:

id是主键，是一个聚集索引。 name字段建立了普通索引，是一个二级索引（辅助索引）。

<img src=".image/mysql/image-20220426144946484.png" alt="image-20220426144946484" style="zoom:50%;" />



B. 执行SQL : select * from tb_user where id = 2;

根据id查询，直接走聚集索引查询，一次索引扫描，直接返回数据，性能高。

<img src=".image/mysql/image-20220426145016039.png" alt="image-20220426145016039" style="zoom:50%;" />



C. 执行SQL：selet id,name from tb_user where name = 'Arm';

虽然是根据name字段查询，查询二级索引，但是由于查询返回在字段为 id，name，在name的二级索引中，这两个值都是可以直接获取到的，因为覆盖索引，所以不需要回表查询，性能高。

<img src=".image/mysql/image-20220426145143737.png" alt="image-20220426145143737" style="zoom:50%;" />

D. 执行SQL：selet id,name,gender from tb_user where name = 'Arm';

由于在name的二级索引中，不包含gender，所以，需要两次索引扫描，也就是需要回表查询，性能相对较差一点。

<img src=".image/mysql/image-20220426145216169.png" alt="image-20220426145216169" style="zoom:50%;" />

> 思考题：
>
> 一张表, 有四个字段(id, username, password, status), 由于数据量大, 需要对以下SQL语句进行优化, 该如何进行才是最优方案:
>
> select id,username,password from tb_user where username ='itcast';
>
> 
>
> 答案: 针对于 username, password建立联合索引, sql为: create index
>
> idx_user_name_pass on tb_user(username,password);
>
> 这样可以避免上述的SQL语句，在查询的过程中，出现回表查询。



#### 前缀索引

当字段类型为字符串（varchar，text，longtext等）时，有时候需要索引很长的字符串，这会让索引变得很大，查询时，浪费大量的磁盘IO， 影响查询效率。此时可以只将字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率。

**创建前缀索引的语法：**

```
create index idx_xxxx on table_name(column(n)) ;
```



**前缀长度**

可以根据索引的选择性来决定，而选择性是指不重复的索引值（基数）和数据表的记录总数的比值，索引选择性越高则查询效率越高， 唯一索引的选择性是1，这是最好的索引选择性，性能也是最好的。

**前缀索引的查询流程** 

<img src=".image/mysql/image-20220426145536751.png" alt="image-20220426145536751" style="zoom:50%;" />

#### 单列索引与联合索引

单列索引：即一个索引只包含单个列。

联合索引：即一个索引包含了多个列。

我们先来看看 tb_user 表中目前的索引情况:

<img src=".image/mysql/image-20220426145743018.png" alt="image-20220426145743018" style="zoom:50%;" />

在查询出来的索引中，既有单列索引，又有联合索引。

接下来，我们来执行一条SQL语句，看看其执行计划：

<img src=".image/mysql/image-20220426145819299.png" alt="image-20220426145819299" style="zoom:50%;" />

通过上述执行计划我们可以看出来，在and连接的两个字段 phone、name上都是有单列索引的，但是最终mysql只会选择一个索引，也就是说，只能走一个字段的索引，此时是会回表查询的。

紧接着，我们再来创建一个phone和name字段的联合索引来查询一下执行计划。

```
create unique index idx_user_phone_name on tb_user(phone,name);
```

<img src=".image/mysql/image-20220426145904194.png" alt="image-20220426145904194" style="zoom:50%;" />

此时，查询时，就走了联合索引，而在联合索引中包含 phone、name的信息，在叶子节点下挂的是对应的主键id，所以查询是无需回表查询的。

如果查询使用的是联合索引，具体的结构示意图如下：

<img src=".image/mysql/image-20220426145933220.png" alt="image-20220426145933220" style="zoom:50%;" />





### 索引设计原则

1). 针对于数据量较大，且查询比较频繁的表建立索引。

2). 针对于常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索引。

3). 尽量选择区分度高的列作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高。

4). 如果是字符串类型的字段，字段的长度较长，可以针对于字段的特点，建立前缀索引。

5). 尽量使用联合索引，减少单列索引，查询时，联合索引很多时候可以覆盖索引，节省存储空间，避免回表，提高查询效率。

6). 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价也就越大，会影响增删改的效率。

7). 如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它。当优化器知道每列是否包含NULL值时，可以更好地确定哪个索引最有效地用于查询。

## 进阶篇-SQL优化

### **插入数据** 

一次性插入多条记录，可以从一下三个方面进行优化

- 批量插入数据

```sql
Insert into tb_test values(1,'Tom'),(2,'Cat'),(3,'Jerry');
```

- 手动控制事务

```sql
start transaction; 
insert into tb_test values(1,'Tom'),(2,'Cat'),(3,'Jerry'); 
insert into tb_test values(4,'Tom'),(5,'Cat'),(6,'Jerry'); 
insert into tb_test values(7,'Tom'),(8,'Cat'),(9,'Jerry'); 
commit;
```

- 主键顺序插入，性能要高于乱序插入。

```
主键乱序插入 : 8 1 9 21 88 2 4 15 89 5 7 3 
主键顺序插入 : 1 2 3 4 5 7 8 9 15 21 88 89
```

### 大批量插入数据

如果一次性需要插入大批量数据(比如: 几百万的记录)，使用insert语句插入性能较低，此时可以使用MySQL数据库提供的load指令进行插入。操作如下：

<img src=".image/mysql/image-20220426150616520.png" alt="image-20220426150616520" style="zoom:50%;" />

可以执行如下指令，将数据脚本文件中的数据加载到表结构中：

```sql
-- 客户端连接服务端时，加上参数 -–local-infile 
mysql –-local-infile -u root -p 
-- 设置全局参数local_infile为1，开启从本地加载文件导入数据的开关 
set global local_infile = 1; 
-- 执行load指令将准备好的数据，加载到表结构中 
load data local infile '/root/sql1.log' into table tb_user fields terminated by ',' lines terminated by '\n' ;
```



### 主键优化

在上一小节，我们提到，主键顺序插入的性能是要高于乱序插入的。 这一小节，就来介绍一下具体的原因，然后再分析一下主键又该如何设计。

#### 数据组织方式

在InnoDB存储引擎中，表数据都是根据主键顺序组织存放的，这种存储方式的表称为索引组织表(index organized table IOT)。

<img src=".image/mysql/image-20220426150834107.png" alt="image-20220426150834107" style="zoom:50%;" />

行数据，都是存储在聚集索引的叶子节点上的。而我们之前也讲解过InnoDB的逻辑结构图：

<img src=".image/mysql/image-20220426150905721.png" alt="image-20220426150905721" style="zoom:50%;" />

在InnoDB引擎中，数据行是记录在逻辑结构 page 页中的，而每一个页的大小是固定的，默认16K。那也就意味着， 一个页中所存储的行也是有限的，如果插入的数据行row在该页存储不小，将会存储到下一个页中，页与页之间会通过指针连接。

#### 页分裂

页可以为空，也可以填充一半，也可以填充100%。每个页包含了2-N行数据(如果一行数据过大，会行溢出)，根据主键排列。

##### A. 主键顺序插入效果

①. 从磁盘中申请页， 主键顺序插入

<img src=".image/mysql/image-20220426151017038.png" alt="image-20220426151017038" style="zoom:50%;float:left" />

②. 第一个页没有满，继续往第一页插入

<img src=".image/mysql/image-20220426151103028.png" alt="image-20220426151103028" style="zoom:50%;float:left" />

③. 当第一个也写满之后，再写入第二个页，页与页之间会通过指针连接

<img src=".image/mysql/image-20220426151138823.png" alt="image-20220426151138823" style="zoom:50%;float:left" />

④. 当第二页写满了，再往第三页写入

<img src=".image/mysql/image-20220426151214000.png" alt="image-20220426151214000" style="zoom:50%;float:left" />

##### B. 主键乱序插入效果

①. 加入1#,2#页都已经写满了，存放了如图所示的数据

<img src=".image/mysql/image-20220426151343299.png" alt="image-20220426151343299" style="zoom:50%;float:left" />

②. 此时再插入id为50的记录，我们来看看会发生什么现象，会再次开启一个页，写入新的页中吗？

<img src=".image/mysql/image-20220426151436767.png" alt="image-20220426151436767" style="zoom:50%;float:left" />

不会。因为，索引结构的叶子节点是有顺序的。按照顺序，应该存储在47之后。

<img src=".image/mysql/image-20220426151507616.png" alt="image-20220426151507616" style="zoom:50%;float:left" />

但是47所在的1#页，已经写满了，存储不了50对应的数据了。 那么此时会开辟一个新的页 3#。

<img src=".image/mysql/image-20220426151533629.png" alt="image-20220426151533629" style="zoom:50%;float:left" />

但是并不会直接将50存入3#页，而是会将1#页后一半的数据，移动到3#页，然后在3#页，插入50。

<img src=".image/mysql/image-20220426151559527.png" alt="image-20220426151559527" style="zoom:50%;float:left" />

移动数据，并插入id为50的数据之后，那么此时，这三个页之间的数据顺序是有问题的。 1#的下一个页，应该是3#， 3#的下一个页是2#。 所以，此时，需要重新设置链表指针。

<img src=".image/mysql/image-20220426151629960.png" alt="image-20220426151629960" style="zoom:50%;float:left" />

上述的这种现象，称之为 "页分裂"，是比较耗费性能的操作。

#### 页合并

目前表中已有数据的索引结构(叶子节点)如下：

<img src=".image/mysql/image-20220426151753238.png" alt="image-20220426151753238" style="zoom:50%;float:left" />

当我们对已有数据进行删除时，具体的效果如下:

当删除一行记录时，实际上记录并没有被物理删除，只是记录被标记（flaged）为删除并且它的空间变得允许被其他记录声明使用。

<img src=".image/mysql/image-20220426151816649.png" alt="image-20220426151816649" style="zoom:50%;float:left" />

当我们继续删除2#的数据记录

<img src=".image/mysql/image-20220426151833513.png" alt="image-20220426151833513" style="zoom:50%;float:left" />

当页中删除的记录达到 MERGE_THRESHOLD（默认为页的50%），InnoDB会开始寻找最靠近的页（前或后）看看是否可以将两个页合并以优化空间使用。

<img src=".image/mysql/image-20220426151913875.png" alt="image-20220426151913875" style="zoom:50%;float:left" />

删除数据，并将页合并之后，再次插入新的数据21，则直接插入3#页

<img src=".image/mysql/image-20220426151931681.png" alt="image-20220426151931681" style="zoom:50%;float:left" />

这个里面所发生的合并页的这个现象，就称之为 "页合并"。

> 知识小贴士：
>
>  MERGE_THRESHOLD：合并页的阈值，可以自己设置，在创建表或者创建索引时指定。



#### 索引设计原则

- 满足业务需求的情况下，尽量降低主键的长度。

- 插入数据时，尽量选择顺序插入，选择使用AUTO_INCREMENT自增主键。
- 尽量不要使用UUID做主键或者是其他自然主键，如身份证号。

- 业务操作时，避免对主键的修改。

<img src=".image/mysql/image-20220426152045680.png" alt="image-20220426152045680" style="zoom:50%;float:left" />



### order by 优化

MySQL的排序，有两种方式：

**Using filesort :** 通过表的索引或全表扫描，读取满足条件的数据行，然后在排序缓冲区sort buffer中完成排序操作，所有不是通过索引直接返回排序结果的排序都叫 FileSort 排序。

**Using index :** 通过有序索引顺序扫描直接返回有序数据，这种情况即为 using index，不需要额外排序，操作效率高。

对于以上的两种排序方式，Using index的性能高，而Using filesort的性能低，我们在优化排序操作时，尽量要优化为 Using index。

接下来，我们来做一个测试：

#### 查看索引

<img src=".image/mysql/image-20220426152313693.png" alt="image-20220426152313693" style="zoom:50%;float:left" />

#### 执行排序SQL

```sql
explain select id,age,phone from tb_user order by age ;
```

<img src=".image/mysql/image-20220426152358277.png" alt="image-20220426152358277" style="zoom:50%;float:left" />

```sql
explain select id,age,phone from tb_user order by age, phone ;
```

<img src=".image/mysql/image-20220426152439578.png" alt="image-20220426152439578" style="zoom:50%;float:left" />

由于 age, phone 都没有索引，所以此时再排序时，出现Using filesort， 排序性能较低。

#### 创建索引

```
-- 创建索引 
create index idx_user_age_phone_aa on tb_user(age,phone);
```



#### 执行升序排序

 创建索引后，根据age, phone进行升序排序

```
explain select id,age,phone from tb_user order by age; 
```

<img src=".image/mysql/image-20220426153204338.png" alt="image-20220426153204338" style="zoom:50%;float:left" />

```
explain select id,age,phone from tb_user order by age , phone; 
```

<img src=".image/mysql/image-20220426153230444.png" alt="image-20220426153230444" style="zoom:50%;float:left" />

建立索引之后，再次进行排序查询，就由原来的Using filesort， 变为了 Using index，性能就是比较高的了。



#### 进行降序排序

创建索引后，根据age, phone进行降序排序

```
explain select id,age,phone from tb_user order by age desc , phone desc ;
```

<img src=".image/mysql/image-20220426153351875.png" alt="image-20220426153351875" style="zoom:50%;float:left" />

也出现 Using index， 但是此时Extra中出现了 Backward index scan，这个代表反向扫描索引，因为在MySQL中我们创建的索引，默认索引的叶子节点是从小到大排序的，而此时我们查询排序时，是从大到小，所以，在扫描时，就是反向扫描，就会出现 Backward index scan。 在MySQL8版本中，支持降序索引，我们也可以创建降序索引。

#### 失效情况

根据phone，age进行升序排序，phone在前，age在后。

```
explain select id,age,phone from tb_user order by phone , age;
```

<img src=".image/mysql/image-20220426153508957.png" alt="image-20220426153508957" style="zoom:50%;float:left" />

排序时,也需要满足最左前缀法则,否则也会出现 filesort。因为在创建索引的时候， age是第一个字段，phone是第二个字段，所以排序时，也就该按照这个顺序来，否则就会出现 Using filesort。

根据age, phone进行降序一个升序，一个降序

```
explain select id,age,phone from tb_user order by age asc , phone desc ;
```

<img src=".image/mysql/image-20220426153619040.png" alt="image-20220426153619040" style="zoom:50%;float:left" />

因为创建索引时，如果未指定顺序，默认都是按照升序排序的，而查询时，一个升序，一个降序，此时就会出现Using filesort。

为了解决上述的问题，我们可以创建一个索引，这个联合索引中 age 升序排序，phone 倒序排序。

```
create index idx_user_age_phone_ad on tb_user(age asc ,phone desc);
```



升序/降序联合索引结构图示: 

<img src=".image/mysql/image-20220426153729688.png" alt="image-20220426153729688" style="zoom:50%;float:left" />

<img src=".image/mysql/image-20220426153740747.png" alt="image-20220426153740747" style="zoom:50%;float:left" />

#### 总结

由上述的测试,我们得出order by优化原则:

A. 根据排序字段建立合适的索引，多字段排序时，也遵循最左前缀法则。

B. 尽量使用覆盖索引。

C. 多字段排序, 一个升序一个降序，此时需要注意联合索引在创建时的规则（ASC/DESC）。

D. 如果不可避免的出现filesort，大数据量排序时，可以适当增大排序缓冲区大小sort_buffer_size(默认256k)。 



### group by 优化

分组操作，我们主要来看看索引对于分组操作的影响。

首先我们先将 tb_user 表的索引全部删除掉 。

<img src=".image/mysql/image-20220426154028829.png" alt="image-20220426154028829" style="zoom:50%;float:left" />

接下来，在没有索引的情况下，执行如下SQL，查询执行计划：

```
explain select profession , count(*) from tb_user group by profession ;
```

<img src=".image/mysql/image-20220426154100621.png" alt="image-20220426154100621" style="zoom:50%;float:left" />

然后，我们在针对于 profession ， age， status 创建一个联合索引。

```
create index idx_user_pro_age_sta on tb_user(profession , age , status); 
```

紧接着，再执行前面相同的SQL查看执行计划。

```
explain select profession , count(*) from tb_user group by profession ;
```

<img src=".image/mysql/image-20220426154150695.png" alt="image-20220426154150695" style="zoom:50%;float:left" />

<img src=".image/mysql/image-20220426154257324.png" alt="image-20220426154257324" style="zoom:50%;float:left" />

<img src=".image/mysql/image-20220426154316395.png" alt="image-20220426154316395" style="zoom:50%;float:left" />

我们发现，如果仅仅根据age分组，就会出现 Using temporary ；而如果是 根据profession,age两个字段同时分组，则不会出现 Using temporary。原因是因为对于分组操作，在联合索引中，也是符合最左前缀法则的。



##### 总结：

所以，在分组操作中，我们需要通过以下两点进行优化，以提升性能：

- 在分组操作时，可以通过索引来提高效率。

- 分组操作时，索引的使用也是满足最左前缀法则的。

### limit优化

在数据量比较大时，如果进行limit分页查询，在查询时，越往后，分页查询效率越低。

我们一起来看看执行limit分页查询耗时对比：

<img src=".image/mysql/image-20220426154659445.png" alt="image-20220426154659445" style="zoom:50%;float:left" />

通过测试我们会看到，越往后，分页查询效率越低，这就是分页查询的问题所在。

因为，当在进行分页查询时，如果执行 limit 2000000,10 ，此时需要MySQL排序前2000010 记录，仅仅返回 2000000 - 2000010 的记录，其他记录丢弃，查询排序的代价非常大 。

优化思路: 一般分页查询时，通过创建 覆盖索引 能够比较好地提高性能，可以通过覆盖索引加子查询形式进行优化。

```
explain select * from tb_sku t , (select id from tb_sku order by id limit 2000000,10) a where t.id = a.id;
```





### count优化

在测试中，我们发现，如果数据量很大，在执行count操作时，是非常耗时的。

- MyISAM 引擎把一个表的总行数存在了磁盘上，因此执行 count(*) 的时候会直接返回这个数，效率很高； 但是如果是带条件的count，MyISAM也慢。

- InnoDB 引擎就麻烦了，它执行 count(*) 的时候，需要把数据一行一行地从引擎里面读出来，然后累积计数。

如果说要大幅度提升InnoDB表的count效率，主要的优化思路：自己计数(可以借助于redis这样的数据库进行,但是如果是带条件的count又比较麻烦了)。 

#### count用法

count() 是一个聚合函数，对于返回的结果集，一行行地判断，如果 count 函数的参数不是NULL，累计值就加 1，否则不加，最后返回累计值。

用法：count（*）、count（主键）、count（字段）、count（数字）

| count用法   | 含义                                                         |
| ----------- | ------------------------------------------------------------ |
| count(主键) | InnoDB 引擎会遍历整张表，把每一行的 主键id 值都取出来，返回给服务层。服务层拿到主键后，直接按行进行累加(主键不可能为null) |
| count(字段) | 没有not null 约束 : InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，服务层判断是否为null，不为null，计数累加。有not null 约束：InnoDB 引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加。 |
| count(数字) | InnoDB 引擎遍历整张表，但不取值。服务层对于返回的每一行，放一个数字“1”进去，直接按行进行累加。 |
| count(*)    | InnoDB引擎并不会把全部字段取出来，而是专门做了优化，不取值，服务层直接按行进行累加。 |



> 按照效率排序的话，count(字段) < count(主键 id) < count(1) ≈ count(*)，
>
> 所以尽量使用 count(*)。 

### update优化

我们主要需要注意一下update语句执行时的注意事项。

```
update course set name = 'javaEE' where id = 1 ;
```

当我们在执行删除的SQL语句时，会锁定id为1这一行的数据，然后事务提交之后，行锁释放。

但是当我们在执行如下SQL时。

```
update course set name = 'SpringBoot' where name = 'PHP' ;
```

当我们开启多个事务，在执行上述的SQL时，我们发现行锁升级为了表锁。 导致该update语句的性能大大降低。



> InnoDB的行锁是针对索引加的锁，不是针对记录加的锁 ,并且该索引不能失效，否则会从行锁升级为表锁 。



## 进阶篇-视图/存储/触发器

TODO

## 进阶篇-锁

锁是计算机协调多个进程或线程并发访问某一资源的机制。在数据库中，除传统的计算资源（CPU、RAM、I/O）的争用以外，数据也是一种供许多用户共享的资源。如何保证数据并发访问的一致性、有效性是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。从这个角度来说，锁对数据库而言显得尤其重要，也更加复杂。

MySQL中的锁，按照锁的粒度分，分为以下三类：

- 全局锁：锁定数据库中的所有表。

- 表级锁：每次操作锁住整张表。

- 行级锁：每次操作锁住对应的行数据。

### 全局锁

全局锁就是对整个数据库实例加锁，加锁后整个实例就处于只读状态，后续的DML的写语句，DDL语句，已经更新操作的事务提交语句都将被阻塞。

其典型的使用场景是做全库的逻辑备份，对所有的表进行锁定，从而获取一致性视图，保证数据的完整性。

为什么全库逻辑备份，就需要加全就锁呢？



**A. 我们一起先来分析一下不加全局锁，可能存在的问题。**

假设在数据库中存在这样三张表: tb_stock 库存表，tb_order 订单表，tb_orderlog 订单日志表。

<img src=".image/mysql/image-20220426155608697.png" alt="image-20220426155608697" style="zoom:50%;float:left" />

- 在进行数据备份时，先备份了tb_stock库存表。

- 然后接下来，在业务系统中，执行了下单操作，扣减库存，生成订单（更新tb_stock表，插入tb_order表）。

- 然后再执行备份 tb_order表的逻辑。

- 业务中执行插入订单日志操作。

- 最后，又备份了tb_orderlog表。

此时备份出来的数据，是存在问题的。因为备份出来的数据，tb_stock表与tb_order表的数据不一致(有最新操作的订单信息,但是库存数没减)。

那如何来规避这种问题呢? 此时就可以借助于MySQL的全局锁来解决。



**B. 再来分析一下加了全局锁后的情况**

<img src=".image/mysql/image-20220426155839152.png" alt="image-20220426155839152" style="zoom:50%;float:left" />

对数据库进行进行逻辑备份之前，先对整个数据库加上全局锁，一旦加了全局锁之后，其他的DDL、DML全部都处于阻塞状态，但是可以执行DQL语句，也就是处于只读状态，而数据备份就是查询操作。那么数据在进行逻辑备份的过程中，数据库中的数据就是不会发生变化的，这样就保证了数据的一致性和完整性。

#### 语法

1). 加全局锁

```
flush tables with read lock ;
```

2). 数据备份

```
mysqldump -uroot –p1234 itcast > itcast.sql
```

数据备份的相关指令, 在后面MySQL管理章节, 还会详细讲解.

3). 释放锁

```
unlock tables ;
```

#### 特点

数据库中加全局锁，是一个比较重的操作，存在以下问题：

- 如果在主库上备份，那么在备份期间都不能执行更新，业务基本上就得停摆。

- 如果在从库上备份，那么在备份期间从库不能执行主库同步过来的二进制日志（binlog），会导致主从延迟。



在InnoDB引擎中，我们可以在备份时加上参数 --single-transaction 参数来完成不加锁的一致性数据备份。

```
mysqldump --single-transaction -uroot –p123456 itcast > itcast.sql
```

### 表级锁

表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用在MyISAM、InnoDB、BDB等存储引擎中。

对于表级锁，主要分为以下三类：

- 表锁

- 元数据锁（meta data lock，MDL）

- 意向锁



#### 表锁

对于表锁，分为两类：

- 表共享读锁（read lock）

- 表独占写锁（write lock）



**语法：**

- 加锁：lock tables 表名... read/write。

- 释放锁：unlock tables / 客户端断开连接 。



**特点:**

A. 读锁

左侧为客户端一，对指定表加了读锁，不会影响右侧客户端二的读，但是会阻塞右侧客户端的写。

<img src=".image/mysql/image-20220426160414695.png" alt="image-20220426160414695" style="zoom:50%;float:left" />



B. 写锁

左侧为客户端一，对指定表加了写锁，会阻塞右侧客户端的读和写。

<img src=".image/mysql/image-20220426160456612.png" alt="image-20220426160456612" style="zoom:50%;float:left" />



> 结论: 读锁不会阻塞其他客户端的读，但是会阻塞写。写锁既会阻塞其他客户端的读，又会阻塞其他客户端的写。



#### 元数据锁

meta data lock , 元数据锁，简写MDL。

MDL加锁过程是系统自动控制，无需显式使用，在访问一张表的时候会自动加上。MDL锁主要作用是维护表元数据的数据一致性，在表上有活动事务的时候，不可以对元数据进行写入操作。为了避免DML与DDL冲突，保证读写的正确性。

这里的元数据，大家可以简单理解为就是一张表的表结构。 也就是说，某一张表涉及到未提交的事务时，是不能够修改这张表的表结构的。

在MySQL5.5中引入了MDL，当对一张表进行增删改查的时候，加MDL读锁(共享)；当对表结构进行变更操作的时候，加MDL写锁(排他)。

常见的SQL操作时，所添加的元数据锁：

| 对应SQL                                        | 锁类型                                 | 说明                                             |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| lock tables xxx read /write                    | SHARED_READ_ONLY /SHARED_NO_READ_WRITE |                                                  |
| select 、select ... lock in share mode         | SHARED_READ                            | 与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥 |
| insert 、update、delete、select ... for update | SHARED_WRITE                           | 与SHARED_READ、SHARED_WRITE兼容，与EXCLUSIVE互斥 |
| alter table ...                                | EXCLUSIVE                              | 与其他的MDL都互斥                                |

#### 意向锁

为了避免DML在执行时，加的行锁与表锁的冲突，在InnoDB中引入了意向锁，使得表锁不用检查每行数据是否加锁，使用意向锁来减少表锁的检查。

假如没有意向锁，客户端一对表加了行锁后，客户端二如何给表加表锁呢，来通过示意图简单分析一下：

首先客户端一，开启一个事务，然后执行DML操作，在执行DML语句时，会对涉及到的行加行锁。

<img src=".image/mysql/image-20220426161203823.png" alt="image-20220426161203823" style="zoom:50%;float:left" />

当客户端二，想对这张表加表锁时，会检查当前表是否有对应的行锁，如果没有，则添加表锁，此时就会从第一行数据，检查到最后一行数据，效率较低。

<img src=".image/mysql/image-20220426161235688.png" alt="image-20220426161235688" style="zoom:50%;float:left" />

有了意向锁之后 :

客户端一，在执行DML操作时，会对涉及的行加行锁，同时也会对该表加上意向锁。

<img src=".image/mysql/image-20220426161359156.png" alt="image-20220426161359156" style="zoom:50%;float:left" />



而其他客户端，在对这张表加表锁的时候，会根据该表上所加的意向锁来判定是否可以成功加表锁，而不用逐行判断行锁情况了。

<img src=".image/mysql/image-20220426161508026.png" alt="image-20220426161508026" style="zoom:50%;float:left" />

总结：

- 意向共享锁(IS): 由语句select ... lock in share mode添加 。 与 表锁共享锁(read)兼容，与表锁排他锁(write)互斥。

- 意向排他锁(IX): 由insert、update、delete、select...for update添加 。与表锁共享锁(read)及排他锁(write)都互斥，意向锁之间不会互斥。



> 一旦事务提交了，意向共享锁、意向排他锁，都会自动释放。



### 行级锁

行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在InnoDB存储引擎中。

InnoDB的数据是基于索引组织的，行锁是通过对索引上的索引项加锁来实现的，而不是对记录加的锁。对于行级锁，主要分为以下三类：

- 行锁（Record Lock）：锁定单个行记录的锁，防止其他事务对此行进行update和delete。在RC、RR隔离级别下都支持。

  <img src=".image/mysql/image-20220426161744776.png" alt="image-20220426161744776" style="zoom:50%;" />

- 间隙锁（Gap Lock）：锁定索引记录间隙（不含该记录），确保索引记录间隙不变，防止其他事务在这个间隙进行insert，产生幻读。在RR隔离级别下都支持。

<img src=".image/mysql/image-20220426161827629.png" alt="image-20220426161827629" style="zoom:50%;" />

- 临键锁（Next-Key Lock）：行锁和间隙锁组合，同时锁住数据，并锁住数据前面的间隙Gap。 在RR隔离级别下支持。

<img src=".image/mysql/image-20220426161908510.png" alt="image-20220426161908510" style="zoom:50%;" />



#### 行锁

InnoDB实现了以下两种类型的行锁：

- 共享锁（S）：允许一个事务去读一行，阻止其他事务获得相同数据集的排它锁。

- 排他锁（X）：允许获取排他锁的事务更新数据，阻止其他事务获得相同数据集的共享锁和排他锁



两种行锁的兼容情况如下:

<img src=".image/mysql/image-20220426162017022.png" alt="image-20220426162017022" style="zoom:50%;float:left" />

常见的SQL语句，在执行时，所加的行锁如下：

| SQL                           | 行锁类型   | 说明                                      |
| ----------------------------- | ---------- | ----------------------------------------- |
| INSERT ...                    | 排他锁     | 自动加锁                                  |
| UPDATE ...                    | 排他锁     | 自动加锁                                  |
| DELETE ...                    | 排他锁     | 自动加锁                                  |
| SELECT（正常）                | 不加任何锁 |                                           |
| SELECT ... LOCK IN SHARE MODE | 共享锁     | 需要手动在SELECT之后加LOCK IN SHARE  MODE |
| SELECT ... FOR UPDATE         | 排他锁     | 需要手动在SELECT之后加FOR UPDATE          |



 **演示**

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜索和索引扫描，以防止幻读。

- 针对唯一索引进行检索时，对已存在的记录进行等值匹配时，将会自动优化为行锁。

- InnoDB的行锁是针对于索引加的锁，不通过索引条件检索数据，那么InnoDB将对表中的所有记录加锁，此时就会升级为表锁。

可以通过以下SQL，查看意向锁及行锁的加锁情况：

```sql
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from performance_schema.data_locks;
```



### 间隙锁&临键锁

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜索和索引扫描，以防止幻读。

- 索引上的等值查询(唯一索引)，给不存在的记录加锁时, 优化为间隙锁 。

- 索引上的等值查询(非唯一普通索引)，向右遍历时最后一个值不满足查询需求时，next-keylock 退化为间隙锁。

- 索引上的范围查询(唯一索引)--会访问到不满足条件的第一个值为止。



> 注意：间隙锁唯一目的是防止其他事务插入间隙。间隙锁可以共存，一个事务采用的间隙锁不会阻止另一个事务在同一间隙上采用间隙锁。



A. 索引上的等值查询(唯一索引)，给不存在的记录加锁时, 优化为间隙锁 。

<img src=".image/mysql/image-20220426163450919.png" alt="image-20220426163450919" style="zoom:50%;" />



B. 索引上的等值查询(非唯一普通索引)，向右遍历时最后一个值不满足查询需求时，next-keylock 退化为间隙锁。 

介绍分析一下：

我们知道InnoDB的B+树索引，叶子节点是有序的双向链表。 假如，我们要根据这个二级索引查询值为18的数据，并加上共享锁，我们是只锁定18这一行就可以了吗？ 并不是，因为是非唯一索引，这个结构中可能有多个18的存在，所以，在加锁时会继续往后找，找到一个不满足条件的值（当前案例中也就是29）。此时会对18加临键锁，并对29之前的间隙加锁。

<img src=".image/mysql/image-20220426163540635.png" alt="image-20220426163540635" style="zoom:50%;float:left" />

<img src=".image/mysql/image-20220426163601381.png" alt="image-20220426163601381" style="zoom:50%;float:left" />

C. 索引上的范围查询(唯一索引)--会访问到不满足条件的第一个值为止。

<img src=".image/mysql/image-20220426163645003.png" alt="image-20220426163645003" style="zoom:50%;float:left" />





## 进阶篇-InnoDB引擎

## 进阶篇-MySQL管理



