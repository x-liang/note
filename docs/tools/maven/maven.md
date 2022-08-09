# Maven

## 一：何为Maven

Maven是一个异常强大的构建工具，能够帮助我们自动化构建过程，从清理、编译、测试到生成报告，再到打包和部署。Maven在设计上最大化的消除了构建的重复、抽象了构建声明周期，并且为绝大部分的构建任务提供了以实现的插件。

一言以蔽之，Maven标准化了Java项目的构建过程。

## 二：Maven的安装和配置

### 2.1 安装

没啥好说的，下载、解压、配置环境变量就OK了。

### 2.2 Maven的目录分析

首先来看一下目录结构

```shell
drwxr-xr-x 1 xuliang 197121     0  1月 12  2022 bin/
drwxr-xr-x 1 xuliang 197121     0  1月 12  2022 boot/
drwxr-xr-x 1 xuliang 197121     0  1月 12  2022 conf/
drwxr-xr-x 1 xuliang 197121     0  1月 12  2022 lib/
-rw-r--r-- 1 xuliang 197121 17800 11月 14  2021 LICENSE
-rw-r--r-- 1 xuliang 197121  5141 11月 14  2021 NOTICE
-rw-r--r-- 1 xuliang 197121  2612 11月 14  2021 README.txt
```

- bin： 该目录包含了mvn运行的脚本，这些脚本用来配置java命令，准备好classpath和相关的Java系统属性，然后执行Java命令。

- boot：该目录只包含一个文件，该文件为plexus-classworlds-2.5.2.jar。plexus-classworlds是一个类加载器框架，相对于默认的java类加载器，它提供了更加丰富的语法以方便配置，Maven使用该框架加载自己的类库。

- conf：该目录包含了一个非常重要的文件settings.xml。直接修改该文件，就能在机器上全局地定制maven的行为，即对所有用户都生效。一般情况下，我们更偏向于复制该文件至~/.m2/目录下，然后修改该文件，在用户级别定制Maven的行为。
- lib：该目录包含了所有Maven运行时需要的Java类库，Maven本身是分模块开发的，因此用户能看到诸如maven-core-3.0.jar、maven-model-3.0.jar之类的文件，此外这里还包含一些Maven用到的第三方依赖如commons-cli-1.2.jar、commons-lang-2.6.jar等等。、




### 2.3 Maven安装最佳实践

#### 2.3.1 设置MAVEN_OPTS环境变量

该环境变量可以配置一些JVM运行时参数，Java的默认内存较小，在编译大项目是不能够满足Maven的需要。

通常设置值为-Xms128m -Xmx512m。

#### 2.3.2 配置用户范围的settings.xml

便于统一环境配置，避免多Maven下环境不一致的因素

#### 2.3.3 不要使用IDE内嵌的Maven

存在不稳定因素



## 三：Maven的使用入门



## 四：坐标和依赖



### 4.1 坐标详解

maven坐标通过一些元素进行定义，groupId、artifactId、version、packaging、classifier。首先来看一个示例

```xml
<groupId>com.xul</groupId>
<artifactId>colorful</artifactId>
<packaging>pom</packaging>
<version>1.0-SNAPSHOT</version>
<description>个人试验项目</description>
```

- groupId：实际的项目名称（必须）
- artifactId：Maven项目下一个模块的名称（必须）
- version：版本信息（必须）
- packaging：maven的打包方式(该属性可选，默认为jar)
- classifier：该元素用来帮助定义构建输出一些附属构件（不能直接定义）





### 4.2 依赖配置

先来看一个例子

```xml
<dependencies>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>1.7.25</version>
        <type>...</type>
        <scope>...</scope>
        <optional>...</optional>
        <exclusions>
        	<exclusion>...</exclusion>
        </exclusions>
    </dependency>
</dependencies>
```

- groupId、artifactId、version：这三个属性是基本坐标，是必要的
- type：依赖的类型，对应项目坐标定义中的packaging，通常不用声明，默认值为jar
- scope：依赖的范围
- optional：标记依赖是否可选
- exclusions：用来排除传递性依赖



### 4.3 依赖范围

依赖范围对应到依赖配置的scope属性。用来控制jar包在不同时期（编译、测试、运行）的可见性问题。

Mave有一些几种依赖范围：

- complie：编译依赖范围，默认使用该依赖范围。对于编译，测试，运行三种环境都有效。
- test：测试依赖范围，仅在编译和运行测试代码是有效。典型的例子Junit
- provided：已提供依赖范围，对于编译和测试范围有效，在运行时无效。典型例子servlet-api
- runtime：运行时依赖范围，对于测试和运行时有效，编译主代码是无效，典型例子JDBC驱动。
- system：系统依赖范围，该依赖不由maven仓库管理，需要配置本地路径，不建议使用。
- import：导入依赖范围，该依赖不会对环境产生实际的影响。



### 4.4 依赖的传递性

**maven会自动引入依赖包的间接依赖**



### 4.5 依赖调节

Maven调节依赖的两大原则：

- 路径优先
- 声明优先

例如存在如下依赖关系：A->B->C->X(1.0), A->D->X(2.0)，那么本着路径优先的原则，会使用X(2.0)。如果路径相同呢，比如 A-B-Y(1.0)和 A->B->Y(2.0)，在这种情况下，Maven会使用声明优先。在依赖路径长度相等的前提下，在POM中依赖声明的顺序决定了谁会被解析使用，顺序在靠前的那个依赖优胜。





### 4.6 可选依赖

对应到依赖配置中的optional选项。





## 五：仓库

maven仓库，就是存储jar包的地方。统一管理，减少了磁盘空间的浪费。



### 5.1 仓库的分类

在Maven中仓库只分为两类：本地方库，远程仓库。

**5.1.1 本地仓库**

就是存储在本地

**5.1.2 远程仓库**

远程仓库分为两种，中央仓库，是Maven核心自带的仓库，如果在本地仓库中缺少所需的构建时，maven就会自动去中央仓库下载。还有一种就是私服，私服架设在局域网内部，可以节省带宽和时间，内部项目还可以发布到私服上。

处理这两种外，还有一些其他的公开仓库，这里不做介绍。



### 5.2 本地仓库

本地仓库默认在`~/.m2/repository/`文件夹下，可以通过修改settings.xml配置文件进行修改

