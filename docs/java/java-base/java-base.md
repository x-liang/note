# Java 基础



## 深拷贝与浅拷贝

一句话，深拷贝是值传递，浅拷贝是引用传递。





## this 与 类名.this的区别

- this： 是指当前这段代码所在的类的对象
- 类名.this：是指类名的对象，一般用在匿名类或内部类中使用，用来调用外部类的方法和属性的

下面给出一个例子：

```java
class A {
    public void method（）{
        A.this  //这里的"A.this"就是表示类"A"的对象。。在这种情况下"A.this"和"this"是一样的
    }

    class  B {  
        // "class A"中的一个内部类"B"(内部类也可以是使用关键字"new" 所新实例出来的一个匿名类或者接口,
        // 比如"new OnClickListener()")
        void method1() {
            // 这里的"A.this"还是表示类"A"的对象。。但是这里是在内部类里面。。
            // 所以这里如果使用的是"this"那就是内部类B的对象了。。
            // 但是我们经常会在内部类里面调用外部的东西。。所以就用"A.this"这种方式就行了
            A.this
        }
    }
}
```



## BigDecimal

### 一：简介

Java在java.math包中提供的API类BigDecimal，用来对超过16位有效位的数进行精确的运算。双精度浮点型变量double可以处理16位有效数。在实际应用中，需要对更大或者更小的数进行运算和处理。float和double只能用来做科学计算或者是工程计算，在商业计算中要用java.math.BigDecimal。BigDecimal所创建的是对象，我们不能使用传统的+、-、*、/等算术运算符直接对其对象进行数学运算，而必须调用其相对应的方法。方法中的参数也必须是BigDecimal的对象。构造器是类的特殊方法，专门用来创建对象，特别是带有参数的对象。

### 二：构造器方法

BigDecimal在进行初始化对象时，建议使用字符串或整形进行初始化，但是不要使用浮点型进行初始化，会造成数值精度偏差。

```java
BigDecimal(int);     // 创建一个具有参数所指定整数值的对象
BigDecimal(double);  // 创建一个具有参数所指定双精度值的对象
BigDecimal(long);    // 创建一个具有参数所指定长整数值的对象
BigDecimal(String);  // 创建一个具有参数所指定以字符串表示的数值的对象
```

### 三：方法

```java
bigDecimal1.add(bigDecimal2);           // bigDecimal1 加 bigDecimal2
bigDecimal1.subtract(bigDecimal2);      // bigDecimal1 减 bigDecimal2
bigDecimal1.multiply(bigDecimal2);      // bigDecimal1 乘以 bigDecimal2
bigDecimal1.divide(bigDecimal2);        // bigDecimal1 除以 bigDecimal2
bigDecimal.toString();                  // 将bigDecimal对象的数值转换成字符串
bigDecimal.doubleValue();               // 将bigDecimal对象中的值以双精度数返回
bigDecimal.floatValue();                // 将bigDecimal对象中的值以单精度数返回
bigDecimal.longValue();                 // 将bigDecimal对象中的值以长整数返回
bigDecimal.intValue();                  // 将bigDecimal对象中的值以整数返回
```

### 四：常用方法

1、BigDecimal比较

BigDecimal是通过使用compareTo(BigDecimal)来比较的，具体比较情况如下：

```java
import java.math.BigDecimal;
 
public class BigDecimalTest {
 
    /**
     * 注意不能使用equals方法来比较大小。
     *
     * compareTo比较结果为：-1、0、1
     * 如：a.a.compareTo(b)，结果为-1表示a小于b，为0表示a等于b 为1表示a大于b
     *
     * 使用BigDecimal的坏处是性能比double和float差，在处理庞大，复杂的运算时尤为明显，因根据实际需求决定使用哪种类型。
     */
    public void test() {
        BigDecimal a = new BigDecimal("1");
        BigDecimal b = new BigDecimal("2");
        BigDecimal c = new BigDecimal("1");
        int result1 = a.compareTo(b);
        int result2 = a.compareTo(c);
        int result3 = b.compareTo(a);
 
        System.out.println(result1);  // -1
        System.out.println(result2);  // 0
        System.out.println(result3);  // 1
    }
}
```

2、保留两位小数

```java
import java.text.DecimalFormat;
 
public class BigDecimalTest {
 
    /**
     * 保留两位小数
     */
    public void formatTest() {
        double num = 13.154215;
 
        //方式一
        DecimalFormat df1 = new DecimalFormat("0.00");
        String str = df1.format(num);
        System.out.println(str);  //13.15
 
        //方式二
        // #.00 表示两位小数 #.0000四位小数
        DecimalFormat df2 = new DecimalFormat("#.00");
        String str2 = df2.format(num);
        System.out.println(str2);  //13.15
 
        //方式三
        //%.2f %. 表示 小数点前任意位数   2 表示两位小数 格式后的结果为f 表示浮点型
        String result = String.format("%.2f", num);
        System.out.println(result);  //13.15
    }
}
```

