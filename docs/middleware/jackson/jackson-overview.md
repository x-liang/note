# Jackson  用法详解



> Spring MVC 默认采用Jackson解析Json，尽管还有一些其它同样优秀的json解析工具，例如Fast Json、GSON，但是出于最小依赖的考虑，也许Json解析第一选择就应该是Jackson。

## 一、简介

Jackson 是当前用的比较广泛的，用来序列化和反序列化 json 的 Java 的开源框架。Jackson 社区相对比较活跃，更新速度也比较快， 从 Github 中的统计来看，Jackson 是最流行的 json 解析器之一 。 Spring MVC 的默认 json 解析器便是 Jackson。 Jackson 优点很多。 Jackson 所依赖的 jar 包较少 ，简单易用。与其他 Java 的 json 的框架 Gson 等相比， Jackson 解析大的 json 文件速度比较快；Jackson 运行时占用内存比较低，性能比较好；Jackson 有灵活的 API，可以很容易进行扩展和定制。

Jackson 的 1.x 版本的包名是 org.codehaus.jackson ，当升级到 2.x 版本时，包名变为 com.fasterxml.jackson。

Jackson 的核心模块由三部分组成。

- jackson-core，核心包，提供基于"流模式"解析的相关 API，它包括 JsonPaser 和 JsonGenerator。 Jackson 内部实现正是通过高性能的流模式 API 的 JsonGenerator 和 JsonParser 来生成和解析 json。
- jackson-annotations，注解包，提供标准注解功能；
- jackson-databind ，数据绑定包， 提供基于"对象绑定" 解析的相关 API （ ObjectMapper ） 和"树模型" 解析的相关 API （JsonNode）；基于"对象绑定" 解析的 API 和"树模型"解析的 API 依赖基于"流模式"解析的 API。

## 二、依赖

使用Maven构建项目，需要添加依赖：

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-core</artifactId>
  <version>2.9.6</version>
</dependency>

<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-annotations</artifactId>
  <version>2.9.6</version>
</dependency>

<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.9.6</version>
</dependency>
```

当然了，jackson-databind 依赖 jackson-core 和 jackson-annotations，所以可以只显示地添加jackson-databind依赖，jackson-core 和 jackson-annotations 也随之添加到 Java 项目工程中。

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.9.6</version>
</dependency>
```



下面是Jackson的用法。

## 三、 ObjectMapper

Jackson 最常用的 API 就是基于"对象绑定" 的 ObjectMapper：

- ObjectMapper可以从字符串，流或文件中解析JSON，并创建表示已解析的JSON的Java对象。 将JSON解析为Java对象也称为从JSON反序列化Java对象。
- ObjectMapper也可以从Java对象创建JSON。 从Java对象生成JSON也称为将Java对象序列化为JSON。
- Object映射器可以将JSON解析为自定义的类的对象，也可以解析置JSON树模型的对象。

之所以称为ObjectMapper是因为它将JSON映射到Java对象（反序列化），或者将Java对象映射到JSON（序列化）。



### 一）、从JSON中获取Java对象

#### 1、简单示例

一个简单的例子：

Car类：



```java
public class Car {
	private String brand = null;
    private int doors = 0;

    public String getBrand() { return this.brand; }
    public void   setBrand(String brand){ this.brand = brand;}

    public int  getDoors() { return this.doors; }
    public void setDoors (int doors) { this.doors = doors; }
}
```

将Json转换为Car类对象：



```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson ="{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

try {
    Car car = objectMapper.readValue(carJson, Car.class);
    System.out.println("car brand = " + car.getBrand());
    System.out.println("car doors = " + car.getDoors());
} catch (IOException e) {
    e.printStackTrace();
}
```



#### 2、 ObjectMapper如何匹配JSON对象的字段和Java对象的属性

默认情况下，Jackson通过将JSON字段的名称与Java对象中的getter和setter方法进行匹配，将JSON对象的字段映射到Java对象中的属性。 Jackson删除了getter和setter方法名称的“ get”和“ set”部分，并将其余名称的第一个字符转换为小写。

例如，名为brand的JSON字段与名为getBrand()和setBrand()的Java getter和setter方法匹配。 名为engineNumber的JSON字段将与名为getEngineNumber()和setEngineNumber()的getter和setter匹配。

如果需要以其他方式将JSON对象字段与Java对象字段匹配，则需要使用自定义序列化器和反序列化器，或者使用一些Jackson注解。



#### 3、JSON字符串-->Java对象

从JSON字符串读取Java对象非常容易。 上面已经有了一个示例——JSON字符串作为第一个参数传递给ObjectMapper的readValue()方法。 这是另一个简单的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";
Car car = objectMapper.readValue(carJson, Car.class);
```



#### 3、JSON 字符输入流-->Java对象

还可以从通过Reader实例加载的JSON中读取对象。示例如下：



```java
ObjectMapper objectMapper = new ObjectMapper();
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 4 }";
Reader reader = new StringReader(carJson);
Car car = objectMapper.readValue(reader, Car.class);
```



#### 4、JSON文件-->Java对象

从文件读取JSON当然可以通过FileReader（而不是StringReader）来完成，也可以通过File对象来完成。 这是从文件读取JSON的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();
File file = new File("data/car.json");
Car car = objectMapper.readValue(file, Car.class);
```



#### 5、JSON via URL--->Java对象

可以通过URL（java.net.URL）从JSON读取对象，如下所示：



```java
ObjectMapper objectMapper = new ObjectMapper();
URL url = new URL("file:data/car.json");
Car car = objectMapper.readValue(url, Car.class);
```

示例使用文件URL，也可以使用HTTP URL（类似于http://jenkov.com/some-data.json）。



#### 6、JSON字节输入流-->Java对象

也可以使用ObjectMapper通过InputStream从JSON读取对象。 这是一个从InputStream读取JSON的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();
InputStream input = new FileInputStream("data/car.json");
Car car = objectMapper.readValue(input, Car.class);
```



#### 7、JSON二进制数组-->Java对象

Jackson还支持从JSON字节数组读取对象。 这是从JSON字节数组读取对象的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();
String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";
byte[] bytes = carJson.getBytes("UTF-8");
Car car = objectMapper.readValue(bytes, Car.class);
```



#### 8、JSON数组字符串-->Java对象数组

Jackson ObjectMapper也可以从JSON数组字符串读取对象数组。 这是从JSON数组字符串读取对象数组的示例：



```java
String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";
ObjectMapper objectMapper = new ObjectMapper();
Car[] cars2 = objectMapper.readValue(jsonArray, Car[].class);
```

