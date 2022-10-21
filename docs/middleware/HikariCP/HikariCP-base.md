# HikariCP 基础



## HikariCP简介

### HikariCP是什么？

HikariCP 本质上就是一个数据库连接池。创建和关闭数据库连接的开销很大，HikariCP 通过“池”来复用连接，减小开销。

### Why HikariCP？

HikariCP 是目前最快的连接池。就连风靡一时的 boneCP 也停止维护，主动让位给它。SpringBoot 也把它设置为默认连接池。

HikariCP 非常轻量。本文用到的 4.0.3 版本的 jar 包仅仅只有 156 KB，它的源码真的非常精炼。



## HikariCP的使用

### 引入Mavne依赖

```xml
<!-- hikari -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>4.0.3</version>
</dependency>
<!-- mysql驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.15</version>
</dependency>
```

### 创建DataSource

`HikariCP`作为数据库连接池，提供实现了`DataSource`接口的`HikariDataSource`，使用HikariCP要构造`HikariDataSource`实例，有许多方式可以创建：

- 默认构造器，需要额外设置配置

```java
HikariDataSource ds = new HikariDataSource();
ds.setJdbcUrl("jdbc:mysql://localhost:3306/test");
ds.setUsername("root");
ds.setPassword("123456");
```

- 通过`HikariConfig`初始化:

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/test");
config.setUsername("root");
config.setPassword("123456");
HikariDataSource ds = new HikariDataSource(config);
```

- 通过配置文件进行初始化

```properties
jdbcUrl=jdbc:mysql://localhost:3306/github_demo?characterEncoding=utf8&serverTimezone=GMT%2B8
username=root
password=root
```

在代码中进行初始化

```java
// 加载配置文件，也可以无参构造并使用启动参数 hikaricp.configurationFile 指定配置文件（不推荐，后面会说原因）
HikariConfig config = new HikariConfig("/hikari2.properties");
HikariDataSource dataSource = new HikariDataSource(config);
```



### 获取连接

然后可以通过`ds`获取`Connection`实例，并用它执行查询：

```java
try (Connection connection = ds.getConnection(); 
     Statement st = connection.createStatement()) {
  ResultSet rs = st.executeQuery("show tables;");
  if (rs.next()) {
    System.out.println(rs.getString(1));
  }
} catch (Exception e) {
  // handle exception
}
```



## 配置参数详解

相比其他连接池，HikariCP 的配置参数非常简单，其中有几个功能需要注意：

1. HikariCP 借出连接时强制检查连接的活性，不像其他连接池一样可以选择不检查；
2. 默认会检查 idleTimeout、maxLifetime，可以选择禁用，但不推荐；
3. 默认不检查 keepaliveTime、leakDetectionThreshold，可以选择开启，推荐开启leakDetectionThreshold 即可。



### 必须的参数

注意，这里 jdbcUrl 和 dataSourceClassName 二选一。

```properties
#-------------必需的参数--------------------------------
# JDBC 驱动中 DataSource 的实现类全限定类名。不支持 XA DataSource
# 如果指定， HikariCP 将使用 DataSouce.getConnection 获取连接而不是使用 DriverManager.getConnection，官方建议指定（mysql 除外）
# dataSourceClassName=

# 如果指定， HikariCP 将使用 DriverManager.getConnection 获取连接而不是使用 DataSouce.getConnection
jdbcUrl=jdbc:mysql://localhost:3306/github_demo?characterEncoding=utf8&serverTimezone=GMT%2B8

# 用户名和密码
username=root
password=root
```



### 常用的参数

```properties
# 从池中借出的连接是否默认自动提交事务
# 默认 true
autoCommit=true

# 当我从池中借出连接时，愿意等待多长时间。如果超时，将抛出 SQLException
# 默认 30000 ms，最小值 250 ms。支持 JMX 动态修改
connectionTimeout=30000

# 一个连接在池里闲置多久时会被抛弃
# 当 minimumIdle < maximumPoolSize 才生效
# 默认值 600000 ms，最小值为 10000 ms，0表示禁用该功能。支持 JMX 动态修改
idleTimeout=600000