3、String.formate用法

```java
import java.math.BigDecimal;
 
public class BigDecimalTest {
 
    public void test1() { //4.1541483776749997E9
        double a = 4887233385.5;
        double b = 0.85;
 
        System.out.println("result1-->" + a * b);  // result1-->4.1541483776749997E9
 
        BigDecimal a1 = new BigDecimal(a);
        BigDecimal b1 = new BigDecimal(b);
 		//result2-->4154148377.674999891481619无限不循环
        System.out.println("result2-->" + a1.multiply(b1));
 
        BigDecimal aBigDecimal = new BigDecimal(String.valueOf(a));
        BigDecimal bBigDecimal = new BigDecimal(String.valueOf(b));
 
        // 或者下面这种写法
        // BigDecimal aBigDecimal = new BigDecimal(Double.toString(a));
        // BigDecimal bBigDecimal = new BigDecimal(Double.toString(b));
 
        System.out.println("result3-->" + aBigDecimal.multiply(bBigDecimal)); //result3-->4154148377.675
 
    }
}
```

4、四舍五入

```java
// BigDecimal.setScale()方法用于格式化小数点
     
setScale(1); // 表示保留一位小数，默认用四舍五入方式 
 
setScale(1, BigDecimal.ROUND_DOWN); // 直接删除多余的小数位，如2.35会变成2.3 
 
setScale(1, BigDecimal.ROUND_UP); // 进位处理，2.35变成2.4 
 
setScale(1, BigDecimal.ROUND_HALF_UP); // 四舍五入，2.35变成2.4
 
setScaler(1, BigDecimal.ROUND_HALF_DOWN); // 四舍五入，2.35变成2.3，如果是5则向下舍
 
setScaler(1, BigDecimal.ROUND_CEILING); // 接近正无穷大的舍入
 
setScaler(1, BigDecimal.ROUND_FLOOR); // 接近负无穷大的舍入，数字>0和ROUND_UP作用一样，数字<0和ROUND_DOWN作用一样
 
setScaler(1, BigDecimal.ROUND_HALF_EVEN); // 向最接近的数字舍入，如果与两个相邻数字的距离相等，则向相邻的偶数舍入。
```

5、格式化

由于NumberFormat类的format()方法可以使用BigDecimal对象作为其参数，可以利用BigDecimal对超出16位有效数字的货币值，百分值，以及一般数值进行格式化控制。

```java
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
 
public class BigDecimalTest {
 
    public void test() {
        NumberFormat currency = NumberFormat.getCurrencyInstance(); //建立货币格式化引用
        NumberFormat percent = NumberFormat.getPercentInstance();  //建立百分比格式化引用
        percent.setMaximumFractionDigits(3); //百分比小数点最多3位
 
        BigDecimal loanAmount = new BigDecimal("150.48"); //贷款金额
        BigDecimal interestRate = new BigDecimal("0.008"); //利率
        BigDecimal interest = loanAmount.multiply(interestRate); //相乘
 
        System.out.println("贷款金额:\t" + currency.format(loanAmount)); //贷款金额: ￥150.48
        System.out.println("利率:\t" + percent.format(interestRate));  //利率: 0.8%
        System.out.println("利息:\t" + currency.format(interest)); //利息: ￥1.20
    }
 
    public void test3() {
        DecimalFormat df = new DecimalFormat();
        double data = 1234.56789; //格式化之前的数字
 
        //1、定义要显示的数字的格式（这种方式会四舍五入）
        String style = "0.0";
        df.applyPattern(style);
        System.out.println("1-->" + df.format(data));  //1234.6
 
        //2、在格式后添加诸如单位等字符
        style = "00000.000 kg";
        df.applyPattern(style);
        System.out.println("2-->" + df.format(data));  //01234.568 kg
 
 
        //3、 模式中的"#"表示如果该位存在字符，则显示字符，如果不存在，则不显示。
        style = "##000.000 kg";
        df.applyPattern(style);
        System.out.println("3-->" + df.format(data));  //1234.568 kg
 
        //4、 模式中的"-"表示输出为负数，要放在最前面
        style = "-000.000";
        df.applyPattern(style);
        System.out.println("4-->" + df.format(data)); //-1234.568
 
 
        //5、 模式中的","在数字中添加逗号，方便读数字
        style = "-0,000.0#";
        df.applyPattern(style);
        System.out.println("5-->" + df.format(data));  //5-->-1,234.57
 
 
        //6、模式中的"E"表示输出为指数，"E"之前的字符串是底数的格式，
        // "E"之后的是字符串是指数的格式
        style = "0.00E000";
        df.applyPattern(style);
        System.out.println("6-->" + df.format(data));  //6-->1.23E003
 
 
        //7、 模式中的"%"表示乘以100并显示为百分数，要放在最后。
        style = "0.00%";
        df.applyPattern(style);
        System.out.println("7-->" + df.format(data));  //7-->123456.79%
 
 
        //8、 模式中的"\u2030"表示乘以1000并显示为千分数，要放在最后。
        style = "0.00\u2030";
        //在构造函数中设置数字格式
        DecimalFormat df1 = new DecimalFormat(style);
        //df.applyPattern(style);
        System.out.println("8-->" + df1.format(data));  //8-->1234567.89‰
    }
}
```