需要将Car数组类作为第二个参数传递给readValue()方法。

读取对象数组还可以与字符串以外的其他JSON源一起使用。 例如，文件，URL，InputStream，Reader等。



#### 9、JSON数组字符串-->List

Jackson ObjectMapper还可以从JSON数组字符串读取对象的Java List。 这是从JSON数组字符串读取对象列表的示例：



```java
    String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";
	ObjectMapper objectMapper = new ObjectMapper();
	List<Car> cars1 = objectMapper.readValue(jsonArray, new TypeReference<List<Car>>(){});
```



#### 10、JSON字符串-->Map

Jackson ObjectMapper还可以从JSON字符串读取Java Map。 如果事先不知道将要解析的确切JSON结构，这种方法是很有用的。 通常，会将JSON对象读入Java Map。 JSON对象中的每个字段都将成为Java Map中的键，值对。

这是一个使用Jackson ObjectMapper从JSON字符串读取Java Map的示例：



```java
String jsonObject = "{\"brand\":\"ford\", \"doors\":5}";
ObjectMapper objectMapper = new ObjectMapper();
Map<String, Object> jsonMap = objectMapper.readValue(jsonObject,
    new TypeReference<Map<String,Object>>(){});
```



#### 11、忽略未知的JSON字段

有时候，与要从JSON读取的Java对象相比，JSON中的字段更多。 默认情况下，Jackson在这种情况下会抛出异常，报不知道XYZ字段异常，因为在Java对象中找不到该字段。

但是，有时应该允许JSON中的字段多于相应的Java对象中的字段。 例如，要从REST服务解析JSON，而该REST服务包含的数据远远超出所需的。 在这种情况下，可以使用Jackson配置忽略这些额外的字段。 以下是配置Jackson ObjectMapper忽略未知字段的示例：



```java
objectMapper.configure(
    DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```



#### 12、不允许基本类型为null

如果JSON字符串包含其值设置为null的字段（对于在相应的Java对象中是基本数据类型（int，long，float，double等）的字段），Jackson ObjectMapper默认会处理基本数据类型为null的情况，我们可以可以将Jackson ObjectMapper默认配置为失效，这样基本数据为null就会转换失败。 例如以下Car类：



```java
public class Car {
    private String brand = null;
    private int doors = 0;

    public String getBrand() { return this.brand; }
    public void   setBrand(String brand){ this.brand = brand;}

    public int  getDoors(){ return this.doors; }
    public void setDoors (int doors) { this.doors = doors; }
}
```

doors字段是一个int类型，它是Java中的基本数据类型。

现在，假设有一个与Car对象相对应的JSON字符串，如下所示：



```java
{ "brand":"Toyota", "doors":null }
```

请注意，doors字段值为null。 Java中的基本数据类型不能为null值。 默认情况下，Jackson ObjectMapper会忽略原始字段的空值。 但是，可以将Jackson ObjectMapper配置设置为失败。



```java
ObjectMapper objectMapper = new ObjectMapper();

objectMapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true);
```

在FAIL_ON_NULL_FOR_PRIMITIVES配置值设置为true的情况下，尝试将空JSON字段解析为基本类型Java字段时会遇到异常。 这是一个Java Jackson ObjectMapper示例，该示例将失败，因为JSON字段包含原始Java字段的空值：



```java
		ObjectMapper objectMapper = new ObjectMapper();

		objectMapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true);

		String carJson = "{ \"brand\":\"Toyota\", \"doors\":null }";

		Car car = objectMapper.readValue(carJson, Car.class);
```

结果：

![在这里插入图片描述](./.jackson-overview.assets/20200523174740369.png)

#### 13、自定义反序列化

有时，可能希望以不同于Jackson ObjectMapper缺省方式的方式将JSON字符串读入Java对象。 可以将自定义反序列化器添加到ObjectMapper，可以按需要执行反序列化。

这是在Jackson的ObjectMapper中注册和使用自定义反序列化器的方式：



```java
		String json = "{ \"brand\" : \"Ford\", \"doors\" : 6 }";

		SimpleModule module =
		        new SimpleModule("CarDeserializer", new Version(3, 1, 8, null, null, null));
		module.addDeserializer(Car.class, new CarDeserializer(Car.class));

		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(module);

		Car car = mapper.readValue(json, Car.class);
```

自定义反序列化器CarDeserializer类：



```java
public class CarDeserializer extends StdDeserializer<Car> {

    public CarDeserializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public Car deserialize(JsonParser parser, DeserializationContext deserializer) throws IOException {
        Car car = new Car();
        while(!parser.isClosed()){
            JsonToken jsonToken = parser.nextToken();

            if(JsonToken.FIELD_NAME.equals(jsonToken)){
                String fieldName = parser.getCurrentName();
                System.out.println(fieldName);

                jsonToken = parser.nextToken();

                if("brand".equals(fieldName)){
                    car.setBrand(parser.getValueAsString());
                } else if ("doors".equals(fieldName)){
                    car.setDoors(parser.getValueAsInt());
                }
            }
        }
        return car;
    }
}
```



### 二）、将对象写入JSON



#### 1、Java对象-->JSON

Jackson ObjectMapper也可以用于从对象生成JSON。 可以使用以下方法之一进行操作：

- writeValue()
- writeValueAsString()
- writeValueAsBytes()

这是一个从Car对象生成JSON的示例，和上面的实例相反：



```java
ObjectMapper objectMapper = new ObjectMapper();

		Car car = new Car();
		car.setBrand("BMW");
		car.setDoors(4);

		objectMapper.writeValue(
		    new FileOutputStream("data/output-2.json"), car);
```

此示例首先创建一个ObjectMapper，然后创建一个Car实例，最后调用ObjectMapper的writeValue()方法，该方法将Car对象转换为JSON并将其写入给定的FileOutputStream。

ObjectMapper的writeValueAsString()和writeValueAsBytes()都从一个对象生成JSON，并将生成的JSON作为String或字节数组返回。 示例如下：



```java
		ObjectMapper objectMapper = new ObjectMapper();

		Car car = new Car();
		car.setBrand("宝马");
		car.setDoors(4);

		String json = objectMapper.writeValueAsString(car);
		System.out.println(json);
```

运行结果：
![在这里插入图片描述](./.jackson-overview.assets/20200523180410972.png)



#### 2、自定义序列化

