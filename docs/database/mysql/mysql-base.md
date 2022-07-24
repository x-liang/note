# MySQL 基础篇

## 一：MySQL概述

在这一章节，我们主要介绍两个部分，数据库相关概念及MySQL数据库的介绍、下载、安装、启动及连接。

### 1.1 数据库相关概念

在这一部分，我们先来讲解三个概念：数据库、数据库管理系统、SQL。

| 名称           | 全称                                       | 简称                       |
| -------------- | ------------------------------------------ | -------------------------- |
| 数据库         | 存储数据的仓库。数据是有组织的进行存储     | Database                   |
| 数据库管理系统 | 操纵和管理数据库的大型软件                 | Database Management System |
| SQL            | 操作关系型数据库的编程语言，定义了一套操作 | Structured Query           |

而目前主流的关系型数据库管理系统的市场占有率排名如下：

![image-20220723195315136](../../../.img/mysql-base/image-20220723195315136.png)

- Oracle：大型的收费数据库，Oracle公司产品，价格昂贵。

- MySQL：开源免费的中小型数据库，后来Sun公司收购了MySQL，而Oracle又收购了Sun公司。目前Oracle推出了收费版本的MySQL，也提供了免费的社区版本。
- SQL Server：Microsoft 公司推出的收费的中型数据库，C#、.net等语言常用。

- PostgreSQL：开源免费的中小型数据库。

- DB2：IBM公司的大型收费数据库产品。

- SQLLite：嵌入式的微型数据库。Android内置的数据库采用的就是该数据库。

- MariaDB：开源免费的中小型数据库。是MySQL数据库的另外一个分支、另外一个衍生产品，与MySQL数据库有很好的兼容性。

而不论我们使用的是上面的哪一个关系型数据库，最终在操作时，都是使用SQL语言来进行统一操作，因为我们前面讲到SQL语言，是操作关系型数据库的 **统一标准** 。所以即使我们现在学习的是MySQL，假如我们以后到了公司，使用的是别的关系型数据库，如：Oracle、DB2、SQLServer，也完全不用担心，因为操作的方式都是一致的。

### 1.2 MySQL数据库

## 二：SQL

全称 Structured Query Language，结构化查询语言。操作关系型数据库的编程语言，定义了一套操作关系型数据库统一**标准** 。

### 2.1 SQL通用语法

在学习具体的SQL语句之前，先来了解一下SQL语言的同于语法。

1. SQL语句可以单行或多行书写，以分号结尾。

2. SQL语句可以使用空格/缩进来增强语句的可读性。

3. MySQL数据库的SQL语句不区分大小写，关键字建议使用大写。

4. 注释：

   - 单行注释：-- 注释内容 或 # 注释内容

   - 多行注释：/* 注释内容 */

### 2.2 SQL分类

SQL语句，根据其功能，主要分为四类：DDL、DML、DQL、DCL。 

| 分类 | 全称                       | 说明                                                   |
| ---- | -------------------------- | ------------------------------------------------------ |
| DDL  | Data Definition Language   | 数据定义语言，用来定义数据库对象(数据库，表，字段)     |
| DML  | Data Manipulation Language | 数据操作语言，用来对数据库表中的数据进行增删改         |
| DQL  | Data Query Language        | 数据查询语言，用来查询数据库中表的记录                 |
| DCL  | Data Control Language      | 数据控制语言，用来创建数据库用户、控制数据库的访问权限 |

### 2.3 DDL

Data Definition Language，数据定义语言，用来定义数据库对象(数据库，表，字段) 。

#### 2.3.1 数据库操作

##### 1） **查询所有数据库：**

```sql
show databases ;
```

