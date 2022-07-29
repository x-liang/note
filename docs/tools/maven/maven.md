# Maven

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