6、科学计数法

有些项目可能会涉及到从Excel导入数据，但如果Excel里单元格类型为数值，但内容数据太长时（如银行账号），导入时，会默认读取为科学计数法，用以下代码便轻松解决。

```java
import java.math.BigDecimal;
 
public class BigDecimalTest {
 
    public void test5() {
        BigDecimal bd = new BigDecimal("3.40256010353E11");
        String result = bd.toPlainString();
        System.out.println(result);  //340256010353
    }
}
```

7、java中价格的数字中间有逗号的处理

```
import java.util.StringTokenizer;
 
public class BigDecimalTest {
 
    public void test1() {
        StringTokenizer st = new StringTokenizer( "123,456,789", ",");
        StringBuffer sb = new StringBuffer();
        while(st.hasMoreTokens())   {
            sb.append(st.nextToken());
        }
        System.out.println(sb);  //123456789
    }
 
    public void test2() {
        String str = "123,456,789";
        str = str.replace(",", "");
        System.out.println(str);  //123456789
    }
}
```



8、精确计算

```
double value1=1.00;
String value2 = "1.00";
BigDecimal b1 = new BigDecimal(Double.valueOf(value1));
BigDecimal b1 = new BigDecimal(String.valueOf(value2));
 
public BigDecimal add(BigDecimal value);                        //加法
public BigDecimal subtract(BigDecimal value);                   //减法
public BigDecimal multiply(BigDecimal value);                   //乘法
public BigDecimal divide(BigDecimal value);                     //除法
```

下面是一个工具类，该工具类提供加，减，乘，除运算。

```
import java.math.BigDecimal;
 
public class BigDecimalUtil {
 
    /**
     * 提供精确加法计算的add方法
     * @param value1 被加数
     * @param value2 加数
     * @return 两个参数的和
     */
    public static double add(double value1,double value2){
        BigDecimal b1 = new BigDecimal(Double.valueOf(value1));
        BigDecimal b2 = new BigDecimal(Double.valueOf(value2));
        return b1.add(b2).doubleValue();
    }
 
    /**
     * 提供精确减法运算的sub方法
     * @param value1 被减数
     * @param value2 减数
     * @return 两个参数的差
     */
    public static double sub(double value1,double value2){
        BigDecimal b1 = new BigDecimal(Double.valueOf(value1));
        BigDecimal b2 = new BigDecimal(Double.valueOf(value2));
        return b1.subtract(b2).doubleValue();
    }
 
    /**
     * 提供精确乘法运算的mul方法
     * @param value1 被乘数
     * @param value2 乘数
     * @return 两个参数的积
     */
    public static double mul(double value1,double value2){
        BigDecimal b1 = new BigDecimal(Double.valueOf(value1));
        BigDecimal b2 = new BigDecimal(Double.valueOf(value2));
        return b1.multiply(b2).doubleValue();
    }
 
    /**
     * 提供精确的除法运算方法div
     * @param value1 被除数
     * @param value2 除数
     * @param scale 精确范围
     * @return 两个参数的商
     * @throws IllegalAccessException
     */
    public static double div(double value1,double value2,int scale) throws IllegalAccessException{
        //如果精确范围小于0，抛出异常信息
        if(scale<0){
            throw new IllegalAccessException("精确度不能小于0");
        }
        BigDecimal b1 = new BigDecimal(Double.valueOf(value1));
        BigDecimal b2 = new BigDecimal(Double.valueOf(value2));
        return b1.divide(b2, scale).doubleValue();
    }
}
```

