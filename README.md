# 事情是这样的 

经常的，我们界面上的查询框、ajax方式加载的列表等界面，
在跳转某个页面再返回时，界面已经不是最终操作的效果
（查询输入条件没了，最明显的是用了select2插件的select，列表原来的第五页变成又回到第一页）

用了弹出窗modal的方式，可是显示出来，整个页面效果跟UI设计已经不是一个格调了。

总想耍点小聪明，做个不像弹出窗的弹窗吧。。。

# 使用是这样的 

## 申明 

1.依赖jquery.js

2.支持模块化方式使用

3.只基于chrome测试过

## 可以这么用

### 1.引入js

	<script src="//cdn.bootcss.com/jquery/1.12.3/jquery.js"></script>
	<script src="domtwins.js"></script>

### 2.选择占位div进行初始化：注意不能取body

	var domTwins = $(".sec1").DomTwins();

或

	var domTwins = new DomTwins($(".sec1"));

###3.打开加载新的url 

	domTwins.open(
		"child.html",
		function(d){
            console.info("onclose",d);
     	}
	);

### 4.关闭 

#### iframe子页child.html中关闭后退调用 

	parent.DomTwins.parentClose(this)；

注：其中的this为child.html下的window或者dom均可

#### 当前页关闭 

	domTwins.close()；


## 也可以这么用 


### 1.配置占位div属性dom-twins-id 


### 2.配置按钮属性dom-twins-target，dom-twins-href ，dom-twins-onclose 

	
	<div class="sec2" dom-twins-id="sec2">
        <div >
            <input type="button" id="view2" value="查看"
                   dom-twins-target="sec2" dom-twins-onclose="onclose"
                   dom-twins-href="child.html">
        </div>
    </div>

### 3.引入js ### 

	<script src="//cdn.bootcss.com/jquery/1.12.3/jquery.js"></script>
	<script src="domtwins.js"></script>