有时，想要将Java对象序列化为JSON的方式与使用Jackson的默认方式不同。 例如，可能想要在JSON中使用与Java对象中不同的字段名称，或者希望完全省略某些字段。

Jackson可以在ObjectMapper上设置自定义序列化器。 该序列化器已为某个类注册，然后在每次要求ObjectMapper序列化Car对象时将调用该序列化器。

这是为Car类注册自定义序列化器的示例：



```java
		CarSerializer carSerializer = new CarSerializer(Car.class);
		ObjectMapper objectMapper = new ObjectMapper();

		SimpleModule module =
		        new SimpleModule("CarSerializer", new Version(2, 1, 3, null, null, null));
		module.addSerializer(Car.class, carSerializer);

		objectMapper.registerModule(module);

		Car car = new Car();
		car.setBrand("Mercedes");
		car.setDoors(5);

		String carJson = objectMapper.writeValueAsString(car);
```

自定义序列化器CarSerializer类：



```java
public class CarSerializer extends StdSerializer<Car> {

    protected CarSerializer(Class<Car> t) {
        super(t);
    }

    public void serialize(Car car, JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider)
            throws IOException {

        jsonGenerator.writeStartObject();
        jsonGenerator.writeStringField("producer", car.getBrand());
        jsonGenerator.writeNumberField("doorCount", car.getDoors());
        jsonGenerator.writeEndObject();
    }
}
```

运行结果：

![在这里插入图片描述](./.jackson-overview.assets/20200523181127238.png)



### 三）、Jackson 日期转化

默认情况下，Jackson会将java.util.Date对象序列化为其long型的值，该值是自1970年1月1日以来的毫秒数。但是，Jackson还支持将日期格式化为字符串。

#### 1、Date-->long

默认的Jackson日期格式，该格式将Date序列化为自1970年1月1日以来的毫秒数（long类型）。

这是一个包含Date字段的Java类示例：

```java
    private String type = null;
    private Date date = null;

    public Transaction() {
    }

    public Transaction(String type, Date date) {
        this.type = type;
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
```

就像使用其他Java对象进行序列化一样，代码如下：

```java
		Transaction transaction = new Transaction("transfer", new Date());

		ObjectMapper objectMapper = new ObjectMapper();
		String output = objectMapper.writeValueAsString(transaction);

		System.out.println(output);
```

运行结果：

![在这里插入图片描述](./.jackson-overview.assets/20200523182624125.png)

#### 2、Date-->String

日期的long序列化格式不符合人类的时间查看格式。 因此，Jackson也支持文本日期格式。 可以通过在ObjectMapper上设置SimpleDateFormat来指定要使用的确切Jackson日期格式。 这是在Jackson的ObjectMapper上设置SimpleDateFormat的示例：

```java
		Transaction transaction = new Transaction("transfer", new Date());

		ObjectMapper objectMapper = new ObjectMapper();
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
		objectMapper.setDateFormat(dateFormat);

		String output2 = objectMapper.writeValueAsString(transaction);
		System.out.println(output2);
```

运行结果：

![在这里插入图片描述](./.jackson-overview.assets/20200523183034156.png)

### 四）、Jackson JSON 树模型

Jackson具有内置的树模型，可用于表示JSON对象。 如果不知道接收到的JSON的格式，或者由于某种原因而不能（或者只是不想）创建一个类来表示它，那么就要用到Jackson的树模型。 如果需要在使用或转化JSON之前对其进行操作，也需要被用到Jackson树模型。 所有这些情况在数据流场景中都很常见。

Jackson树模型由JsonNode类表示。 您可以使用Jackson ObjectMapper将JSON解析为JsonNode树模型，就像使用您自己的类一样。

以下将展示如何使用Jackson ObjectMapper读写JsonNode实例。

#### 1、Jackson Tree Model简单例子

下面是一个简单的例子：

```java
		String carJson =
		        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

		ObjectMapper objectMapper = new ObjectMapper();

		try {

		    JsonNode jsonNode = objectMapper.readValue(carJson, JsonNode.class);

		} catch (IOException e) {
		    e.printStackTrace();
		}
```

只需将JsonNode.class作为第二个参数传递给readValue()方法，而不是本教程前面的示例中使用的Car.class，就可以将JSON字符串解析为JsonNode对象而不是Car对象。 。

ObjectMapper类还具有一个特殊的readTree()方法，该方法返回JsonNode。 这是使用ObjectMapper readTree()方法将JSON解析为JsonNode的示例：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

ObjectMapper objectMapper = new ObjectMapper();

try {

    JsonNode jsonNode = objectMapper.readTree(carJson);

} catch (IOException e) {
    e.printStackTrace();
}
```



#### 2、Jackson JsonNode类

通过JsonNode类，可以以非常灵活和动态的方式将JSON作为Java对象导航。这里了解一些如何使用它的基础知识。

将JSON解析为JsonNode（或JsonNode实例树）后，就可以浏览JsonNode树模型。 这是一个JsonNode示例，显示了如何访问JSON字段，数组和嵌套对象：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5," +
        "  \"owners\" : [\"John\", \"Jack\", \"Jill\"]," +
        "  \"nestedObject\" : { \"field\" : \"value\" } }";

ObjectMapper objectMapper = new ObjectMapper();


try {

    JsonNode jsonNode = objectMapper.readValue(carJson, JsonNode.class);

    JsonNode brandNode = jsonNode.get("brand");
    String brand = brandNode.asText();
    System.out.println("brand = " + brand);

    JsonNode doorsNode = jsonNode.get("doors");
    int doors = doorsNode.asInt();
    System.out.println("doors = " + doors);

    JsonNode array = jsonNode.get("owners");
    JsonNode jsonNode = array.get(0);
    String john = jsonNode.asText();
    System.out.println("john  = " + john);

    JsonNode child = jsonNode.get("nestedObject");
    JsonNode childField = child.get("field");
    String field = childField.asText();
    System.out.println("field = " + field);

} catch (IOException e) {
    e.printStackTrace();
}
```

请注意，JSON字符串现在包含一个称为owners的数组字段和一个称为nestedObject的嵌套对象字段。

无论访问的是字段，数组还是嵌套对象，都可以使用JsonNode类的get()方法。 通过将字符串作为参数提供给get()方法，可以访问JsonNode的字段。 如果JsonNode表示数组，则需要将索引传递给get()方法。 索引指定要获取的数组元素。



#### 3、Java对象-->JsonNode

