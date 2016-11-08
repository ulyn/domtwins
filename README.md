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

### 2.选择占位div进行初始化：注意不能用body

    var opts = {
        iframeFit:true,
        history:false
    }
	var domTwins = $(".sec1").DomTwins(opts);

或

	var domTwins = new DomTwins($(".sec1"),opts);

参数表示
iframeFit:当使用iframe加载显示页面时，iframe是否自适应子页面高度。默认值为true
history:是否支持后退前进操作，支持H5才有效，并且页面中只有一个DomTwins对象能生效。建议只有在切换整屏页面的时候才使用。默认值为false

###3.打开加载新的url 

	domTwins.open(
		"child.html",
		function(dt,closeParams){
            console.info("onclose",dt,closeParams);
     	}
	);

### 4.关闭 

#### iframe子页面child.html中自关闭

    DomTwins.closeThis(oncloseParams)；

注：child.html需要引入domtwins.js,若不引入也可以使用

    parent.postMessage({ type:"close",data:oncloseParams },"*");

#### iframe子页面child.html中自关闭(废弃，只支持同域)

	parent.DomTwins.parentClose(window,oncloseParams)；

注：其中的入参为child.html下的window或者dom均可，建议使用window

#### 当前页关闭 

	domTwins.close(closeParams)；

closeParams可以是任意值，最终传递给onclose回调

## 也可以这么用 


### 1.配置占位div属性dom-twins-id 


### 2.配置按钮属性dom-twins-target，dom-twins-href，dom-twins-onclose，dom-twins-iframeFit，dom-twins-history

	
	<div class="sec2" dom-twins-id="sec2">
        <div >
            <input type="button" id="view2" value="查看"
                   dom-twins-target="sec2" dom-twins-onclose="onclose"
                   dom-twins-href="child.html">
        </div>
    </div>

定义onclose函数（全局的 (/ □ \)，你肯定会开骂...

    function onclose(dt,oncloseParams){
        console.info("onclose",dt,oncloseParams);
    }

好吧，开个onclose函数注册的，开心点，想怎么做都行

    DomTwins.registerCloseMethod("onclose",
        function(dt,oncloseParams){
            console.info("myCloseMethod",dt,oncloseParams);
        }
    );

### 3.引入js ### 

	<script src="//cdn.bootcss.com/jquery/1.12.3/jquery.js"></script>
	<script src="domtwins.js"></script>