```xml
<settings>
	<localRepository>D:\cache\maven-repository</localRepository>
</settings>
```



如何将一个Maven项目保存到本地仓库呢：

```shell
mvn clean install
```



### 5.3 远程仓库

#### 5.3.1 远程仓库的配置

```xml
<project>
	<repositories>
    	<repository>
            <!--仓库的id必须唯一，maven中央仓库的id默认为central -->
        	<id></id>
            <name></name>
            <!-- 仓库的url地址，通常都是基于http协议 -->
            <url></url>
            <release>
                <!-- 是否允许在该仓库下载release版本-->
            	<enable>true</enable>
                <!-- 检查更新的频率，默认daily，即每天检查一次。其他值包括：
                never——从不检查，
                always——每次构建时检查；
                interval:X——每个X分钟检查一次 -->
                <updatePolicy>daily</updatePolicy>
                <!-- 文件的校验策略， 默认warn，其他值包括fail， ignore-->
                <checksumPolicy>ignore</checksumPolicy>
            </release>
            <snapshots>
                <!-- 是否允许在该仓库下载snapshots版本-->
            	<enable>false</enable>
            </snapshots>
            <layout>default</layout>
        </repository>
    </repositories>
</project>
```

maven的中央仓库的id默认为central，如果声明了一个id为central的其他仓库，那么他会覆盖中央仓库。

#### 5.3.2 仓库认证配置

有的远程仓库访问需要认证，我们需要在配置文件中配置认证需要的用户名及密码，认证信息必须在settings.xml配置文件中进行配置，如下：

```xml
<servers>
    <server>
      <id>koan</id>
      <username>chenyao</username>
      <password>mlamp123456</password>
    </server>
  </servers>
```

这里需要注意的一点是这里的id和仓库配置的id一一对应。换句话说，正是id将认证信息将仓库配置联系在了一起。



#### 5.3.3 部署至远程仓库

私服仓库的一大作用就是部署组织内部的构件。Maven除了能对项目进行编译、测试、打包之外，还能将项目生成的构件部署到仓库中。首先需要编辑项目的pom.xml配置

```xml
<project>
	<distributionManagement>
        <!-- 稳定版仓库地址-->
    	<repository>
            <!-- id 是远程仓库的唯一标识-->
        	<id></id>
            <!-- name 主要方便人阅读-->
            <name></name>
            <!-- 远程仓库的地址-->
            <url></url>
        </repository>
        <!-- 快照版仓库地址-->
        <snapshotRepository>
        	<id></id>
            <name></name>
            <url></url>
        </snapshotRepository>
    </distributionManagement>
</project>
```

私服仓库如果需要认证，可以按照5.3.2节介绍的方式进行配置。

最后执行maven命令，将本地构件发布到远程仓库

```shell
mvn clean deploy
```

 

### 5.4 快照版本

在pom中的版本信息中加上SNAPSHOT，maven就可以识别当前版本为快照版本。在发布快照版本到私服仓库时，maven会自动为构件打上时间戳。当有其他模块依赖该构件的快照版本时，会自动下载最新时间戳的构件。





### 5.5 从仓库解析依赖的机制

当本地仓库没有依赖构件的时候，Maven会自动从远程仓库下载；当依赖版本为快照版本时，Maven会自动找到最新的快照版本。解析流程如下：

1） 当依赖范围是system的时候，maven直接从本地文件系统解析构件。

2） 根据依赖坐标计算仓库路径，从本地仓库解析

3）本地仓库不存在，遍历远程仓库，发现后，下载并使用。

4）如果依赖的版本是RELEASE或者LATEST，读取所有远程仓库的数据，合并计算真实版本

5）如果依赖的版本是SNAPSHOT，读取所有远程仓库的元数据，合并计算出最新的快照版本，下载使用

6）如果是时间戳格式的快照版本，重新拼接快照版本信息，再到远程仓库查找。



> 注意：在指定版本时，不推荐使用RELEASE、LATEST、SNAPSHOT等字样。因为无法预测maven最终解析出的构建的版本信息。
>
> 最好直接指定具体的版本信息。



### 5.6 镜像

镜像仓库就是对另一个仓库的复制品。比如阿里提供的maven仓库。

使用maven的镜像仓库，需要配置settings.xml文件

