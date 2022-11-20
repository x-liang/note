# Java SQL 

## 一：SQL包的接口设计

### 1.1 java.sql包和javax.sql包

Java提供的与数据库操作相关的包主要有两个，它们是java.sql包和javax.sql包。java.sql和javax.sql共同为Java提供了强大的JDBC能力。我们接下来会介绍几个日常工作中常接触到的类，它们都由java.sql或javax.sql提供。

#### 1.1 java.sql包

java.sql通常被称为JDBC核心API包，它为Java提供了访问数据源中数据的基础功能。基于该包能实现将SQL语句传递给数据库、从数据库中以表格的形式读写数据等功能。

java.sql提供了一个Driver接口作为数据库驱动的接口。不同种类的数据库厂商只需根据自身数据库特点开发相应的Driver实现类，并通过DriverManager进行注册即可。这样，基于JDBC便可以连接不同公司不同种类的数据库。

除此之外，java.sql还为数据库连接、SQL语句、结果集等提供了众多的类，如表示数据库连接的Conection类、表示数据库操作语句的Statement类、表示数据库操作结果的ResultSet类等。

基于java.sql包，Java程序能够完成各种数据库操作。通常完成一次数据库操作的流程如下所示。

- 建立DriverManager对象。
- 从DriverManager对象中获取Connection对象。
- 从Connection对象中获取Statement对象。
- 将SQL语句交给Statement对象执行，并获取返回的结果，结果通常放在ResultSet中。

#### 1.2 Javax.sql包

javax.sql通常被称为JDBC扩展API包，它扩展了JDBC核心API包的功能，提供了对服务器端的支持，是Java企业版的重要部分。

例如，javax.sql提供了DataSource接口，通过它可以获取面向数据源的Connection对象，与java.sql中直接使用DriverManager建立连接的方式相比更为灵活（实际上，DataSource接口的实现中也是通过DriverManager对象获取Connection对象的)，除此之外，javax.sql还提供了连接池、语句池、分布式事务等方面的诸多特性。

使用javax.sql包扩展了java.sql包之后，建议使用DataSource来获取Connection对象，而不是直接使用DriverManager对象。于是，一条SQL语句的执行过程如下，

- 建立DataSource对象。
- 从DataSource对象中获取Connection对象。
- 从Connection对象中获取Statement对象。
- 将SQL语句交给Statement对象执行，并获取返回的结果，结果通常放在ResultSet中。

### 1.2 DriverManager

DriverManager 接口位于java.sql，它是JDBC驱动程序管理器，可以管理一组JDBC驱动程序。DriverManager的一个重要功能是能够给出一个面向数据库的连接对象Connection，该功能是由 DriverManager 中的 getConnection 方法提供的。

当调用 getConnection 方法时，DriverManager 会尝试在已经加载的驱动程序中找出合适的一个，并用找出的驱动程序建立一个面向指定数据库的连接，最后将建立的连接返回。

DriverManager 中主要有下面几个方法。这些方法都是静态方法，不需要建立DriverManager对象便可以直接调用。

- void registerDriver ：向 DriverManager 中注册给定的驱动程序。
- void deregisterDriver：从 DriverManager 中删除给定的驱动程序。
- Driver getDriver：查找能匹配给定URL路径的驱动程序。
- Enumeration getDrivers：获取当前调用者可以访问的所有已加载的JDBC驱动程序。
- Connection getConnection：建立到给定数据库的连接。



### 1.3 DataSource

DataSource 是 javax.sql的一个接口。顾名思义，它代表了一个实际的数据源，其功能是作为工厂提供数据库连接。

DataSource 接口中只有以下两个接口方法，都用来获取一个Connection 对象：

- getConnection()：从当前的数据源中建立一个连接。
- geConnection(String，Sring)：从当前的数据源中建立一个连接，输入的参数为数据源的用户名和密码。

javax.sal 中的 DataSoure 仅仅是一个接口，不同的数据库可以为其提供多种实现,常见的实现有以下几种。

- 基本实现：生成基本的到数据库的连接对象 Connection。
- 连接池实现：生成的 Connection 对象能够自动加到连接池中。
- 分布式事务实现：生成的Connection 对象能够参与分布式事务。

正因为 DataSource 接口可以有多种实现，与直接使用 DriverManager 获得连接Connection 的方式相比更为灵活。在日常的开发过程中，建议使用 DataSource 来获取数库连接。

而实际上，在 DataSource 的具体实现中，最终也是基于 DriverManager 获Connection，因此 DataSource 只是 DriverManager 的进一步封装。

### 1.4 Connection

Connection 接口位于java.sql中，它代表对某个数据库的连接。基于这个连接，可以完成SOL语句的执行和结果的获取等工作。

Connection 中常用的方法如下：

- Statement createStatement：创建一个 Statement 对象，通过它能将 SOL 语句发送到数据库。
- CallableStatement prepareCall: 创建一个CallableStatement对象，通过它能调用存储过程。
- PreparedStatement prepareStatement: 创建一个PreparedStatement 对象，通过它能将参数化的 SOL语句发送到数据库。
- String nativeSQL：将输入的 SQL 语句转换成本地可用的 SQL语句。
- void commit：提交当前事务。
- void rollback：回滚当前事务。
- void close：关闭当前的 Connection 对象。
- boolean isClosed：查询当前 Connection 对象是否关闭
- boolean isValid：查询当前 Connection 是否有效。
- void setAutoCommit：根据输入参数设定当前 Connection对象的自动提交模式
- int getTransactionIsolation：获取当前 Connection 对象的事务隔离级别。
- void setTransactionIsolation：设定当前 Connection 对象的事务隔离级别
- DatabaseMetaData getMetaData：获取当前 Cnnection 对象所连接的数据库的所有元数据信息。

上述方法主要用来完成获取 Statement 对象、设置 Connection 属性等功能。

同时，Connection 中存在事务管理的方法，如 commit、roliback 等。通过调用这些事务管理方法可以控制数据库完成相应的事务操作。

### 1.5 Statement

Statement 接口位于java.sql 中，该接口中定义的一些抽象方法能用来执行静态 SOL语句并返回结果。通常 Statement 对象会返回一个结果集对象 ResultSet

Statement接口中的主要方法有:

- void addBatch：将给定的SQL命令批量添加到Statement对象的SOL命令列表中。
- void clearBatch：清空 Statement 对象的SOL命令列表。
- int [] executeBatch：让数据库批量执行多个命令。如果执行成功，则返回一个数组数组中的每个元素都代表了某个命令影响数据库记录的数目。
- boolean execute：执行一条 SOL 语句。
- ResultSet executeQuery：执行一条SOL语句，并返回结果集 ResultSet对象。
- int executeUpdate：执行给定 SQL 语句，该语句可能为 INSERT、UPDATEDELETE或DDL语句等。
- ResultSet getResultSet：获取当前结果集 ResultSet 对象。
- ResultSet getGeneratedKeys：获取当前操作自增生成的主键
- boolean isClosed：获取是否已关闭了此 Statement 对象。
- void close：关闭 Statement 对象，释放相关的资源。
- Connection getConnection:获取生成此 Statement 对象的 Connection 对象

上述方法主要用来完成执行 SOL 语句、获取SOL 语执行结果等功能。

