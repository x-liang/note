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