```xml
<settings>
	<mirrors>
    	<mirror>
        	<id>ali-maven</id>
            <!-- mirrirOf 的值为central，表示该配置为中央仓库的镜像 -->
        	<mirrorOf>central</mirrorOf>
            <name>阿里云公共仓库</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

镜像仓库通常结合私服仓库使用。

**镜像的高级配置**

- `<mirrorOf> * <mirrorOf>` ： 匹配所有远程仓库
- `<mirrorOf> external:* <mirrorOf>`: 匹配所有不在本机上的远程仓库
- `<mirrorOf> repo1,repo2 <mirrorOf>`：匹配名称为repo1和repo2的远程仓库
- `<mirrorOf> *,!repo1 <mirrorOf>`：匹配除repo1外的所有远程仓库



> 注意：镜像仓库会完全覆盖远程仓库，如果镜像仓库无法访问，maven也不会访问远程仓库。



### 5.7 Maven的搜索服务



一个非常好用的Maven仓库搜索网站

[Maven 仓库搜索服务](https://mvnrepository.com/)



## 六：Maven的生命周期和插件



生命周期和插件是maven的两大核心概念。生命周期是maven的抽象，插件则是maven的具体实现，两者协同工作，密不可分。

### 6.1 生命周期

Maven的生命周期就是一为了对所有的构件过程进行抽象和统一。生命周期包括：清理、初始化、编译、测试、打包、集成测试、验证、部署和站点生成等构件步骤。

生命周期只负责抽象各个步骤，具体的实现是有不同的插件来实现的。



#### 6.1.1 三套生命周期

Maven内部拥有三套相互独立的生命周期，分别为clean、default、site。clean的目的时清理项目，default的目的时构件项目，site的目的时建立项目站点。这三个生命周期相互独立，调用时互不影响。

每个生命周期内部又分为多个阶段(phase)，这些阶段前后依赖，按指定顺序执行。例如clean生命周期，包含pre-clean、clean、post-clean三个阶段。当调用pre-clean时，只有pre-clean执行，调用clean时，pre-clean和clean按顺序执行，当调用post-clean时，pre-clean、clean和post-clean会先后执行。

#### 6.1.2 clean生命周期

clean生命周期主要包含三个阶段：

- pre-clean 执行一些清理前需要完成的工作。
- clean 执行上次侯建生成的文件
- post-clean 执行一些清理后需要完成的工作。

#### 6.1.3 default 生命周期

default生命周期定义了项目构件过程需要执行的所有步骤。

- validate
- initialize
- generate-sources
- process-sources 处理项目注资源文件，一般来说是对src/main/resources目录的内容进行变量替换等工作，复制到项目输出的主classpath目录中。
- generate-resources
- process-resources
- compile 编译项目的主源码，一般来说是src/main/java目录下的java文件到项目输出的主classpath目录中。
- process-classes
- generate-test-sources
- process-test-sources 处理项目测试资源文件，主要是对src/test/resources目录的内容
- generate-test-resources
- process-test-resources
- test-complie 编译项目的测试代码
- process-test-classes
- test 使用单元测试框架运行测试，测试代码不会给打包部署
- prepare-package
- package  接受编译好的代码，打包成可发布的格式，如jar包
- pre-integration-test
- integration-test
- post-integration-test
- verify
- install 将包装到maven本地仓库，供本地其他maven项目使用
- deploy 将最终的包复制到远程仓库，供其他开发人员和项目使用。



#### 6.1.4 site生命周期

site生命周期主要是建立和发布站点

- pre-site 执行一些在生成项目站点之前需要完成的工作。
- site 生成项目站点文档
- post-site 执行一些在生成项目站点之后需要完成的工作
- site-deploy 将生成的项目站点发布到服务器上



### 6.2 插件

#### 6.2.1 插件目标

插件目标就是插件需要完成的功能。例如maven-dependency-plugin，这个插件有十几个目标，例如 dependency:analyze，dependency:tree，dependency:list等

maven-compiler-plugin插件的目标，compiler:compile，

maven-surefire-plugin插件的目标 surefire:test。



#### 6.2.2 插件绑定

就是将maven的生命周期和插件的目标进行绑定，来完成实际的任务。例如maven-compiler-plugin插件的compile目标就是用来完成default生命周期中的compile这一阶段的。



#### 6.2.3 内置绑定

Maven默认会为一些主要的生命周期阶段绑定产检目标，当执行maven命令时，就会自动执行插件的目标。

maven-clean-plugin插件绑定的生命周期只有一个：clean

maven-site-plugin插件绑定两个生命周期，site:site 和 site:deploy



default生命周期的绑定关系比较复杂，不同的打包任务，绑定过程也有一些区别，这里先介绍大jar包的绑定关系

| 生命周期阶段           | 插件目标                             | 执行任务                       |
| ---------------------- | ------------------------------------ | ------------------------------ |
| process-resources      | maven-resources-plugin:resources     | 复制主资源文件至主输出目录     |
| compile                | maven-compiler-plugin:compile        | 编译主代码至主输出目录         |
| process-test-resources | maven-resources-plugin:testResources | 复制测试资源文件至测试输出目录 |
| test-compile           | maven-compiler-plugin:testCompile    | 编译测试代码至测试输出目录     |
| test                   | maven-surefire-plugin:test           | 执行测试用例                   |
| package                | maven-jar-plugin:jar                 | 创建项目jar包                  |
| install                | maven-install-plugin:install         | 将项目输出构件安装到本地仓库   |
| deploy                 | maven-deploy-plugin:deploy           | 将项目输出构件部署到远程仓库   |

#### 6.2.4 自定义绑定

例如需要创建项目的源码包，我们需要修改pom文件

```xml
<build>
	<plugins>
    	<plugin>
        	<groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>2.1.1</version>
            <executions>
            	<execution>
                	<id>attach-sources</id>
                    <!-- phase标签用来指定声明周期中的特定阶段-->
                    <phase>verify</phase>
                    <goals>
                        <!-- goal标签用来指定插件的目标-->
                    	<goal>jar-no-fork</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

在build的plugins下声明要使用的插件，包括坐标及版本信息。除此之外，还要配置插件执行配置信息。executions下的每个execution子元素可以用来配置执行的一个任务。phase标签用来指定声明周期的阶段，goals用来指定插件的目标，合起来的意思就是在phase标签声明的生命周期中执行goal标签中声明的插件目标。

这里的phase标签可以不用配置，很多插件在编写是会给定默认的绑定配置，可以通过一些命令进行查询：

```shell
mvn help:describe -Dplugin=org.apache.maven.plugins:maven-source-plugin:2.1.1 -Ddetail
```

查询结果如下：

```shell
source:jar-no-fork
  Description: This goal bundles all the sources into a jar archive. This
    goal functions the same as the jar goal but does not fork the build and is
    suitable for attaching to the build lifecycle.
  Implementation: org.apache.maven.plugin.source.SourceJarNoForkMojo
  Language: java
  Bound to phase: package

  Available parameters:
```

这里只展示了部分信息，其中Bound to phase: package说明了该目标绑定到了package阶段。

#### 6.2.5 插件配置

配置插件参数，可以调整插件执行任务的逻辑，以满足项目需求。我们可以通过命令行或pom文件的方式来配置参数；

1） 通过命令行进行配置

```shell
mvn clean package -Dmaven.test.skip=true
```

通过-D的形式添加一些参数值。

2）通过pom配置文件的形式

```xml
<build>
	<plugins>
    	<plugin>
        	<groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>2.1</version>
            <configuration>
            	<source>1.8</source>
                <target>1.8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

这里注意，configuration标签位于plugin目录下，意味着是全局配置，当configuration位于execution目录下，则表示改配置专属于某一个执行任务。



#### 6.2.6 获取插件信息

maven官网提供了常用的插件信息

[Maven 插件列表](https://maven.apache.org/plugins/index.html)

#### 6.2.7 常用插件介绍







## 七：Maven的聚合于继承

### 7.1 聚合

何为聚合，packaging的打包方式为pom，存在modules标签，声明引入的模块。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.xul</groupId>
    <artifactId>spring-demo</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>

    <modules>
        <module>spring-framework-demo</module>
        <module>spring-boot-demo</module>
        <module>spring-boot-toolkit</module>
        <module>spring-kafka</module>
        <module>spring-dependence</module>
        <module>spring-cloud</module>
    </modules>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <!-- 这里就是为了便于管理项目， 不引入任何依赖-->
</project>
```