案例展示：

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| learn              |
| mysql              |
| performance_schema |
| sakila             |
| sys                |
| world              |
+--------------------+
7 rows in set (0.01 sec)
```



##### 2） 查询当前数据库

```sql
select database() ;
```

案例展示：

```sql
mysql> use learn;
Database changed
mysql> select database();
+------------+
| database() |
+------------+
| learn      |
+------------+
1 row in set (0.00 sec)
```

##### 3） 创建数据库

```sql
create database [ if not exists ] 数据库名 [ default charset 字符集 ] [ collate 排序 规则 ] ;
```

案例展示：

创建一个数据库

```sql
mysql> create database test;
Query OK, 1 row affected (0.00 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| test               |
+--------------------+
8 rows in set (0.00 sec)
```

在同一个数据库服务器中，不能存在两个重名的数据库，当我们再创建一个test数据库时，就会报错

```sql
mysql> create database test;
ERROR 1007 (HY000): Can't create database 'test'; database exists
```

这时，我们可以通过 if not exists 参数进行判断，如果存在就不进行建库了

```sql
mysql> create database if not exists test ;
Query OK, 1 row affected, 1 warning (0.00 sec)
```

在创建数据库是也可以指定一个默认的字符集

```sql
create database test default charset utf8mb4;
```

##### 4） 删除数据库

```sql
drop database [ if exists ] 数据库名 ;
```

案例展示：

```sql
mysql> drop database if exists test;
Query OK, 0 rows affected (0.01 sec)
```

在删除一个不存在的数据库时会报错，这时可以加上if exists参数

##### 5). 切换数据库

```sql
use 数据库名;
```

我们要操作某一个数据库下的表时，就需要通过该指令，切换到对应的数据库下，否则是不能操作的。比如，切换到learn数据，执行如下SQL： 

```sql
mysql> use learn;
Database changed
```



#### 2.3.2 表操作 - 查询创建

在执行下面的操作之前先创建一个表：

```sql
DROP TABLE IF EXISTS `tb_user`;
CREATE TABLE `tb_user`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '??',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '???',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '???',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??',
  `profession` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??',
  `age` tinyint UNSIGNED NULL DEFAULT NULL COMMENT '??',
  `gender` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '?? , 1: ?, 2: ?',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '??',
  `createtime` datetime NULL DEFAULT NULL COMMENT '????',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '?????' ROW_FORMAT = Dynamic;
```



##### 1) 查询当前数据库所有表

```sql
show tables;
```

比如,我们可以切换到sys这个系统数据库,并查看系统数据库中的所有表结构。

```sql
use sys; 
show tables;
```

显示结果：

```shell
mysql> use sys;
Database changed
mysql> show tables;
+-----------------------------------------------+
| Tables_in_sys                                 |
+-----------------------------------------------+
| host_summary                                  |
| host_summary_by_file_io                       |
| host_summary_by_file_io_type                  |
| host_summary_by_stages                        |
......
| x$waits_by_user_by_latency                    |
| x$waits_global_by_latency                     |
+-----------------------------------------------+
101 rows in set (0.01 sec)
```

##### 2) 查看指定表结构

```sql
desc 表名 ;
```

通过这条指令，我们可以查看到指定表的字段，字段的类型、是否可以为NULL，是否存在默认值等信息。

```shell
mysql> desc tb_user;
+------------+------------------+------+-----+---------+----------------+
| Field      | Type             | Null | Key | Default | Extra          |
+------------+------------------+------+-----+---------+----------------+
| id         | int              | NO   | PRI | NULL    | auto_increment |
| name       | varchar(50)      | NO   |     | NULL    |                |
| phone      | varchar(11)      | NO   |     | NULL    |                |
| email      | varchar(100)     | YES  |     | NULL    |                |
| profession | varchar(11)      | YES  |     | NULL    |                |
| age        | tinyint unsigned | YES  |     | NULL    |                |
| gender     | char(1)          | YES  |     | NULL    |                |
| status     | char(1)          | YES  |     | NULL    |                |
| createtime | datetime         | YES  |     | NULL    |                |
+------------+------------------+------+-----+---------+----------------+
9 rows in set (0.00 sec)
```

##### 3) 查询指定表的建表语句

```sql
show create table 表名 ;
```

通过这条指令，主要是用来查看建表语句的，而有部分参数我们在创建表的时候，并未指定也会查询到，因为这部分是数据库的默认值，如：存储引擎、字符集等。

```shell
mysql> show create table tb_user;
+---------+----------+
| Table   | Create Table  |
+---------+----------+
| tb_user | CREATE TABLE `tb_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(11) NOT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `profession` varchar(11) DEFAULT NULL COMMENT '专业',
  `age` tinyint unsigned DEFAULT NULL COMMENT '年龄',
  `gender` char(1) DEFAULT NULL COMMENT '性别 , 1: 男, 2: 女',
  `status` char(1) DEFAULT NULL COMMENT '状态',
  `createtime` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统用户表' |
+---------+----------+
1 row in set (0.00 sec)
```

##### 4) 创建表结构

```sql
CREATE TABLE 表名( 
	字段1 字段1类型 [COMMENT 字段1注释 ], 
    字段2 字段2类型 [COMMENT 字段2注释 ], 
    字段3 字段3类型 [COMMENT 字段3注释 ], 
    ...... 
    字段n 字段n类型 [COMMENT 字段n注释 ] 
) [ COMMENT 表注释 ] ;
```

比如，我们创建一张表 tb_user ，对应的结构如下：

| id   | name     | age  | gender |
| ---- | -------- | ---- | ------ |
| 1    | 令狐冲   | 28   | 男     |
| 2    | 东方不败 | 32   | 男     |

那么建表语句为：

```sql
create table tb_user( 
	id int comment '编号', 
    name varchar(50) comment '姓名', 
    age int comment '年龄', 
    gender varchar(1) comment '性别' 
) comment '用户表';
```



#### 2.3.3 表操作 - 数据类型

在上述的建表语句中，我们在指定字段的数据类型时，用到了int ，varchar，那么在MySQL中除了以上的数据类型，还有哪些常见的数据类型呢？ 接下来,我们就来详细介绍一下MySQL的数据类型。

MySQL中的数据类型有很多，主要分为三类：数值类型、字符串类型、日期时间类型。

##### 1) 数值类型

| 类型        | 大小   | 有符号（SIGNED）范围             | 无符号（UNSIGNED）范围               | 描述                |
| ----------- | ------ | -------------------------------- | ------------------------------------ | ------------------- |
| TINYINT     | 1byte  | (-128，127)                      | (0，255)                             | 小整数值            |
| SMALLINT    | 2bytes | (-32768，32767)                  | (0，65535)                           | 大整数值            |
| MEDIUMINT   | 3bytes | (-8388608，8388607)              | (0，16777215)                        | 大整数值            |
| INT/INTEGER | 4bytes | (-2147483648， 2147483647)       | (0，4294967295)                      | 大整数值            |
| BIGINT      | 8bytes | (-2^63，2^63-1)                  | (0，2^64-1)                          | 极大整数值          |
| FLOAT       | 4bytes | (-3.4028 E+38， 3.4028 E+38)     | 0 和 (1.17549 E- 38，3.40282 E+38)   | 单精度浮点数值      |
| DOUBLE      | 8bytes | (-1.79769 E+308， 1.79769 E+308) | 0 和 (2.22507 E-308， 1.79769 E+308) | 双精度浮点数值      |
| DECIMAL     |        | 依赖于M(精度)和D(标度) 的值      | 依赖于M(精度)和D(标度)的 值          | 小数值(精 确定点数) |





##### 2) 字符串类型

| 类型       | 大小                  | 描述                         |
| ---------- | --------------------- | ---------------------------- |
| CHAR       | 0-255 bytes           | 定长字符串(需要指定长度)     |
| VARCHAR    | 0-65535 bytes         | 变长字符串(需要指定长度)     |
| TINYBLOB   | 0-255 bytes           | 不超过255个字符的二进制数据  |
| TINYTEXT   | 0-255 bytes           | 短文本字符串                 |
| BLOB       | 0-65 535 bytes        | 二进制形式的长文本数据       |
| TEXT       | 0-65 535 bytes        | 长文本数据                   |
| MEDIUMBLOB | 0-16 777 215 bytes    | 二进制形式的中等长度文本数据 |
| MEDIUMTEXT | 0-16 777 215 bytes    | 中等长度文本数据             |
| LONGBLOB   | 0-4 294 967 295 bytes | 二进制形式的极大文本数据     |
| LONGTEXT   | 0-4 294 967 295 bytes | 极大文本数据                 |

char 与 varchar 都可以描述字符串，char是定长字符串，指定长度多长，就占用多少个字符，和字段值的长度无关 。而varchar是变长字符串，指定的长度为最大占用长度 。相对来说，char的性能会更高些。

##### 3) 日期时间类型



| 类型      | 大小 | 范围                                       | 格式                | 描述                     |
| --------- | ---- | ------------------------------------------ | ------------------- | ------------------------ |
| DATE      | 3    | 1000-01-01 至 9999-12-31                   | YYYY-MM-DD          | 日期值                   |
| TIME      | 3    | -838:59:59 至 838:59:59                    | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1    | 1901 至 2155                               | YYYY                | 年份值                   |
| DATETIME  | 8    | 1000-01-01 00:00:00 至 9999-12-31 23:59:59 | YYYY-MM-DD HH:MM:SS | 混合日期和时间值         |
| TIMESTAMP | 4    | 1970-01-01 00:00:01 至 2038-01-19 03:14:07 | YYYY-MM-DD HH:MM:SS | 混合日期和时间值，时间戳 |



#### 2.3.4 表操作 - 修改

##### 1) 添加字段

```sql
ALTER TABLE 表名 ADD 字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ]; 
```

案例展示：

```shell
mysql> alter table t_user add email varchar(100) comment '邮箱地址';
Query OK, 0 rows affected (0.01 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

##### 2) 修改数据类型

```sql
ALTER TABLE 表名 MODIFY 字段名 新数据类型 (长度);
```



##### 3) 修改字段名和字段类型

```sql
ALTER TABLE 表名 CHANGE 旧字段名 新字段名 类型 (长度) [ COMMENT 注释 ] [ 约束 ];
```

案例展示：

将name改为username

```shell
mysql> alter table t_user change name username varchar(30) comment '用户名称';
Query OK, 0 rows affected (0.03 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

##### 4) 删除字段

```sql
ALTER TABLE 表名 DROP 字段名;
```

案例展示：

将t_user表的email字段删除

```sql
mysql> alter table t_user drop email;
Query OK, 0 rows affected (0.02 sec)
Records: 0  Duplicates: 0  Warnings: 0
```



##### 5) 修改表名

```sql
ALTER TABLE 表名 RENAME TO 新表名;
```

案例展示：

将t_user改为tt_user

```sql
mysql> alter table t_user rename to tt_user;
Query OK, 0 rows affected (0.01 sec)
```

#### 2.3.5 表操作 - 删除

##### 1) 删除表

```sql
DROP TABLE [ IF EXISTS ] 表名;
```

可选项 IF EXISTS 代表，只有表名存在时才会删除该表，表名不存在，则不执行删除操作(如果不加该参数项，删除一张不存在的表，执行将会报错)。

案例展示：

如果tt_user表存在，则删除tt_user表

```sql
mysql> drop table if exists tt_user;
Query OK, 0 rows affected (0.01 sec)
```

##### 2) 删除指定表

```sql
TRUNCATE TABLE 表名;
```



### 2.4 DML

DML英文全称是Data Manipulation Language(数据操作语言)，用来对数据库中表的数据记录进行增、删、改操作。

- 添加数据（INSERT）

- 修改数据（UPDATE）

- 删除数据（DELETE） 

#### 2.4.1 添加数据

##### 1). 给指定字段添加数据

```sql
INSERT INTO 表名 (字段名1, 字段名2, ...) VALUES (值1, 值2, ...);
```

案例：

给tb_user表插入数据

```sql
mysql> insert into tb_user (id, `name`, phone, email, profession, age, gender, `status`) VALUES(25, 'xuliang', 18888888888, '88888888@qq.com', 'aa', 18, 1, 0 );
Query OK, 1 row affected (0.00 sec)
```

查询数据：

```sql
mysql> select * from tb_user where id=25;
+----+---------+-------------+-----------------+------------+------+--------+--------+------------+
| id | name    | phone       | email           | profession | age  | gender | status | createtime |
+----+---------+-------------+-----------------+------------+------+--------+--------+------------+
| 25 | xuliang | 18888888888 | 88888888@qq.com | aa         |   18 | 1      | 0      | NULL       |
+----+---------+-------------+-----------------+------------+------+--------+--------+------------+
1 row in set (0.00 sec)
```



##### 2). 给全部字段添加数据

```sql
INSERT INTO 表名 VALUES (值1, 值2, ...);
```

如果不指定字段，就需要在value中指定全部值，且顺序一致。



##### 3). 批量添加数据

```sql
INSERT INTO 表名 (字段名1, 字段名2, ...) VALUES (值1, 值2, ...), (值1, 值2, ...), (值 1, 值2, ...) ;
```



> 注意事项:
>
> - 插入数据时，指定的字段顺序需要与值的顺序是一一对应的。
>
> - 字符串和日期型数据应该包含在引号中。
>
> - 插入的数据大小，应该在字段的规定范围内。



#### 2.4.2 修改数据

修改数据的具体语法为:

```sql
UPDATE 表名 SET 字段名1 = 值1 , 字段名2 = 值2 , .... [ WHERE 条件 ] ;
```

案例:

A. 修改id为1的数据，将name修改为xul

```sql
update tb_user set name = 'xul' where id = 1;
```

B. 修改id为1的数据, 将name修改为小昭, gender修改为 女

```sql
update tb_user set name = '小昭' , gender = 1 where id = 1;
```

C. 将所有用户的创建日期修改为 2008-01-01

```sql
update tb_user set entrydate = '2008-01-01'; 
```

> 注意事项:
>
> 修改语句的条件可以有，也可以没有，如果没有条件，则会修改整张表的所有数据。



#### 2.5.3 删除数据

删除数据的具体语法为：

```sql
DELETE FROM 表名 [ WHERE 条件 ] ;
```



案例:

A. 删除gender为女的用户

```sql
delete from tb_user where gender = 1;
```

B. 删除所有用户

```sql
delete from tb_user;
```



> 注意事项:
>
> - DELETE 语句的条件可以有，也可以没有，如果没有条件，则会删除整张表的所有数据。
>
> - DELETE 语句不能删除某一个字段的值(可以使用UPDATE，将该字段值置为NULL即 可)。
>
> - 当进行删除全部数据操作时，datagrip会提示我们，询问是否确认删除，我们直接点击Execute即可。





### 2.5 DQL

DQL英文全称是Data Query Language(数据查询语言)，数据查询语言，用来查询数据库中表的记录。

查询关键字: SELECT

在一个正常的业务系统中，查询操作的频次是要远高于增删改的，当我们去访问企业官网、电商网站，在这些网站中我们所看到的数据，实际都是需要从数据库中查询并展示的。而且在查询的过程中，可能还会涉及到条件、排序、分页等操作。

那么，本小节我们主要学习的就是如何进行数据的查询操作。 我们先来完成如下数据准备工作: 

```sql
drop table if exists employee; 
create table emp( 
    id int comment '编号', 
    workno varchar(10) comment '工号', 
    name varchar(10) comment '姓名', 
    gender char(1) comment '性别', 
    age tinyint unsigned comment '年龄', 
    idcard char(18) comment '身份证号', 
    workaddress varchar(50) comment '工作地址', 
    entrydate date comment '入职时间' 
)comment '员工表'; 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (1, '00001', '柳岩666', '女', 20, '123456789012345678', '北京', '2000-01- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (2, '00002', '张无忌', '男', 18, '123456789012345670', '北京', '2005-09- 01');
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (3, '00003', '韦一笑', '男', 38, '123456789712345670', '上海', '2005-08- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (4, '00004', '赵敏', '女', 18, '123456757123845670', '北京', '2009-12-01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (5, '00005', '小昭', '女', 16, '123456769012345678', '上海', '2007-07-01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (6, '00006', '杨逍', '男', 28, '12345678931234567X', '北京', '2006-01-01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (7, '00007', '范瑶', '男', 40, '123456789212345670', '北京', '2005-05-01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (8, '00008', '黛绮丝', '女', 38, '123456157123645670', '天津', '2015-05- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (9, '00009', '范凉凉', '女', 45, '123156789012345678', '北京', '2010-04- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (10, '00010', '陈友谅', '男', 53, '123456789012345670', '上海', '2011-01- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (11, '00011', '张士诚', '男', 55, '123567897123465670', '江苏', '2015-05- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (12, '00012', '常遇春', '男', 32, '123446757152345670', '北京', '2004-02- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (13, '00013', '张三丰', '男', 88, '123656789012345678', '江苏', '2020-11- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (14, '00014', '灭绝', '女', 65, '123456719012345670', '西安', '2019-05- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (15, '00015', '胡青牛', '男', 70, '12345674971234567X', '西安', '2018-04- 01'); 
INSERT INTO emp (id, workno, name, gender, age, idcard, workaddress, entrydate) VALUES (16, '00016', '周芷若', '女', 18, null, '北京', '2012-06-01');
```

准备完毕后，我们就可以看到emp表中准备的16条数据。接下来，我们再来完成DQL语法的学习。

#### 2.5.1 基本语法

DQL 查询语句，语法结构如下：

```sql
SELECT
	字段列表 
FROM
	表名列表 
WHERE
	条件列表 
GROUP BY 
	分组字段列表 
HAVING
	分组后条件列表 
ORDER BY 
	排序字段列表 
LIMIT
	分页参数
```

我们在讲解这部分内容的时候，会将上面的完整语法进行拆分，分为以下几个部分：

- 基本查询（不带任何条件）

- 条件查询（WHERE）

- 聚合函数（count、max、min、avg、sum）

- 分组查询（group by）

- 排序查询（order by）

- 分页查询（limit） 

#### 2.5.2 基础查询

在基本查询的DQL语句中，不带任何的查询条件，查询的语法如下：

##### 1). 查询多个字段

```SQL
SELECT 字段1, 字段2, 字段3 ... FROM 表名 ; 
SELECT * FROM 表名 ;
```

> 注意 : * 号代表查询所有字段，在实际开发中尽量少用（不直观、影响效率）。

##### 2). 字段设置别名

```SQL
SELECT 字段1 [ AS 别名1 ] , 字段2 [ AS 别名2 ] ... FROM 表名; 
SELECT 字段1 [ 别名1 ] , 字段2 [ 别名2 ] ... FROM 表名;
```



##### 3). 去除重复记录

```sql
SELECT DISTINCT 字段列表 FROM 表名;
```



案例：

A. 查询指定字段 name, workno, age并返回

```sql
select name,workno,age from emp;
```

B. 查询返回所有字段

```sql
select id ,workno,name,gender,age,idcard,workaddress,entrydate from emp; 
select * from emp;
```

C. 查询所有员工的工作地址,起别名

```sql
select workaddress as '工作地址' from emp; 
-- as可以省略 
select workaddress '工作地址' from emp;
```

D. 查询公司员工的上班地址有哪些(不要重复) 

```sql
select distinct workaddress '工作地址' from emp;
```

#### 2.5.3 条件查询

##### 1) 语法

```sql
SELECT 字段列表 FROM 表名 WHERE 条件列表 ;
```

##### 2) 条件

常用的比较运算符如下:

| 比较运算符          | 功能                                     |
| ------------------- | ---------------------------------------- |
| >                   | 大于                                     |
| >=                  | 大于等于                                 |
| <                   | 小于                                     |
| <=                  | 小于等于                                 |
| =                   | 等于                                     |
| <> 或 !=            | 不等于                                   |
| BETWEEN ... AND ... | 在某个范围之内(含最小、最大值)           |
| IN(...)             | 在in之后的列表中的值，多选一             |
| LIKE 占位符         | 模糊匹配(_匹配单个字符, %匹配任意个字符) |
| IS NULL             | 是NULL                                   |

常用的逻辑运算符如下:

| 逻辑运算符 | 功能                        |
| ---------- | --------------------------- |
| AND 或 &&  | 并且 (多个条件同时成立)     |
| OR 或 \|\| | 或者 (多个条件任意一个成立) |
| NOT 或 !   | 非 , 不是                   |

##### 3) 案例举例

A. 查询年龄等于 88 的员工

```
select * from emp where age = 88;
```

B. 查询年龄小于 20 的员工信息

```
select * from emp where age < 20;
```

C. 查询年龄小于等于 20 的员工信息

```
select * from emp where age <= 20;
```

D. 查询没有身份证号的员工信息

```
select * from emp where idcard is null;
```

E. 查询有身份证号的员工信息

```
select * from emp where idcard is not null;
```

F. 查询年龄不等于 88 的员工信息

```
select * from emp where age != 88; 
select * from emp where age <> 88;
```

G. 查询年龄在15岁(包含) 到 20岁(包含)之间的员工信息

```
select * from emp where age >= 15 && age <= 20; 
select * from emp where age >= 15 and age <= 20; 
select * from emp where age between 15 and 20;
```

H. 查询性别为 女 且年龄小于 25岁的员工信息

```
select * from emp where gender = '女' and age < 25;
```

I. 查询年龄等于18 或 20 或 40 的员工信息

```
select * from emp where age = 18 or age = 20 or age =40; 
select * from emp where age in(18,20,40);
```

J. 查询姓名为两个字的员工信息 _ %

```
select * from emp where name like '__'; 
```

K. 查询身份证号最后一位是X的员工信息

```
select * from emp where idcard like '%X'; 
select * from emp where idcard like '_________________X';
```





#### 2.5.4 聚合函数

##### 1) 介绍

将一列数据作为一个整体，进行纵向计算 。

##### 2) 常见的聚合函数

| 函数  | 功能     |
| ----- | -------- |
| count | 统计数量 |
| max   | 最大值   |
| min   | 最小值   |
| avg   | 平均值   |
| sum   | 求和     |

##### 3). 语法

```sql
SELECT 聚合函数(字段列表) FROM 表名 ;
```



> 注意 : NULL值是不参与所有聚合函数运算的。





##### 4） 案例

A. 统计该企业员工数量

```sql
select count(*) from emp; -- 统计的是总记录数 
select count(idcard) from emp; -- 统计的是idcard字段不为null的记录数
```

对于count聚合函数，统计符合条件的总记录数，还可以通过 count(数字/字符串)的形式进行统计查询，比如：

```
select count(1) from emp;
```

> 对于count(*) 、count(字段)、 count(1) 的具体原理，我们在进阶篇中SQL优化部分会详细讲解，此处大家只需要知道如何使用即可。

B. 统计该企业员工的平均年龄























-----