# 多久检查一次连接的活性
# 检查时会先把连接从池中拿出来（空闲的话），然后调用isValid()或执行connectionTestQuery来校验活性，如果通过校验，则放回池里。
# 默认 0 （不启用），最小值为 30000 ms，必须小于 maxLifetime。支持 JMX 动态修改
keepaliveTime=0

# 当一个连接存活了足够久，HikariCP 将会在它空闲时把它抛弃
# 默认 1800000  ms，最小值为 30000 ms，0 表示禁用该功能。支持 JMX 动态修改
maxLifetime=1800000

# 用来检查连接活性的 sql，要求是一个查询语句，常用select 'x'
# 如果驱动支持 JDBC4.0，建议不设置，这时默认会调用  Connection.isValid() 来检查，该方式会更高效一些
# 默认为空
# connectionTestQuery=

# 池中至少要有多少空闲连接。
# 当空闲连接 < minimumIdle，总连接 < maximumPoolSize 时，将新增连接
# 默认等于 maximumPoolSize。支持 JMX 动态修改
minimumIdle=5

# 池中最多容纳多少连接（包括空闲的和在用的）
# 默认为 10。支持 JMX 动态修改
maximumPoolSize=10

# 用于记录连接池各项指标的 MetricRegistry 实现类
# 默认为空，只能通过代码设置
# metricRegistry=

# 用于报告连接池健康状态的 HealthCheckRegistry 实现类
# 默认为空，只能通过代码设置
# healthCheckRegistry=

# 连接池名称。
# 默认自动生成
poolName=zzsCP
```



### 很少用的参数

```properties
# 如果启动连接池时不能成功初始化连接，是否快速失败 TODO
# >0 时，会尝试获取连接。如果获取时间超过指定时长，不会开启连接池，并抛出异常
# =0 时，会尝试获取并验证连接。如果获取成功但验证失败则不开启池，但是如果获取失败还是会开启池
# <0 时，不管是否获取或校验成功都会开启池。
# 默认为 1
initializationFailTimeout=1

# 是否在事务中隔离 HikariCP 自己的查询。
# autoCommit 为 false 时才生效
# 默认 false
isolateInternalQueries=false

# 是否允许通过 JMX 挂起和恢复连接池
# 默认为 false
allowPoolSuspension=false

# 当连接从池中取出时是否设置为只读
# 默认值 false
readOnly=false

# 是否开启 JMX
# 默认 false
registerMbeans=true

# 数据库 catalog
# 默认由驱动决定
# catalog=

# 在每个连接创建后、放入池前，需要执行的初始化语句
# 如果执行失败，该连接会被丢弃
# 默认为空
# connectionInitSql=

# JDBC 驱动使用的 Driver 实现类
# 一般根据 jdbcUrl 判断就行，报错说找不到驱动时才需要加
# 默认为空
# driverClassName=

# 连接的默认事务隔离级别
# 默认值为空，由驱动决定
# transactionIsolation=

# 校验连接活性允许的超时时间
# 默认 5000 ms，最小值为 250 ms，要求小于 connectionTimeout。支持 JMX 动态修改
validationTimeout=5000

# 连接对象可以被借出多久
# 默认 0（不开启），最小允许值为 2000 ms。支持 JMX 动态修改
leakDetectionThreshold=0

# 直接指定 DataSource 实例，而不是通过 dataSourceClassName 来反射构造
# 默认为空，只能通过代码设置
# dataSource=

# 数据库 schema
# 默认由驱动决定
# schema=

# 指定连接池获取线程的 ThreadFactory 实例
# 默认为空，只能通过代码设置
# threadFactory=

# 指定连接池开启定时任务的 ScheduledExecutorService 实例（建议设置setRemoveOnCancelPolicy(true)）
# 默认为空，只能通过代码设置
# scheduledExecutor=

# JNDI 配置的数据源名
# 默认为空
# dataSourceJndiName=
```