可以使用Jackson ObjectMapper将Java对象转换为JsonNode，而JsonNode是转换后的Java对象的JSON表示形式。 可以通过Jackson ObjectMapper valueToTree()方法将Java对象转换为JsonNode。 这是一个使用ObjectMapper valueToTree()方法将Java对象转换为JsonNode的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();

Car car = new Car();
car.brand = "Cadillac";
car.doors = 4;

JsonNode carJsonNode = objectMapper.valueToTree(car);
```



#### 4、JsonNode-->Java对象

可以使用Jackson ObjectMapper treeToValue()方法将JsonNode转换为Java对象。 这类似于使用Jackson Jackson的ObjectMapper将JSON字符串（或其他来源）解析为Java对象。 唯一的区别是，JSON源是JsonNode。 这是一个使用Jackson ObjectMapper treeToValue()方法将JsonNode转换为Java对象的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson = "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonNode carJsonNode = objectMapper.readTree(carJson);

Car car = objectMapper.treeToValue(carJsonNode);
```

上面的示例有点“人为”，因为我们首先将JSON字符串转换为JsonNode，然后将JsonNode转换为Car对象。 显然，如果我们有对原始JSON字符串的引用，则最好将其直接转换为Car对象，而无需先将其转换为JsonNode。



## 四、JsonNode

Jackson JsonNode类com.fasterxml.jackson.databind.JsonNode是Jackson的JSON树形模型（对象图模型）。 Jackson可以将JSON读取到JsonNode实例中，然后将JsonNode写入JSON。 因此，这一节将说明如何将JSON反序列化为JsonNode以及将JsonNode序列化为JSON。 此Jackson JsonNode教程还将说明如何从头开始构建JsonNode对象图，因此以后可以将它们序列化为JSON。



### 1、JsonNode vs ObjectNode

Jackson JsonNode类是不可变的。 这意味着，实际上不能直接构建JsonNode实例的对象图。 而是创建JsonNode子类ObjectNode的对象图。 作为JsonNode的子类，可以在可以使用JsonNode的任何地方使用ObjectNode。



### 2、JSON-->JsonNode

要使用Jackson将JSON读取到JsonNode中，首先需要创建一个Jackson ObjectMapper实例。 在ObjectMapper实例上，调用readTree()并将JSON源作为参数传递。 这是将JSON反序列化为JsonNode的示例：



```java
String json = "{ \"f1\" : \"v1\" } ";

ObjectMapper objectMapper = new ObjectMapper();

JsonNode jsonNode = objectMapper.readTree(json);

System.out.println(jsonNode.get("f1").asText());
```



### 3、JsonNode-->JSON

要将Jackson的JsonNode写入JSON，还需要一个Jackson ObjectMapper实例。 在ObjectMapper上，调用writeValueAsString()方法或任何适合需要的写入方法。 这是将JsonNode写入JSON的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();

JsonNode jsonNode = readJsonIntoJsonNode();

String json = objectMapper.writeValueAsString(jsonNode);
```



### 4、获取JsonNode字段

JsonNode可以像JSON对象一样具有字段。 假设已将以下JSON解析为JsonNode：



```java
{
    "field1" : "value1",
    "field2" : 999
}
```

此JSON对象具有两个名为field1和field2的字段。 如果有一个表示上述JSON对象的Jackson JsonNode，则可以这样获得两个字段：



```java
JsonNode jsonNode = ... //parse above JSON into a JsonNode

JsonNode field1 = jsonNode.get("field1");
JsonNode field2 = jsonNode.get("field2");
```

请注意，即使两个字段都是String字段，get()方法也始终返回JsonNode来表示该字段。



### 5、在路径中获取JsonNode字段

Jackson JsonNode有一个称为at()的特殊方法。 at()方法可以从JSON图中以给定JsonNode为根的任何位置访问JSON字段。 假设JSON结构如下所示：



```java
{
  "identification" :  {
        "name" : "James",
        "ssn: "ABC123552"
    }
}
```

如果将此JSON解析为JsonNode，则可以使用at()方法访问名称字段，如下所示：



```java
JsonNode nameNode = jsonNode.at("/identification/name");
```

注意传递给at()方法的参数：字符串/ identification / name。 这是一个JSON路径表达式。 此路径表达式指定从根JsonNode到您要访问其值的字段的完整路径。 这类似于从文件系统根目录到Unix文件系统中文件的路径。

请注意，JSON路径表达式必须以斜杠字符（/字符）开头。

at()方法返回一个JsonNode，它表示请求的JSON字段。 要获取该字段的实际值，需要调用下一部分介绍的方法之一。 如果没有节点与给定的路径表达式匹配，则将返回null。



### 6、转换JsonNode字段

Jackson JsonNode类包含一组可以将字段值转换为另一种数据类型的方法。 例如，将String字段值转换为long或相反。 这是将JsonNode字段转换为一些更常见的数据类型的示例：



```java
String f2Str = jsonNode.get("f2").asText();
double f2Dbl = jsonNode.get("f2").asDouble();
int    f2Int = jsonNode.get("f2").asInt();
long   f2Lng = jsonNode.get("f2").asLong();
```

**使用默认值转换:**
如果JsonNode中的字段可以为null，则在尝试转换它时可以提供默认值。 这是使用默认值调用转换方法的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();

String json = "{ \"f1\":\"Hello\", \"f2\":null }";

JsonNode jsonNode = objectMapper.readTree(json);

String f2Value = jsonNode.get("f2").asText("Default");
```

在示例的JSON字符串中可以看到，声明了f2字段，但将其设置为null。 在这种情况下，调用jsonNode.get（“ f2”）。asText（“ Default”）将返回默认值，在此示例中为字符串Default。

asDouble()，asInt()和asLong()方法还可以采用默认参数值，如果尝试从中获取值的字段为null，则将返回默认参数值。

请注意，如果该字段在JSON中未显式设置为null，但在JSON中丢失，则调用jsonNode.get（“ fieldName”）将返回Java null值，您无法在该Java值上调用asInt() ，asDouble()，asLong()或asText()。 如果尝试这样做，将会导致NullPointerException。 这是说明这种情况的示例：



```java
 ObjectMapper objectMapper = new ObjectMapper();

String json = "{ \"f1\":\"Hello\" }";

JsonNode jsonNode = objectMapper.readTree(json);

JsonNode f2FieldNode = jsonNode.get("f2");
```



### 7、创建一个ObjectNode

如前所述，JsonNode类是不可变的。 要创建JsonNode对象图，必须能够更改图中的JsonNode实例，例如 设置属性值和子JsonNode实例等。由于是不可变的，因此无法直接使用JsonNode来实现。

