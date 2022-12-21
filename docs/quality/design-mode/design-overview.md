# 设计模式概览

设计模式（Design pattern）代表了最佳的实践，通常被有经验的面向对象的软件开发人员所采用。设计模式是软件开发人员在软件开发过程中面临的一般问题的解决方案。这些解决方案是众多软件开发人员经过相当长的一段时间的试验和错误总结出来的。



## 一、设计模式的六大原则

### 1、单一职责原则

- 一个方法尽可能做一件事情，一般来说不应该让一个方法承担多个职责。

单一职责原则的英文名称是Single Responsibility Principle，简称是SRP。单一职责原则的定义是：应该有且仅有一个原因引起类的变更。

SRP的原话解释是：There should never be more than one reason for a class to change.

- 单一职责原则提出了一个编写程序的标准，用“职责”或“变化原因”来衡量接口或设计是否优良，但是“职责”跟“变化原因”都是不好度量的，要“因地制宜”。
- 单一职责适用于接口、类，同时也适用于方法，也就是说，一个方法尽可能做一件事情，一般来说不应该让一个方法承担多个职责。

### 2、里式替换原则

首先来聊一聊Java中的继承，继承有哪些优点呢：

1. 代码共享，减少创建类的工作量，每个子类都拥有父类的方怯和属性；
2. 提高代码的重用性；
3. 提高代码的可扩展性；
4. 提高产品或项目的开放性。

但是，继承也并不完美，他也存在着如下缺点：

1. 继承是侵入性的。只要继承，就必须拥有父类的所有属性和方曲：
2. 降低代码的灵活性。子类必须拥有父类的属性和方峰，让子类自由的世界中 多了些约束
3. 增强了辑合性。当 父类的常 、变量和方法被修改时，需要考虑子类的修改；

那么如何同时拥有继承的优点，又规避他的缺点呢？这个时候，里式替换原则就站出来了，首先来看看他的定义：

- **第一种定义：** 如果对每一个类型为S的对象o1，都有类型为T的对象o2 ，使得以T定义的所有程序P在所有的对象o1 都代换成o2 时，P程序的行为没有发生变化，那么类型S是类型T的子类型。

- **第二种定义：** 所有引用基类的地方必须能透明地使用其子类的对象。



### 3、依赖倒置原则

- 细节依赖抽象，低层依赖高层。 

- 依赖倒置原则的原始定义是：High level modules should not depend upon low level modules.Both should depend upon abstractions.Abstractions should not depend upon details.Details should depend upon abstractions.

  包含了三层含义：

  1、高层模块不应该依赖低层模块，两者都应该依赖其抽象;

  2、抽象不应该依赖细节；

  3、细节应该依赖抽象。

- 这一原则在Java语言中的表现就是：

  1、模块间的依赖通过抽象发生，实现类之间不发生直接的依赖关系，其依赖关系是通过接口或抽象类产生的；

  2、接口或抽象类不依赖于实现类；

  3、实现类依赖接口或抽象类。

- 一般抽象是不变的，而具体是易变的。每个较高层次都为它所需要的服务声明一个抽象接口，较低的层次实现这些抽象接口，每个高层类都通过该抽象接口使用下一层的服务，接口属于高层,低层要实现高层的接口,因此现在是低层依赖于高层。是依赖关系倒置和接口所有权的倒置。在周围环境发生变化的时候，如果设计可以做到不怎么发生改变，那这样的设计就是好的。

### 4、接口隔离原则

- 应该尽量建立单一接口，不要建立臃肿的接口，接口应该尽量细化。
- 接口隔离原则的原始定义是：Clients should not be forced to depend upon interfaces that they don’t use.客户端不应该依赖它不需要的接口。
- The dependency of one class to another one should depend on the smallest possible interface.类间的依赖关系应该建立在最小的接口上。
- 这两个定义概括起来就是，应该尽量建立单一接口，不要建立臃肿的接口，接口应该尽量细化。

接口分离的手段主要有以下两种：

1. 委托分离，通过增加一个新的类型来委托客户的请求，隔离客户和接口的直接依赖，但会增加系统开销。
2. 多重继承分离，通过接口多继承来实现客户需求。

