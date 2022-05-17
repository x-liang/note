# JVM调优







## JVM参数总结

### -Xmn

设置年轻代堆的大小，单位为K、M、G，年轻代堆大小建议在总堆大小的25%~50%之间。如果太小，执行GC的频率会变高，如果太大，执行Full GC的时间会变长

```
-Xmn256m
-Xmn262144k
-Xmn268435456
```

可以使用 `-XX:NewSize` 设置初试大小 `-XX:MaxNewSize`设置最大大小。来代替-Xmn



### -Xms

设置堆的初试大小，这个数值必须为1024的整数倍，且大于1M，单位为K、M、G

```
-Xms6291456
-Xms6144k
-Xms6m
```

如果没有设置，默认为年轻代和老年代大小之和。

堆的初始大小也可以使用`-XX:InitalHeapSize`参数设置

### -Xmx

设置堆内存的最大值。该参数必须是1024的整数倍，并且大小超过2M，单位为K、M、G。-Xms和-Xmx通常为相同值

```
-Xmx83886080
-Xmx81920k
-Xmx80m
```

### -Xss 

设置线程栈的大小，单位为K、M、G。

不同系统的默认值：

- Linux/x64 (64-bit): 1024 KB
- macOS (64-bit): 1024 KB
- Oracle Solaris/x64 (64-bit): 1024 KB
- Windows: The default value depends on virtual memory

```
-Xss1m
-Xss1024k
-Xss1048576
```



### -XX:ActiveProcessorCount=x

覆盖VM用于计算其用于各种操作 (例如GC和ForkJoinPool) 的线程池大小的CPU数量

VM通常从操作系统确定可用处理器的数量。在docker容器中运行多个Java进程时, 此标志对于分区CPU资源很有用。即使未启用UseContainerSupport, 也会保留此标志。

有关启用和禁用容器支持的说明, 请参见 *-XX:-UseContainerSupport*



### -XX:-CompactStrings

禁用紧凑字符串功能，默认启用。