而是创建一个ObjectNode实例，该实例是JsonNode的子类。 这是一个通过Jackson ObjectMapper createObjectNode()方法创建ObjectNode的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();

ObjectNode objectNode = objectMapper.createObjectNode();
```



### 8、Set ObjectNode字段

要在Jackson ObjectNode上设置字段，可以调用其set()方法，并将字段名称String和JsonNode作为参数传递。 这是在Jackson的ObjectNode上设置字段的示例：



```java
ObjectMapper objectMapper = new ObjectMapper();
ObjectNode parentNode = objectMapper.createObjectNode();

JsonNode childNode = readJsonIntoJsonNode();

parentNode.set("child1", childNode);
```



### 9、Put ObjectNode字段

ObjectNode类还具有一组方法，可以直接为字段put(设置)值。 这比尝试将原始值转换为JsonNode并使用set()进行设置要容易得多。 以下是使用put()方法为ObjectNode上的字段设置字符串值的示例：



```java
objectNode.put("field1", "value1");
objectNode.put("field2", 123);
objectNode.put("field3", 999.999);
```



### 10、删除字段

ObjectNode类具有一个称为remove()的方法，该方法可用于从ObjectNode中删除字段。 这是一个通过其remove()方法从Jackson ObjectNode删除字段的示例：



```java
objectNode.remove("fieldName");
```



### 11、循环JsonNode字段

JsonNode类具有一个名为fieldNames()的方法，该方法返回一个Iterator，可以迭代JsonNode的所有字段名称。 我们可以使用字段名称来获取字段值。 这是一个迭代Jackson JsonNode的所有字段名称和值的示例：



```java
Iterator<String> fieldNames = jsonNode.fieldNames();

while(fieldNames.hasNext()) {
    String fieldName = fieldNames.next();

    JsonNode field = jsonNode.get(fieldName);
}
```



## 五、JsonParser

Jackson JsonParser类是一个底层一些的JSON解析器。 它类似于XML的Java StAX解析器，差别是JsonParser解析JSON而不解析XML。

Jackson JsonParser的运行层级低于Jackson ObjectMapper。 这使得JsonParser比ObjectMapper更快，但使用起来也比较麻烦。

### 1、创建一个JsonParser

为了创建Jackson JsonParser，首先需要创建一个JsonFactory。 JsonFactory用于创建JsonParser实例。 JsonFactory类包含几个createParser()方法，每个方法都使用不同的JSON源作为参数。

这是创建一个JsonParser来从字符串中解析JSON的示例：



```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);
```



### 2、用JsonParser转化JSON

一旦创建了Jackson JsonParser，就可以使用它来解析JSON。 JsonParser的工作方式是将JSON分解为一系列令牌，可以一个一个地迭代令牌。

这是一个JsonParser示例，它简单地循环遍历所有标记并将它们输出到System.out。 这是一个实际上很少用示例，只是展示了将JSON分解成的令牌，以及如何遍历令牌的基础知识。



```java
tring carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);

while(!parser.isClosed()){
    JsonToken jsonToken = parser.nextToken();

    System.out.println("jsonToken = " + jsonToken);
}
```

只要JsonParser的isClosed()方法返回false，那么JSON源中仍然会有更多的令牌。

可以使用JsonParser的nextToken()获得一个JsonToken。 您可以使用此JsonToken实例检查给定的令牌。 令牌类型由JsonToken类中的一组常量表示。 这些常量是：



```java
START_OBJECT
END_OBJECT
START_ARRAY
END_ARRAY
FIELD_NAME
VALUE_EMBEDDED_OBJECT
VALUE_FALSE
VALUE_TRUE
VALUE_NULL
VALUE_STRING
VALUE_NUMBER_INT
VALUE_NUMBER_FLOAT
```

可以使用这些常量来找出当前JsonToken是什么类型的令牌。 可以通过这些常量的equals()方法进行操作。 这是一个例子：



```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);

Car car = new Car();
while(!parser.isClosed()){
    JsonToken jsonToken = parser.nextToken();

    if(JsonToken.FIELD_NAME.equals(jsonToken)){
        String fieldName = parser.getCurrentName();
        System.out.println(fieldName);

        jsonToken = parser.nextToken();

        if("brand".equals(fieldName)){
            car.brand = parser.getValueAsString();
        } else if ("doors".equals(fieldName)){
            car.doors = parser.getValueAsInt();
        }
    }
}

System.out.println("car.brand = " + car.brand);
System.out.println("car.doors = " + car.doors);
```

如果指向的标记是字段名称，则JsonParser的getCurrentName()方法将返回当前字段名称。

如果指向的令牌是字符串字段值，则getValueAsString()返回当前令牌值作为字符串。 如果指向的令牌是整数字段值，则getValueAsInt()返回当前令牌值作为int值。 JsonParser具有更多类似的方法来获取不同类型的curren令牌值（例如boolean，short，long，float，double等）。



## 六、JsonGenerator

Jackson JsonGenerator用于从Java对象（或代码从中生成JSON的任何数据结构）生成JSON。

### 1、创建一个JsonGenerator

为了创建Jackson JsonGenerator，必须首先创建JsonFactory实例。 这是创建JsonFactory的方法：



```java
JsonFactory factory = new JsonFactory();
```

一旦创建了JsonFactory，就可以使用JsonFactory的createGenerator()方法创建JsonGenerator。 这是创建JsonGenerator的示例：



```java
JsonFactory factory = new JsonFactory();

JsonGenerator generator = factory.createGenerator(
    new File("data/output.json"), JsonEncoding.UTF8);
```

createGenerator()方法的第一个参数是生成的JSON的目标。 在上面的示例中，参数是File对象。 这意味着生成的JSON将被写入给定文件。 createGenerator()方法已重载，因此还有其他版本的createGenerator()方法采用例如OutputStream等，提供了有关将生成的JSON写入何处的不同选项。

createGenerator()方法的第二个参数是生成JSON时使用的字符编码。 上面的示例使用UTF-8。



### 2、使用JsonGenerator生成JSON

一旦创建了JsonGenerator，就可以开始生成JSON。 JsonGenerator包含一组write ...()方法，可以使用这些方法来编写JSON对象的各个部分。 这是一个使用Jackson JsonGenerator生成JSON的简单示例：



```java
JsonFactory factory = new JsonFactory();

JsonGenerator generator = factory.createGenerator(
    new File("data/output.json"), JsonEncoding.UTF8);

