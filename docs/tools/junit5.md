# JUnit5使用

## 概述

JUnit5由三个不同的子项目组成：

JUnit 5 = JUnit Platform + JUnit Jupiter + JUnit Vintage

### 引入

基于maven的引入：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.junit</groupId>
            <artifactId>junit-bom</artifactId>
            <version>5.8.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Junit指南

首先来一个hello world

```java
public class JUnitTest {
    @Test
    public void hello(){
        System.out.println("hello world!");
    }
}
```

### 注解

JUnit Jupiter支持一下注解来配置测试和扩展框架

核心注解都位于`junit-jupiter-api`的`org.junit.jupiter.api`包中。

| 注解                   | 描述 |
| ---------------------- | ---- |
| @Test                  |      |
| @ParameterizedTest     |      |
| @RepeatedTest          |      |
| @TestFactory           |      |
| @TestTemplate          |      |
| @TestClassOrder        |      |
| @TestMethodOrder       |      |
| @TestInstance          |      |
| @DisplayName           |      |
| @DisplayNameGeneration |      |
| @BeforeEach            |      |
| @AfterEach             |      |
| @BeforeAll             |      |
| @AfterAll              |      |
| @Nested                |      |
| @Tag                   |      |
| @Disabled              |      |
| @Timeout               |      |
| @ExtendWith            |      |
| @RegisterExtension     |      |
| @TempDir               |      |

### 元注解和组合注解

junit中的注解可以当做元注解使用。这意味着你可以使用元标注的方式定义自己的组合注解，这一点类似于Spring中的注解派生类似。



### @DisplayName

就是用来给测试类和测试方法起名字的，在生成测试报告时可以展示出来。



### @DisplayNameGeneration

用于配置测试类或测试方法的名称生成器，如果配置了@DisplayName，则优先使用@DisplayName，否则通过配置的名称生成器来生成。

junit为我们为提供了几个模式实现，

| 显示名称生成器        | 行为                                                      |
| --------------------- | --------------------------------------------------------- |
| `Standard`            | 匹配自 JUnit Jupiter 5.0 发布以来的标准显示名称生成行为。 |
| `Simple`              | 删除没有参数的方法的尾括号。                              |
| `ReplaceUnderscores`  | 用空格替换下划线。                                        |
| `IndicativeSentences` | 通过连接测试名称和封闭类来生成完整的句子。                |



### 断言

Junit中提供了很多强大且好用的断言方法，这些方法在Assertions中定义。

TODO 断言中的内容，在这里补充一下。



### 第三方断言库





### @Disabled

禁用测试，就是取消运行某个测试类或测试方法。



### 条件执行

根据注解条件来判断一个测试方法或测试类是否执行。



#### @EnabledOnOs/@DisabledOnOs

判定在特定操作系统上启用或禁用测试方法或测试类

```
@EnabledOnOs(MAC)
@EnabledOnOs({ LINUX, MAC })
@DisabledOnOs(WINDOWS)

```

#### 判定Java运行时环境

@EnabledOnJre/@DisabledOnJre

@EnabledForJreRange/@DisabledForJreRange

#### 判定系统属性

```java
@Test
@EnabledIfSystemProperty(named = "os.arch", matches = ".*64.*")
void onlyOn64BitArchitectures() {
    // ...
}

@Test
@DisabledIfSystemProperty(named = "ci-server", matches = "true")
void notOnCiServer() {
    // ...
}
```



#### 判定环境变量

matchs属性中可以使用正则

```java
@Test
@EnabledIfEnvironmentVariable(named = "ENV", matches = "staging-server")
void onlyOnStagingServer() {
    // ...
}

@Test
@DisabledIfEnvironmentVariable(named = "ENV", matches = ".*development.*")
void notOnDeveloperWorkstation() {
    // ...
}
```



#### 自定义配置

@EnabledIf/@DisabledIf会基于方法返回的布尔来启用或禁用测试用例。

```java
@Test
@EnabledIf("customCondition")
void enabled() {
    // ...
}

@Test
@DisabledIf("customCondition")
void disabled() {
    // ...
}

boolean customCondition() {
    return true;
}
```

如果方法位于测试一类之外，则需要指定全限定类名来引用。

```java
package example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

class ExternalCustomConditionDemo {
    @Test
    @EnabledIf("example.ExternalCondition#customCondition")
    void enabled() {
        // ...
    }
}

class ExternalCondition {
    static boolean customCondition() {
        return true;
    }
}
```



### @Tag

该注解主要用于对类或方法进行一个标记，通常需要配合其他注解一起使用。

```java
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("fast")
@Tag("model")
class TaggingDemo {

    @Test
    @Tag("taxes")
    void testingTaxCalculation() {
    }

}
```

### 测试的执行顺序

通常情况下不建议指定测试的执行顺序。除非必要！

#### 方法的执行顺序

通过@TestMethodOrder注解来指定测试执行顺序，junit给我们提供了几个默认的实现：

- MethodOrderer.DisplayName：根据显示名称按字母数字对测试方法进行排序（请参阅显示名称生成优先规则）

- MethodOrderer.MethodName：根据名称和形式参数列表按字母数字对测试方法进行排序

- MethodOrderer.OrderAnnotation：根据通过注解指定的值对测试方法进行数字排序@Order

- MethodOrderer.Random:伪随机排序测试方法并支持自定义种子的配置

- MethodOrderer.Alphanumeric：根据名称和形式参数列表按字母数字对测试方法进行排序；

```java
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@TestMethodOrder(OrderAnnotation.class)
class OrderedTestsDemo {

    @Test
    @Order(1)
    void nullValues() {
        // perform assertions against null values
    }

    @Test
    @Order(2)
    void emptyValues() {
        // perform assertions against empty values
    }

    @Test
    @Order(3)
    void validValues() {
        // perform assertions against valid values
    }
}
```

#### 类的执行顺序

























































































--