### 5、迪米特法则

- 一个类应该对自己需要耦合或调用的类知道得最少。
- 迪米特法则（Law of Demeter）又叫最少知道原则（Least Knowledge Principle），1987年秋天由美国Northeastern University的Ian Holland提出，被UML的创始者之一Booch等普及。后来，因为在经典著作《 The Pragmatic Programmer》中提出而广为人知。

**迪米特法则还有一个英文解释是：Only talk to your immediate friends。**

一个对象应该对其他对象有最少的了解。通俗地讲，一个类应该对自己需要耦合或调用的类知道得最少。一个类公开的public属性或方法越多，修改时涉及的面也就越大，变更引起的风险扩散也就越大。在设计时需要反复衡量，是否可以减少public方法和属性，是否可以修改为private、package-private、protected等访问权限，是否可以加上final关键字等。迪米特法则要求类尽量不要对外公布太多的public方法和非静态的public变量，尽量内敛，多使用private、package-private、protected等访问权限。

### 6、开闭原则

- 开闭原则要求尽量通过扩展软件实体的行为来实现变化，而不是通过修改已有的代码来完成变化。

**开闭原则的定义：**

Software entities like classes,modules and functios should be open for extemsion but closed for modifications.

- 一个软件实体如类、模块和函数应该对扩展开放，对修改关闭。
- 一个软件产品只要在生命期内，都会发生变化，既然变化是一个既定的事实，我们应该在设计时尽量适应这些变化，以提高项目的稳定性和灵活性。开闭原则要求尽量通过扩展软件实体的行为来实现变化，而不是通过修改已有的代码来完成变化。如何做到开闭原则：抽象、封装。

## 设计模式分类

设计模式总共有 23 种设计模式。这些模式可以分为三大类：创建型模式（Creational Patterns）、结构型模式（Structural Patterns）、行为型模式（Behavioral Patterns）。

| 序号 | 模式&描述                                                    | 包括                                                         |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | **创建型模式**<br/>这些设计模式提供了一种在创建对象的同时<br/>隐藏创建逻辑的方式，而不是使用 new 运算<br/>符直接实例化对象。这使得程序在判断针对<br/>某个给定实例需要创建哪些对象时更加灵活。 | 工厂模式（Factory Pattern） <br/>抽象工厂模式（Abstract Factory Pattern） <br/>单例模式（Singleton Pattern） <br/>建造者模式（Builder Pattern） <br/>原型模式（Prototype Pattern） |
| 2    | **结构型模式**<br/>这些设计模式关注类和对象的组合。继承的<br/>概念被用来组合接口和定义组合对象获得新<br/>功能的方式。 | 适配器模式（Adapter Pattern） <br/>桥接模式（Bridge Pattern） <br/>过滤器模式（Filter、Criteria Pattern） <br/>组合模式（Composite Pattern） <br/>装饰器模式（Decorator Pattern） <br/>外观模式（Facade Pattern） <br/>享元模式（Flyweight Pattern） <br/>代理模式（Proxy Pattern） |
| 3    | **行为型模式**<br/>这些设计模式特别关注对象之间的通信。      | 责任链模式（Chain of Responsibility Pattern）<br/>命令模式（Command Pattern） <br/>解释器模式（Interpreter Pattern） <br/>迭代器模式（Iterator Pattern） <br/>中介者模式（Mediator Pattern）<br/>备忘录模式（Memento Pattern） <br/>观察者模式（Observer Pattern） <br/>状态模式（State Pattern） <br/>空对象模式（Null Object Pattern） <br/>策略模式（Strategy Pattern） <br/>模板模式（Template Pattern） <br/>访问者模式（Visitor Pattern） |





## 设计模式详解

### 创建型模式

[工厂模式](./design-factory.md)

[抽象工厂模式](./design-factory.md)

[单例模式]()



### 结构性模式

[适配器模式](./design-adapter.md)



[组合模式](./design-composite.md)

[装饰器模式](./design-decorator.md)



[代理模式](./design-proxy.md)

### 行为模式



[责任链模式](./design-chain.md)





[策略模式](./design-strategy.md)