generator.writeStartObject();
generator.writeStringField("brand", "Mercedes");
generator.writeNumberField("doors", 5);
generator.writeEndObject();

generator.close();
```

此示例首先调用writeStartObject()，将{写入输出。 然后，该示例调用writeStringField()，将品牌字段名称+值写入输出。 之后，将调用writeNumberField()方法，此方法会将Doors字段名称+值写入输出。 最后，调用writeEndObject()，将}写入输出。

JsonGenerator还可以使用许多其他写入方法。 这个例子只显示了其中一些。

### 3、关闭JsonGenerator

完成生成JSON后，应关闭JsonGenerator。 您可以通过调用其close()方法来实现。 这是关闭JsonGenerator的样子：



```java
generator.close();
```



## 七、Jackson注解

Jackson JSON工具包包含一组Java注解，可以使用这些注解来设置将JSON读入对象的方式或从对象生成什么JSON的方式。 此Jackson注解教程介绍了如何使用Jackson的注解。

下面是一些常用的注解：

| 注解               | 用法                                                         |
| ------------------ | ------------------------------------------------------------ |
| @JsonProperty      | 用于属性，把属性的名称序列化时转换为另外一个名称。示例： @JsonProperty("birth_ d ate") private Date birthDate; |
| @JsonFormat        | 用于属性或者方法，把属性的格式序列化时转换成指定的格式。示例： @JsonFormat(timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm") public Date getBirthDate() |
| @JsonPropertyOrder | 用于类， 指定属性在序列化时 json 中的顺序 ， 示例： @JsonPropertyOrder({ "birth_Date", "name" }) public class Person |
| @JsonCreator       | 用于构造方法，和 @JsonProperty 配合使用，适用有参数的构造方法。 示例： @JsonCreator public Person(@JsonProperty("name")String name) {…} |
| @JsonAnySetter     | 用于属性或者方法，设置未反序列化的属性名和值作为键值存储到 map 中 @JsonAnySetter public void set(String key, Object value) { map.put(key, value); } |
| @JsonAnyGetter     | 用于方法 ，获取所有未序列化的属性 public Map<String, Object> any() { return map; } |

下面是一些注解的详细说明。

### 一）、Read + Write注解

Jackson包含一组注解，这些注解会影响从JSON读取Java对象以及将Java对象写入JSON。 我将这些注解称为“读+写注解”。 以下各节将更详细地介绍Jackson的读写注解。

#### 1、@JsonIgnore

Jackson注解@JsonIgnore用于告诉Jackson忽略Java对象的某个属性（字段）。 在将JSON读取到Java对象中以及将Java对象写入JSON时，都将忽略该属性。

这是使用@JsonIgnore注解的示例：



```java
import com.fasterxml.jackson.annotation.JsonIgnore;

public class PersonIgnore {

    @JsonIgnore
    public long  personId = 0;

    public String name = null;
}
```

在上面的类中，不会从JSON读取或写入JSON属性personId。



#### 2、@JsonIgnoreProperties

@JsonIgnoreProperties Jackson注解用于指定要忽略的类的属性列表。 @JsonIgnoreProperties注解放置在类声明上方，而不是要忽略的各个属性（字段）上方。

这是如何使用@JsonIgnoreProperties注解的示例：



```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"firstName", "lastName"})
public class PersonIgnoreProperties {

    public long   personId = 0;

    public String  firstName = null;
    public String  lastName  = null;

}
```

在此示例中，属性firstName和lastName都将被忽略，因为它们的名称在类声明上方的@JsonIgnoreProperties注解声明内列出。



#### 3、@JsonIgnoreType

@JsonIgnoreType Jackson注解用于将整个类型（类）标记为在使用该类型的任何地方都将被忽略。

这是一个示例，展示如何使用@JsonIgnoreType注解：



```java
import com.fasterxml.jackson.annotation.JsonIgnoreType;

public class PersonIgnoreType {

    @JsonIgnoreType
    public static class Address {
        public String streetName  = null;
        public String houseNumber = null;
        public String zipCode     = null;
        public String city        = null;
        public String country     = null;
    }

    public long    personId = 0;

    public String  name = null;

    public Address address = null;
}
```

在上面的示例中，所有Address实例将被忽略。



#### 4、@JsonAutoDetect

Jackson注解@JsonAutoDetect用于告诉Jackson在读写对象时包括非public修饰的属性。

这是一个示例类，展示如何使用@JsonAutoDetect注解：



```java
import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY )
public class PersonAutoDetect {

    private long  personId = 123;
    public String name     = null;

}
```

JsonAutoDetect.Visibility类包含与Java中的可见性级别匹配的常量，表示ANY，DEFAULT，NON_PRIVATE，NONE，PROTECTED_AND_PRIVATE和PUBLIC_ONLY。



### 二）、Read注解

Jackson包含一组注解，这些注解仅影响Jackson将JSON解析为对象的方式-意味着它们影响Jackson对JSON的读取。 我称这些为“读注解”。 以下各节介绍了Jackson的读注解。



#### 1、@JsonSetter

Jackson注解@JsonSetter用于告诉Jackson，当将JSON读入对象时，应将此setter方法的名称与JSON数据中的属性名称匹配。 如果Java类内部使用的属性名称与JSON文件中使用的属性名称不同，这个注解就很有用了。

以下Person类用personId名称对应JSON中名为id的字段：



```java
public class Person {

    private long   personId = 0;
    private String name     = null;