通常的用法是创建子模块的形式，不过目录也可以使用平行目录，但是在引入module的时候，需要指向正确的目录，如下：

```xml
<modules>
    <module>../spring-framework-demo</module>
    <module>../spring-boot-demo</module>
    <module>../spring-cloud</module>
</modules>
```

### 7.2 继承

#### 7.2.1 parent元素

通过parent标签可以继承父模块pom中定义的一些元素

```xml
<parent>
    <artifactId>spring-demo</artifactId>
    <groupId>com.xul</groupId>
    <version>1.0-SNAPSHOT</version>
</parent>
```

那么那些pom元素可以被继承呢？

- groupId 项目组ID，项目坐标的核心元素
- version：项目版本信息，项目坐标的核心元素
- description：项目的描述信息
- organization：项目的组织信息
- inceptionYear 项目的创始年份
- url：项目的URL地址
- developers：项目的开发者信息
- contributors：项目的贡献者信息
- distributionManagement：项目的部署配置信息
- issueManagement项目的缺陷跟踪系统信息
- ciManagement：项目的持续集成系统信息
- scm：项目的版本控制信息
- mailingLists：项目的邮件列表
- properties：自定义的maven属性
- dependencise：项目的依赖配置
- dependencyManagement：项目的依赖管理配置
- repositories：项目的仓库配置
- build：包括项目的源码目录配置，输出目录配置，插件配置，插件管理配置等。
- reporting：包括项目的报告输出目录配置，报告插件配置等。



#### 7.2.2 依赖管理

dependencyManagement元素



#### 7.2.3 插件管理

pluginManagement元素，该元素在build标签下。

插件中的配置信息也会被继承。



## 八：使用Maven测试

maven使用maven-surefire-plugin插件执行测试用例。

在默认情况下，maven-surefire-plugin插件会自动执行测试源码路径(src/test/java)下所有符合一次命名模式的测试类：

- `**/Test*.java`: 任何目录下所有以Test开头的Java类
- `**/*Test.java`:任何目录下所有以Test结尾的Java类
- `**/*TestCase.java`:任何目录下所有以TestCase结尾的Java类



### 8.1 跳过测试代码

可以使用skipTests参数：

```shell
mvn clean package -DskipTests
```

就可以临时跳过测试用例。当然也可以通过pom配置

```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.5</version>
    <configuration>
    	<sikpTests>true</sikpTests>
    </configuration>
</plugin>
```

除了sikpTests参数还可以通过maven.test.skip=true来进行跳过

```shell
mvn clean package -Dmaven.test.skip=true
```

但是maven.test.skip参数除了跳过了测试代码运行阶段，还跳过了测试代码的编译阶段，不推荐使用。pom配置的方式：

```xml
<plugins>
    <plugin>
    	<groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>2.1</version>
        <configuration>
            <sikpTests>true</sikpTests>
        </configuration>
    </plugin>
    <plugin>
    	<groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>2.5</version>
        <configuration>
            <sikpTests>true</sikpTests>
        </configuration>
    </plugin>
</plugins>
```

因为maven.test.skip同时跳过了测试代码的编译和运行阶段，所以这里需要同时配置两个插件参数。



### 8.2 动态指定测试用例

指定执行某一个测试类

```shell
# 仅运行SpecialTest测试类
mvn test -Dtest=SpecialTest
# 支持*匹配
mvn test -Dtest=Special*Test
# 支持同时指定多个测试类
mvn test -Dtest=Special*Test,SpecialTest
```



### 8.3 自定义包含和排除测试用例



```xml
<plugins>
	<plugin>
    	<groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>2.5</version>
        <configuration>
        	<includes>
                <!-- 两个*号匹配任意路径-->
            	<include>**/*Tests.java</include>
            </includes>
            <excludes>
            	<exclude>**/*ServiceTest.java</exclude>
                <exclude>**/TempDaoTests.java</exclude>
            </excludes>
        </configuration>
    </plugin>
</plugins>
```

### 8.4 测试覆盖率

cobertura-maven-plugin

### 8.5 重用测试代码

```xml
<plugins>
	<plugin>
    	<groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <version>2.2</version>
        <exectioins>
        	<exection>
            	<goals>
                	<goal>test-jar</goal>
                </goals>
            </exection>
        </exectioins>
    </plugin>
</plugins>
```

添加此配置后，就可以打包测试代码了。test-jar默认绑定到package周期，如果其他项目依赖此测试代码，可以引入

```xml
<dependency>
	<groupId></groupId>
    <artifactId></artifactId>
    <version></version>
    <type>test-jar</type>
    <scope>test</scope>
</dependency>
```













## 最后：配置详解

### maven 配置详解

