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

## Junit基础

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

略



### 测试实例的生命周期

默认情况下，Junit在执行每个测试方法之前，都会创建一个全新的实例。这主要是为了避免由于可变测试实例状态导致意外情况发生。如果希望使用同一个实例运行所有测试方法，可以使用`@TestInstance`注解，该注解中需要提供一个参数，Lifecycle.PER_CLASS 表示只创建一个实例来执行所有测试，Lifecycle.PER_METHOD表示执行每个测试方法都创建一个实例。

#### @AfterEach/@BeforeEach

在每个测试方法开始前/结束后，执行该方法



#### @AfterAll/@BeforeAll

在每个实例初始化后，销毁前执行一次。这里需要注意一下，如果生命周期指定为了Lifecycle.PER_METHOD，则方法必须为static方法，如果是其他的，则没有此要求。



### 构造函数和方法的依赖注入

从Junit5开始，支持一些构造函数和方法的依赖注入。目前有三个内置的解析器

- TestInfoParameterResolver：用于主持TestInfo类型的参数
- RepetitionInfoParameterResolver：用于支持RepetitionInfo类型参数
- TestReporterParameterResolver：用于支持TextReporter类型参数

测试的时候，通过构造函数进行注入，会报错，在测试方法上进行注入则没有问题。





### 测试接口和默认方法



### 重复测试

@RepeatedTest， 该注解中有两个属性，value指定重复执行次数，name用来指定展示信息的格式。在重复测试用例中，我们还可以注入一个RepetitionInfo类型的参数，来查询当前重复次数以及重复总数的信息。

```java
public class TestJunit {
    @RepeatedTest(value = 10, name = RepeatedTest.LONG_DISPLAY_NAME)
    public void test01(TestReporter reporter, TestInfo info, RepetitionInfo repetitionInfo){
        reporter.publishEntry(repetitionInfo.getCurrentRepetition()+"");
    }
}
```



### 参数化测试

@ParameterizedTest

针对同一个测试方法，我们可能会需要不同的测试参数时，就可以使用该注解。



#### 参数来源

##### @ValueSource

最简单的参数来源

##### @NullSource

传入一个null值

##### @EmptySource

传入一个空值，该注解主要针对String，List，Set，Map，数组等类型。

##### @NullAndEmptySource

@NullSource和@EmptySource的组合

##### @EnumSource

枚举参数，会遍历枚举中的值进行传入



##### @MethodSource

指定一个方法，并返回参数集合

```java
@ParameterizedTest
@MethodSource("stringProvider")
void testWithExplicitLocalMethodSource(String argument) {
    assertNotNull(argument);
}

static Stream<String> stringProvider() {
    return Stream.of("apple", "banana");
}
```



##### @CsvSource

```java
@ParameterizedTest
@CsvSource({
    "apple,         1",
    "banana,        2",
    "'lemon, lime', 0xF1",
    "strawberry,    700_000"
})
void testWithCsvSource(String fruit, int rank) {
    assertNotNull(fruit);
    assertNotEquals(0, rank);
}
```

##### @CsvFileSource

```java
@ParameterizedTest
@CsvFileSource(resources = "/two-column.csv", numLinesToSkip = 1)
void testWithCsvFileSourceFromClasspath(String country, int reference) {
    assertNotNull(country);
    assertNotEquals(0, reference);
}

@ParameterizedTest
@CsvFileSource(files = "src/test/resources/two-column.csv", numLinesToSkip = 1)
void testWithCsvFileSourceFromFile(String country, int reference) {
    assertNotNull(country);
    assertNotEquals(0, reference);
}

@ParameterizedTest(name = "[{index}] {arguments}")
@CsvFileSource(resources = "/two-column.csv", useHeadersInDisplayName = true)
void testWithCsvFileSourceAndHeaders(String country, int reference) {
    assertNotNull(country);
    assertNotEquals(0, reference);
}
```



#### 参数转换



#### 参数聚合

TODO







## @ExtendWith

该注解是Junit5中提供的扩展SPI，目前典型的实现有`MockitoExtension`、`SpringExtension`。







































































--