    public long getPersonId() { return this.personId; }
    public void setPersonId(long personId) { this.personId = personId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

但是在此JSON对象中，使用名称id代替personId：



```java
{
  "id"   : 1234,
  "name" : "John"
}
```

Jackson无法将id属性从JSON对象映射到Java类的personId字段。

@JsonSetter注解指示Jackson为给定的JSON字段使用setter方法。 在我们的示例中，我们在setPersonId()方法上方添加@JsonSetter注解。

这是添加@JsonSetter注解的实例：



```java
public class Person {

    private long   personId = 0;
    private String name     = null;

    public long getPersonId() { return this.personId; }
    @JsonSetter("id")
    public void setPersonId(long personId) { this.personId = personId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

@JsonSetter注解中指定的值是要与此setter方法匹配的JSON字段的名称。 在这种情况下，名称为id，因为这是我们要映射到setPersonId()setter方法的JSON对象中字段的名称。



#### 2、@JsonAnySetter

Jackson注解@JsonAnySetter表示Jackson为JSON对象中所有无法识别的字段调用相同的setter方法。 “无法识别”是指尚未映射到Java对象中的属性或设置方法的所有字段。

看一下这个Bag类：



```java
public class Bag {

    private Map<String, Object> properties = new HashMap<>();

    public void set(String fieldName, Object value){
        this.properties.put(fieldName, value);
    }

    public Object get(String fieldName){
        return this.properties.get(fieldName);
    }
}
```

然后查看此JSON对象：



```java
{
  "id"   : 1234,
  "name" : "John"
}
```

Jackson无法直接将此JSON对象的id和name属性映射到Bag类，因为Bag类不包含任何公共字段或setter方法。

可以通过添加@JsonAnySetter注解来告诉Jackson为所有无法识别的字段调用set()方法，如下所示：



```java
public class Bag {

    private Map<String, Object> properties = new HashMap<>();

    @JsonAnySetter
    public void set(String fieldName, Object value){
        this.properties.put(fieldName, value);
    }

    public Object get(String fieldName){
        return this.properties.get(fieldName);
    }
}
```

现在，Jackson将使用JSON对象中所有无法识别的字段的名称和值调用set()方法。

请记住，这仅对无法识别的字段有效。 例如，如果您向Bag Java类添加了公共名称属性或setName（String）方法，则JSON对象中的名称字段将改为映射到该属性/设置器。



#### 3、@JsonCreator

Jackson注解@JsonCreator用于告诉Jackson该Java对象具有一个构造函数（“创建者”），该构造函数可以将JSON对象的字段与Java对象的字段进行匹配。

@JsonCreator注解在无法使用@JsonSetter注解的情况下很有用。 例如，不可变对象没有任何设置方法，因此它们需要将其初始值注入到构造函数中。

以这个PersonImmutable类为例：



```java
public class PersonImmutable {

    private long   id   = 0;
    private String name = null;

    public PersonImmutable(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

}
```

要告诉Jackson应该调用PersonImmutable的构造函数，我们必须在构造函数中添加@JsonCreator注解。 但是，仅凭这一点还不够。 我们还必须注解构造函数的参数，以告诉Jackson将JSON对象中的哪些字段传递给哪些构造函数参数。

添加了@JsonCreator和@JsonProperty注解的PersonImmutable类的示例如下：



```java
public class PersonImmutable {

    private long   id   = 0;
    private String name = null;

    @JsonCreator
    public PersonImmutable(
            @JsonProperty("id")  long id,
            @JsonProperty("name") String name  ) {

        this.id = id;
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

}
```

请注意，构造函数上方的注解以及构造函数参数之前的注解。 现在，Jackson能够从此JSON对象创建PersonImmutable：



```java
{
  "id"   : 1234,
  "name" : "John"
}
```



#### 4、@JacksonInject

Jackson注解@JacksonInject用于将值注入到解析的对象中，而不是从JSON中读取这些值。 例如，假设正在从各种不同的源下载Person JSON对象，并且想知道给定Person对象来自哪个源。 源本身可能不包含该信息，但是可以让Jackson将其注入到根据JSON对象创建的Java对象中。

要将Java类中的字段标记为需要由Jackson注入其值的字段，请在该字段上方添加@JacksonInject注解。

这是一个示例PersonInject类，在属性上方添加了@JacksonInject注解：



```java
public class PersonInject {

    public long   id   = 0;
    public String name = null;

    @JacksonInject
    public String source = null;

}
```

为了让Jackson将值注入属性，需要在创建Jackson ObjectMapper时做一些额外的工作。

这是让Jackson将值注入Java对象的过程：



```java
InjectableValues inject = new InjectableValues.Std().addValue(String.class, "jenkov.com");
PersonInject personInject = new ObjectMapper().reader(inject)
                        .forType(PersonInject.class)
                        .readValue(new File("data/person.json"));
```

请注意，如何在InjectableValues addValue()方法中设置要注入到source属性中的值。 还要注意，该值仅绑定到字符串类型-而不绑定到任何特定的字段名称。 @JacksonInject注解指定将值注入到哪个字段。

如果要从多个源下载人员JSON对象，并为每个源注入不同的源值，则必须为每个源重复以上代码。



#### 5、@JsonDeserialize

Jackson注解@JsonDeserialize用于为Java对象中给定的属性指定自定义反序列化器类。

例如，假设想优化布尔值false和true的在线格式，使其分别为0和1。

首先，需要将@JsonDeserialize注解添加到要为其使用自定义反序列化器的字段。 这是将@JsonDeserialize注解添加到字段的示例：



```java
public class PersonDeserialize {

    public long    id      = 0;
    public String  name    = null;

    @JsonDeserialize(using = OptimizedBooleanDeserializer.class)
    public boolean enabled = false;
}
```

其次，这是@JsonDeserialize注解中引用的OptimizedBooleanDeserializer类的实例：



```java
public class OptimizedBooleanDeserializer
    extends JsonDeserializer<Boolean> {

    @Override
    public Boolean deserialize(JsonParser jsonParser,
            DeserializationContext deserializationContext) throws
        IOException, JsonProcessingException {

        String text = jsonParser.getText();
        if("0".equals(text)) return false;
        return true;
    }
}
```

请注意，OptimizedBooleanDeserializer类使用通用类型Boolean扩展了JsonDeserializer。 这样做会使deserialize()方法返回一个布尔对象。 如果要反序列化其他类型（例如java.util.Date），则必须在泛型括号内指定该类型。

可以通过调用jsonParser参数的getText()方法来获取要反序列化的字段的值。 然后，可以将该文本反序列化为任何值，然后输入反序列化程序所针对的类型（在此示例中为布尔值）。

最后，需要查看使用自定义反序列化器和@JsonDeserializer注解反序列化对象的格式：



```java
PersonDeserialize person = objectMapper
        .reader(PersonDeserialize.class)
        .readValue(new File("data/person-optimized-boolean.json"));
```

注意，我们首先需要如何使用ObjectMapper的reader()方法为PersonDeserialize类创建一个阅读器，然后在该方法返回的对象上调用readValue()。



### 三）、Write注解

Jackson还包含一组注解，这些注解可以影响Jackson将Java对象序列化（写入）到JSON的方式。 以下各节将介绍这些写（序列化）注解中的每一个。



#### 1、@JsonInclude

Jackson注解@JsonInclude告诉Jackson仅在某些情况下包括属性。 例如，仅当属性为非null，非空或具有非默认值时，才应包括该属性。 这是显示如何使用@JsonInclude注解的示例：



```java
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class PersonInclude {

    public long  personId = 0;
    public String name     = null;

}
```

如果为该示例设置的值是非空的，则此示例将仅包括name属性，这意味着不为null且不是空字符串。

@JsonInclude注解的一个更通俗的名称应该是@JsonIncludeOnlyWhen，但是写起来会更长。



#### 2、@JsonGetter

@JsonGetter Jackson注解用于告诉Jackson，应该通过调用getter方法而不是通过直接字段访问来获取某个字段值。 如果您的Java类使用jQuery样式的getter和setter名称，则@JsonGetter注解很有用。

例如，您可能拥有方法personId()和personId（long id），而不是getPersonId()和setPersonId()。

这是一个名为PersonGetter的示例类，它显示了@JsonGetter注解的用法：



```java
public class PersonGetter {

    private long  personId = 0;

    @JsonGetter("id")
    public long personId() { return this.personId; }

    @JsonSetter("id")
    public void personId(long personId) { this.personId = personId; }

}
```

如您所见，personId()方法带有@JsonGetter注解。 @JsonGetter注解上设置的值是JSON对象中应使用的名称。 因此，用于JSON对象中personId的名称是id。 生成的JSON对象如下所示：



```java
{"id":0}
```

还要注意，personId（long personId）方法使用@JsonSetter注解进行注解，以使Jackson识别为与JSON对象中的id属性匹配的设置方法。 从JSON读取Java对象时使用@JsonSetter注解-将Java对象写入JSON时不使用。 为了完整起见，仅包含@JsonSetter注解。



#### 3、@JsonAnyGetter

@JsonAnyGetter Jackson注解使您可以将Map用作要序列化为JSON的属性的容器。 这是在Java类中使用@JsonAnyGetter注解的示例：



```java
public class PersonAnyGetter {

    private Map<String, Object> properties = new HashMap<>();

    @JsonAnyGetter
    public Map<String, Object> properties() {
        return properties;
    }
}
```

当看到@JsonAnyGetter注解时，Jackson将从@JsonAnyGetter注解的方法中获取返回的Map，并将该Map中的每个键值对都视为一个属性。 换句话说，Map中的所有键值对都将作为PersonAnyGetter对象的一部分序列化为JSON。



#### 4、@JsonPropertyOrder

@JsonPropertyOrder Jackson注解可用于指定将Java对象的字段序列化为JSON的顺序。 这是显示如何使用@JsonPropertyOrder注解的示例：



```java
@JsonPropertyOrder({"name", "personId"})
public class PersonPropertyOrder {

    public long  personId  = 0;
    public String name     = null;

}
```

通常，Jackson会按照在类中找到的顺序序列化PersonPropertyOrder中的属性。 但是，@JsonPropertyOrder注解指定了不同的顺序，在序列化的JSON输出中，name属性将首先出现，personId属性将随后出现。



#### 5、@JsonRawValue

@JsonRawValue Jackson注解告诉Jackson该属性值应直接写入JSON输出。 如果该属性是字符串，Jackson通常会将值括在引号中，但是如果使用@JsonRawValue属性进行注解，Jackson将不会这样做。

为了更清楚@JsonRawValue的作用，看看没有使用@JsonRawValue的此类：



```java
public class PersonRawValue {

    public long   personId = 0;

    public String address  = "$#";
}
```

Jackson会将其序列化为以下JSON字符串：



```java
{"personId":0,"address":"$#"}
```

现在，我们将@JsonRawValue添加到address属性，如下所示：



```java
public class PersonRawValue {

    public long   personId = 0;

    @JsonRawValue
    public String address  = "$#";
}
```

现在，当对地址属性进行序列化时，杰克逊将省略引号。 因此，序列化的JSON如下所示：



```java
{"personId":0,"address":$#}
```

当然它是无效的JSON，那么为什么要这么做呢？

如果address属性包含一个JSON字符串，那么该JSON字符串将被序列化为最终的JSON对象，作为JSON对象结构的一部分，而不仅是序列化为JSON对象的address字段中的字符串。

要查看其工作原理，让我们像下面这样更改address属性的值：



```java
public class PersonRawValue {

    public long   personId = 0;

    @JsonRawValue
    public String address  =
            "{ \"street\" : \"Wall Street\", \"no\":1}";

}
```

Jackson会将其序列化为以下JSON：



```java
{"personId":0,"address":{ "street" : "Wall Street", "no":1}}
```

请注意，JSON字符串现在如何成为序列化JSON结构的一部分。

没有@JsonRawValue注解，Jackson会将对象序列化为以下JSON：



```java
{"personId":0,"address":"{ \"street\" : \"Wall Street\", \"no\":1}"}
```

请注意，address属性的值现在如何用引号引起来，并且值内的所有引号均被转义。



#### 6、@JsonValue

Jackson注解@JsonValue告诉Jackson，Jackson不应该尝试序列化对象本身，而应在对象上调用将对象序列化为JSON字符串的方法。 请注意，Jackson将在自定义序列化返回的String内转义任何引号，因此不能返回例如 完整的JSON对象。 为此，应该改用@JsonRawValue（请参阅上一节）。

@JsonValue注解已添加到Jackson调用的方法中，以将对象序列化为JSON字符串。 这是显示如何使用@JsonValue注解的示例：



```java
public class PersonValue {

    public long   personId = 0;
    public String name = null;

    @JsonValue
    public String toJson(){
        return this.personId + "," + this.name;
    }

}
```

要求Jackson序列化PersonValue对象所得到的输出是：



```java
"0,null"
```

引号由Jackson添加。 请记住，对象返回的值字符串中的所有引号均会转义。



#### 7、@JsonSerialize

@JsonSerialize Jackson注解用于为Java对象中的字段指定自定义序列化程序。 这是一个使用@JsonSerialize注解的Java类示例：



```java
public class PersonSerializer {

    public long   personId = 0;
    public String name     = "John";

    @JsonSerialize(using = OptimizedBooleanSerializer.class)
    public boolean enabled = false;
}
```

注意启用字段上方的@JsonSerialize注解。

OptimizedBooleanSerializer将序列的真值序列化为1，将假值序列化为0。这是代码：



```java
public class OptimizedBooleanSerializer extends JsonSerializer<Boolean> {

    @Override
    public void serialize(Boolean aBoolean, JsonGenerator jsonGenerator, 
        SerializerProvider serializerProvider) 
    throws IOException, JsonProcessingException {

        if(aBoolean){
            jsonGenerator.writeNumber(1);
        } else {
            jsonGenerator.writeNumber(0);
        }
    }
}
```