[博客地址](https://www.cnblogs.com/hongmoshui/p/10762272.html)

#### 概要

##### settings.xml的作用

它是用来设置Maven参数的配置文件。并且，settings.xml是Maven的全局配置文件。settings.xml中包含类似本地仓库、远程仓库和联网使用的代理信息等配置。

##### settings.xml文件位置

settings.xml文件一般存在于Maven的安装目录的conf子目录下面，或者是用户目录的.m2子目录下面。

##### 配置的优先级

其实相对于多用户的PC机而言，在Maven安装目录的conf子目录下面的settings.xml才是真正的全局的配置。而用户目录的.m2子目录下面的settings.xml的配置只是针对当前用户的。当这两个文件同时存在的时候，那么对于相同的配置信息用户目录下面的settings.xml中定义的会覆盖Maven安装目录下面的settings.xml中的定义。用户目录下的settings.xml文件一般是不存在的，但是Maven允许我们在这里定义我们自己的settings.xml，如果需要在这里定义我们自己的settings.xml的时候就可以把Maven安装目录下面的settings.xml文件拷贝到用户目录的.m2目录下，然后改成自己想要的样子。

#### settings.xml元素详解

顶级元素

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                          https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <!--
 	该值表示构建系统本地仓库的路径。其默认值：~/.m2/repository。
	<localRepository>${user.home}/.m2/repository</localRepository>
	-->
    <localRepository/>
    <!--
	表示maven是否需要和用户交互以获得输入。如果maven需要和用户交互以获得输入，则设置成true，反之则应为false。默认为true。
	<interactiveMode>true</interactiveMode>
	-->
  	<interactiveMode/>
    <!--
	maven是否需要使用plugin-registry.xml文件来管理插件版本。如果需要让maven使用文件~/.m2/plugin-registry.xml来管理插件版本，则设为true。默认为false。
	<usePluginRegistry>false</usePluginRegistry>
	-->
    <usePluginRegistry/>
    <!--
 	这个属性表示在Maven进行项目编译和部署等操作时是否允许Maven进行联网来下载所需要的信息。如果构建系统需要在离线模式下运行，则为true，默认为false。当由于网络设置原因或者安全因素，构建服务器不能连接远程仓库的时候，该配置就十分有用。
	<offline>false</offline>
	-->
    <offline/>
     <!--
 	在pluginGroups元素下面可以定义一系列的pluginGroup元素。表示当通过plugin的前缀来解析plugin的时候到哪里寻找。pluginGroup元素指定的是plugin的groupId。默认情况下，Maven会自动把org.apache.maven.plugins 和 org.codehaus.mojo 添加到pluginGroups下。
	
	<pluginGroups>
  		plugin的组织Id（groupId） 
      	<pluginGroup>org.codehaus.mojo</pluginGroup>
    </pluginGroups>
	-->
    <pluginGroups/>
     <!--
 	
	-->
    <servers/>
     <!--
 	
	-->
    <mirrors/>
     <!--
 	
	-->
    <proxies/>
     <!--
 	
	-->
    <profiles/>
     <!--
 	
	-->
    <activeProfiles/>
</settings>
```

##### service

一般，仓库的下载和部署是在pom.xml文件中的repositories 和 distributionManagement 元素中定义的。然而，一般类似用户名、密码（有些仓库访问是需要安全认证的）等信息不应该在pom.xml文件中配置，这些信息可以配置在 settings.xml 中。

```xml
<!--配置服务端的一些设置。一些设置如安全证书不应该和pom.xml一起分发。这种类型的信息应该存在于构建服务器上的settings.xml文件中。 -->
<servers>
  <!--服务器元素包含配置服务器时需要的信息 -->
  <server>
    <!--这是server的id（注意不是用户登陆的id），该id与distributionManagement中repository元素的id相匹配。 -->
    <id>server001</id>
    <!--鉴权用户名。鉴权用户名和鉴权密码表示服务器认证所需要的登录名和密码。 -->
    <username>my_login</username>
    <!--鉴权密码 。鉴权用户名和鉴权密码表示服务器认证所需要的登录名和密码。密码加密功能已被添加到2.1.0 +。详情请访问密码加密页面 -->
    <password>my_password</password>
    <!--鉴权时使用的私钥位置。和前两个元素类似，私钥位置和私钥密码指定了一个私钥的路径（默认是${user.home}/.ssh/id_dsa）以及如果需要的话，一个密语。将来passphrase和password元素可能会被提取到外部，但目前它们必须在settings.xml文件以纯文本的形式声明。 -->
    <privateKey>${usr.home}/.ssh/id_dsa</privateKey>
    <!--鉴权时使用的私钥密码。 -->
    <passphrase>some_passphrase</passphrase>
    <!--文件被创建时的权限。如果在部署的时候会创建一个仓库文件或者目录，这时候就可以使用权限（permission）。这两个元素合法的值是一个三位数字，其对应了unix文件系统的权限，如664，或者775。 -->
    <filePermissions>664</filePermissions>
    <!--目录被创建时的权限。 -->
    <directoryPermissions>775</directoryPermissions>
  </server>
</servers>
```

##### mirros

用于定义一系列的远程仓库的镜像。我们可以在pom中定义一个下载工件的时候所使用的远程仓库。但是有时候这个远程仓库会比较忙，所以这个时候人们就想着给它创建镜像以缓解远程仓库的压力，也就是说会把对远程仓库的请求转换到对其镜像地址的请求。每个远程仓库都会有一个id，这样我们就可以创建自己的mirror来关联到该仓库，那么以后需要从远程仓库下载工件的时候Maven就可以从我们定义好的mirror站点来下载，这可以很好的缓解我们远程仓库的压力。在我们定义的mirror中每个远程仓库都只能有一个mirror与它关联，也就是说你不能同时配置多个mirror的mirrorOf指向同一个repositoryId。

```xml
<mirrors>
  <!-- 给定仓库的下载镜像。 -->
  <mirror>
    <!-- 该镜像的唯一标识符。id用来区分不同的mirror元素。 -->
    <id>mirrorId</id>
    <!-- 镜像名称 -->
    <name>PlanetMirror Australia</name>
    <!-- 该镜像的URL。构建系统会优先考虑使用该URL，而非使用默认的服务器URL。 -->
    <url>http://downloads.planetmirror.com/pub/maven2</url>
    <!-- 被镜像的服务器的id。例如，如果我们要设置了一个Maven中央仓库（http://repo.maven.apache.org/maven2/）的镜像，就需要将该元素设置成central。这必须和中央仓库的id central完全一致。 -->
    <mirrorOf>repositoryId</mirrorOf>
  </mirror>
</mirrors>
```

##### Proxies

用来配置不同的代理。

```xml
<proxies>
  <!--代理元素包含配置代理时需要的信息 -->
  <proxy>
    <!--代理的唯一定义符，用来区分不同的代理元素。 -->
    <id>myproxy</id>
    <!--该代理是否是激活的那个。true则激活代理。当我们声明了一组代理，而某个时候只需要激活一个代理的时候，该元素就可以派上用处。 -->
    <active>true</active>
    <!--代理的协议。 协议://主机名:端口，分隔成离散的元素以方便配置。 -->
    <protocol>http</protocol>
    <!--代理的主机名。协议://主机名:端口，分隔成离散的元素以方便配置。 -->
    <host>proxy.somewhere.com</host>
    <!--代理的端口。协议://主机名:端口，分隔成离散的元素以方便配置。 -->
    <port>8080</port>
    <!--代理的用户名，用户名和密码表示代理服务器认证的登录名和密码。 -->
    <username>proxyuser</username>
    <!--代理的密码，用户名和密码表示代理服务器认证的登录名和密码。 -->
    <password>somepassword</password>
    <!--不该被代理的主机名列表。该列表的分隔符由代理服务器指定；例子中使用了竖线分隔符，使用逗号分隔也很常见。 -->
    <nonProxyHosts>*.google.com|ibiblio.org</nonProxyHosts>
  </proxy>
</proxies>
```

##### Profiles

根据环境参数来调整构建配置的列表。settings.xml中的profile元素是pom.xml中profile元素的裁剪版本。它包含了id、activation、repositories、pluginRepositories和 properties元素。这里的profile元素只包含这五个子元素是因为这里只关心构建系统这个整体（这正是settings.xml文件的角色定位），而非单独的项目对象模型设置。如果一个settings.xml中的profile被激活，它的值会覆盖任何其它定义在pom.xml中带有相同id的profile。当所有的约束条件都满足的时候就会激活这个profile。

```xml
<profiles>
    <profile>
　　	   <!-- profile的唯一标识 -->
        <id>test</id>     
        <!-- 自动触发profile的条件逻辑 -->
        <activation>
            <activeByDefault>false</activeByDefault>
            <jdk>1.6</jdk>
            <os>
                <name>Windows 7</name>
                <family>Windows</family>
                <arch>x86</arch>
                <version>5.1.2600</version>
            </os>
            <property>
                <name>mavenVersion</name>
                <value>2.0.3</value>
            </property>
            <file>
                <exists>${basedir}/file2.properties</exists>
                <missing>${basedir}/file1.properties</missing>
            </file>
        </activation>
        <!-- 扩展属性列表 -->
        <properties />
        <!-- 远程仓库列表 -->
        <repositories />
        <!-- 插件仓库列表 -->
        <pluginRepositories />
      ...
    </profile>
</profiles>
```

Activation

自动触发profile的条件逻辑。这是profile中最重要的元素。跟pom.xml中的profile一样，settings.xml中的profile也可以在特定环境下改变一些值，而这些环境是通过activation元素来指定的。activation元素并不是激活profile的唯一方式。settings.xml文件中的activeProfile元素可以包含profile的id。profile也可以通过在命令行，使用-P标记和逗号分隔的列表来显式的激活（如，-P test）。







### maven常用命令

#### maven安装本地jar到仓库

```shell
mvn install:install-file -Dfile=path -DgroupId=groupId -DartifactId=artifactId -Dversion=version -Dpackaging=jar
```



#### 下载源码

```
mvn dependency:sources
```

Maven 安装源码和文档到本地仓库
一：

1： mvn source:jar 生成源码的jar包

2： mvn source:jar install 将源码安装到本地仓库 ，可以直接mvn source:jar install 一部将源码安装到仓库

二：

1: mvn javadoc:jar 生成项目的文档jar包

2: mvn javadoc:jar install 将项目文档安装到本地仓库





### Maven配置文件实例

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"     
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"     
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0http://maven.apache.org/maven-v4_0_0.xsd">     
  <!--父项目的坐标。如果项目中没有规定某个元素的值，那么父项目中的对应值即为项目的默认值。 坐标包括group ID，artifact ID和 version。-->    
  <parent>    
    <!--被继承的父项目的构件标识符-->    
    <artifactId/>    
    <!--被继承的父项目的全球唯一标识符-->    
    <groupId/>    
    <!--被继承的父项目的版本-->    
    <version/>      
  </parent>    
  <!--声明项目描述符遵循哪一个POM模型版本。模型本身的版本很少改变，虽然如此，但它仍然是必不可少的，这是为了当Maven引入了新的特性或者其他模型变更的时候，确保稳定性。-->       
  <modelVersion>4.0.0</modelVersion>     
  <!--项目的全球唯一标识符，通常使用全限定的包名区分该项目和其他项目。并且构建时生成的路径也是由此生成， 如com.mycompany.app生成的相对路径为：/com/mycompany/app-->     
  <groupId>cn.missbe.web</groupId>     
  <!-- 构件的标识符，它和group ID一起唯一标识一个构件。换句话说，你不能有两个不同的项目拥有同样的artifact ID和groupID；在某个 特定的group ID下，artifact ID也必须是唯一的。构件是项目产生的或使用的一个东西，Maven为项目产生的构件包括：JARs，源码，二进制发布和WARs等。-->     
  <artifactId>search-resources</artifactId>     
  <!--项目产生的构件类型，例如jar、war、ear、pom。插件可以创建他们自己的构件类型，所以前面列的不是全部构件类型-->     
  <packaging>war</packaging>     
  <!--项目当前版本，格式为:主版本.次版本.增量版本-限定版本号-->     
  <version>1.0-SNAPSHOT</version>     
  <!--项目的名称, Maven产生的文档用-->     
  <name>search-resources</name>     
  <!--项目主页的URL, Maven产生的文档用-->     
  <url>http://www.missbe.cn</url>     
  <!-- 项目的详细描述, Maven 产生的文档用。  当这个元素能够用HTML格式描述时（例如，CDATA中的文本会被解析器忽略，就可以包含HTML标 签）， 不鼓励使用纯文本描述。如果你需要修改产生的web站点的索引页面，你应该修改你自己的索引页文件，而不是调整这里的文档。-->     
  <description>A maven project to study maven.</description>     
  <!--描述了这个项目构建环境中的前提条件。-->    
  <prerequisites>    
    <!--构建该项目或使用该插件所需要的Maven的最低版本-->    
    <maven/>    
  </prerequisites>      

  <!--构建项目需要的信息-->    
  <build>    
    <!--该元素设置了项目源码目录，当构建项目的时候，构建系统会编译目录里的源码。该路径是相对于pom.xml的相对路径。-->    
    <sourceDirectory/>    
    <!--该元素设置了项目脚本源码目录，该目录和源码目录不同：绝大多数情况下，该目录下的内容 会被拷贝到输出目录(因为脚本是被解释的，而不是被编译的)。-->    
    <scriptSourceDirectory/>    
    <!--该元素设置了项目单元测试使用的源码目录，当测试项目的时候，构建系统会编译目录里的源码。该路径是相对于pom.xml的相对路径。-->    
    <testSourceDirectory/>    
    <!--被编译过的应用程序class文件存放的目录。-->    
    <outputDirectory/>    
    <!--被编译过的测试class文件存放的目录。-->    
    <testOutputDirectory/>    
    <!--使用来自该项目的一系列构建扩展-->    
    <extensions>    
      <!--描述使用到的构建扩展。-->    
      <extension>    
        <!--构建扩展的groupId-->    
        <groupId/>    
        <!--构建扩展的artifactId-->    
        <artifactId/>    
        <!--构建扩展的版本-->    
        <version/>    
      </extension>    
    </extensions>    

    <!--这个元素描述了项目相关的所有资源路径列表，例如和项目相关的属性文件，这些资源被包含在最终的打包文件里。-->    
    <resources>    
      <!--这个元素描述了项目相关或测试相关的所有资源路径-->    
      <resource>    
        <!-- 描述了资源的目标路径。该路径相对target/classes目录（例如${project.build.outputDirectory}）。举个例 子，如果你想资源在特定的包里(org.apache.maven.messages)，你就必须该元素设置为org/apache/maven /messages。然而，如果你只是想把资源放到源码目录结构里，就不需要该配置。-->    
        <targetPath/>    
        <!--是否使用参数值代替参数名。参数值取自properties元素或者文件里配置的属性，文件在filters元素里列出。-->    
        <filtering/>    
        <!--描述存放资源的目录，该路径相对POM路径-->    
        <directory/>    
        <!--包含的模式列表，例如**/*.xml.-->    
        <includes/>    
        <!--排除的模式列表，例如**/*.xml-->    
        <excludes/>    
      </resource>    
    </resources>    
    <!--这个元素描述了单元测试相关的所有资源路径，例如和单元测试相关的属性文件。-->    
    <testResources>    
      <!--这个元素描述了测试相关的所有资源路径，参见build/resources/resource元素的说明-->    
      <testResource>    
        <targetPath/><filtering/><directory/><includes/><excludes/>    
      </testResource>    
    </testResources>    
    <!--构建产生的所有文件存放的目录-->    
    <directory/>    
    <!--产生的构件的文件名，默认值是${artifactId}-${version}。-->    
    <finalName/>    
    <!--当filtering开关打开时，使用到的过滤器属性文件列表-->    
    <filters/>    
    <!--子项目可以引用的默认插件信息。该插件配置项直到被引用时才会被解析或绑定到生命周期。给定插件的任何本地配置都会覆盖这里的配置-->    
    <pluginManagement>    
      <!--使用的插件列表 。-->    
      <plugins>    
        <!--plugin元素包含描述插件所需要的信息。-->    
        <plugin>    
          <!--插件在仓库里的group ID-->    
          <groupId/>    
          <!--插件在仓库里的artifact ID-->    
          <artifactId/>    
          <!--被使用的插件的版本（或版本范围）-->    
          <version/>    
          <!--是否从该插件下载Maven扩展（例如打包和类型处理器），由于性能原因，只有在真需要下载时，该元素才被设置成enabled。-->    
          <extensions/>    
          <!--在构建生命周期中执行一组目标的配置。每个目标可能有不同的配置。-->    
          <executions>    
            <!--execution元素包含了插件执行需要的信息-->    
            <execution>    
              <!--执行目标的标识符，用于标识构建过程中的目标，或者匹配继承过程中需要合并的执行目标-->    
              <id/>    
              <!--绑定了目标的构建生命周期阶段，如果省略，目标会被绑定到源数据里配置的默认阶段-->    
              <phase/>    
              <!--配置的执行目标-->    
              <goals/>    
              <!--配置是否被传播到子POM-->    
              <inherited/>    
              <!--作为DOM对象的配置-->    
              <configuration/>    
            </execution>    
          </executions>    
          <!--项目引入插件所需要的额外依赖-->    
          <dependencies>    
            <!--参见dependencies/dependency元素-->    
            <dependency>    
              ......    
            </dependency>    
          </dependencies>         
          <!--任何配置是否被传播到子项目-->    
          <inherited/>    
          <!--作为DOM对象的配置-->    
          <configuration/>    
        </plugin>    
      </plugins>    
    </pluginManagement>    
    <!--使用的插件列表-->    
    <plugins>    
      <!--参见build/pluginManagement/plugins/plugin元素-->    
      <plugin>    
        <groupId/><artifactId/><version/><extensions/>    
        <executions>    
          <execution>    
            <id/><phase/><goals/><inherited/><configuration/>    
          </execution>    
        </executions>    
        <dependencies>    
          <!--参见dependencies/dependency元素-->    
          <dependency>    
            ......    
          </dependency>    
        </dependencies>    
        <goals/><inherited/><configuration/>    
      </plugin>    
    </plugins>    
  </build>    
  <!--模块（有时称作子项目） 被构建成项目的一部分。
列出的每个模块元素是指向该模块的目录的相对路径-->    
  <modules/>    
  <!--发现依赖和扩展的远程仓库列表。-->     
  <repositories>     
    <!--包含需要连接到远程仓库的信息-->    
    <repository>    
      <!--如何处理远程仓库里发布版本的下载-->    
      <releases>    
        <!--true或者false表示该仓库是否为下载某种类型构件（发布版，快照版）开启。 -->    
        <enabled/>    
        <!--该元素指定更新发生的频率。Maven会比较本地POM和远程POM的时间戳。这里的选项是：always（一直），daily（默认，每日），interval：X（这里X是以分钟为单位的时间间隔），或者never（从不）。-->    
        <updatePolicy/>    
        <!--当Maven验证构件校验文件失败时该怎么做：ignore（忽略），fail（失败），或者warn（警告）。-->    
        <checksumPolicy/>    
      </releases>    
      <!-- 如何处理远程仓库里快照版本的下载。有了releases和snapshots这两组配置，POM就可以在每个单独的仓库中，为每种类型的构件采取不同的 策略。例如，可能有人会决定只为开发目的开启对快照版本下载的支持。参见repositories/repository/releases元素 -->    
      <snapshots>    
        <enabled/><updatePolicy/><checksumPolicy/>    
      </snapshots>    
      <!--远程仓库唯一标识符。可以用来匹配在settings.xml文件里配置的远程仓库-->    
      <id>banseon-repository-proxy</id>     
      <!--远程仓库名称-->    
      <name>banseon-repository-proxy</name>     
      <!--远程仓库URL，按protocol://hostname/path形式-->    
      <url>http://192.168.1.169:9999/repository/</url>     
      <!-- 用于定位和排序构件的仓库布局类型-可以是default（默认）或者legacy（遗留）。Maven 2为其仓库提供了一个默认的布局；然 而，Maven 1.x有一种不同的布局。我们可以使用该元素指定布局是default（默认）还是legacy（遗留）。-->    
      <layout>default</layout>               
    </repository>     
  </repositories>    
  <!--发现插件的远程仓库列表，这些插件用于构建和报表-->    
  <pluginRepositories>    
    <!--包含需要连接到远程插件仓库的信息.参见repositories/repository元素-->    
    <pluginRepository>    
      ......    
    </pluginRepository>    
  </pluginRepositories>    

  <!--该元素描述了项目相关的所有依赖。 这些依赖组成了项目构建过程中的一个个环节。它们自动从项目定义的仓库中下载。要获取更多信息，请看项目依赖机制。-->     
  <dependencies>     
    <dependency>    
      <!--依赖的group ID-->    
      <groupId>org.apache.maven</groupId>     
      <!--依赖的artifact ID-->    
      <artifactId>maven-artifact</artifactId>     
      <!--依赖的版本号。 在Maven 2里, 也可以配置成版本号的范围。-->    
      <version>3.8.1</version>     
      <!-- 依赖类型，默认类型是jar。它通常表示依赖的文件的扩展名，但也有例外。一个类型可以被映射成另外一个扩展名或分类器。类型经常和使用的打包方式对应， 尽管这也有例外。一些类型的例子：jar，war，ejb-client和test-jar。
如果设置extensions为 true，就可以在 plugin里定义新的类型。所以前面的类型的例子不完整。-->    
      <type>jar</type>    
      <!-- 依赖的分类器。分类器可以区分属于同一个POM，但不同构建方式的构件。分类器名被附加到文件名的版本号后面。例如，如果你想要构建两个单独的构件成 JAR，一个使用Java 1.4编译器，另一个使用Java 6编译器，你就可以使用分类器来生成两个单独的JAR构件。-->    
      <classifier></classifier>    
      <!--依赖范围。在项目发布过程中，帮助决定哪些构件被包括进来。欲知详情请参考依赖机制。    
                - compile ：默认范围，用于编译      
                - provided：类似于编译，但支持你期待jdk或者容器提供，类似于classpath      
                - runtime: 在执行时需要使用      
                - test:    用于test任务时使用      
                - system: 需要外在提供相应的元素。通过systemPath来取得      
                - systemPath: 仅用于范围为system。提供相应的路径      
                - optional:   当项目自身被依赖时，标注依赖是否传递。用于连续依赖时使用-->     
      <scope>test</scope>       
      <!--仅供system范围使用。注意，不鼓励使用这个元素，并且在新的版本中该元素可能被覆盖掉。该元素为依赖规定了文件系统上的路径。需要绝对路径而不是相对路径。推荐使用属性匹配绝对路径，例如${java.home}。-->    
      <systemPath></systemPath>     
      <!--当计算传递依赖时， 从依赖构件列表里，列出被排除的依赖构件集。即告诉maven你只依赖指定的项目，不依赖项目的依赖。此元素主要用于解决版本冲突问题-->    
      <exclusions>    
        <exclusion>     
          <artifactId>spring-core</artifactId>     
          <groupId>org.springframework</groupId>     
        </exclusion>     
      </exclusions>       
      <!--可选依赖，如果你在项目B中把C依赖声明为可选，你就需要在依赖于B的项目（例如项目A）中显式的引用对C的依赖。可选依赖阻断依赖的传递性。-->     
      <optional>true</optional>    
    </dependency>    
  </dependencies>    

  <!-- 继承自该项目的所有子项目的默认依赖信息。这部分的依赖信息不会被立即解析,而是当子项目声明一个依赖（必须描述group ID和 artifact ID信息），如果group ID和artifact ID以外的一些信息没有描述，则通过group ID和artifact ID 匹配到这里的依赖，并使用这里的依赖信息。-->    
  <dependencyManagement>    
    <dependencies>    
      <!--参见dependencies/dependency元素-->    
      <dependency>    
        ......    
      </dependency>    
    </dependencies>    
  </dependencyManagement>       
  <!--项目分发信息，在执行mvn deploy后表示要发布的位置。有了这些信息就可以把网站部署到远程服务器或者把构件部署到远程仓库。-->     
  <distributionManagement>    
    <!--部署项目产生的构件到远程仓库需要的信息-->    
    <repository>    
      <!--是分配给快照一个唯一的版本号（由时间戳和构建流水号）？还是每次都使用相同的版本号？参见repositories/repository元素-->    
      <uniqueVersion/>    
      <id>banseon-maven2</id>     
      <name>banseon maven2</name>     
      <url>file://${basedir}/target/deploy</url>     
      <layout/>    
    </repository>    
    <!--构件的快照部署到哪里？如果没有配置该元素，默认部署到repository元素配置的仓库，参见distributionManagement/repository元素-->     
    <snapshotRepository>    
      <uniqueVersion/>    
      <id>banseon-maven2</id>    
      <name>Banseon-maven2 Snapshot Repository</name>    
      <url>scp://svn.baidu.com/banseon:/usr/local/maven-snapshot</url>     
      <layout/>    
    </snapshotRepository>    
    <!--部署项目的网站需要的信息-->     
    <site>    
      <!--部署位置的唯一标识符，用来匹配站点和settings.xml文件里的配置-->     
      <id>banseon-site</id>     
      <!--部署位置的名称-->    
      <name>business api website</name>     
      <!--部署位置的URL，按protocol://hostname/path形式-->    
      <url>     
        scp://svn.baidu.com/banseon:/var/www/localhost/banseon-web      
      </url>     
    </site>    
    <!--项目下载页面的URL。如果没有该元素，用户应该参考主页。使用该元素的原因是：帮助定位那些不在仓库里的构件（由于license限制）。-->    
    <downloadUrl/>  
    <!-- 给出该构件在远程仓库的状态。不得在本地项目中设置该元素，因为这是工具自动更新的。有效的值有：none（默认），converted（仓库管理员从 Maven 1 POM转换过来），partner（直接从伙伴Maven 2仓库同步过来），deployed（从Maven 2实例部 署），verified（被核实时正确的和最终的）。-->    
    <status/>           
  </distributionManagement>    
  <!--以值替代名称，Properties可以在整个POM中使用，也可以作为触发条件（见settings.xml配置文件里activation元素的说明）。格式是<name>value</name>。-->    
  <properties/>    
</project>
```

