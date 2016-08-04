"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'],factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    if(!$){
        throw new Error("缺少依赖的jQuery");
    }
    var browserVersion = window.navigator.userAgent.toUpperCase();
    var isOpera = browserVersion.indexOf("OPERA") > -1 ? true : false;
    var isFireFox = browserVersion.indexOf("FIREFOX") > -1 ? true : false;
    var isChrome = browserVersion.indexOf("CHROME") > -1 ? true : false;
    var isSafari = browserVersion.indexOf("SAFARI") > -1 ? true : false;
    var isIE = (!!window.ActiveXObject || "ActiveXObject" in window);
    var isIE9More = (! -[1, ] == false);
    var iframes = [];
    function reinitIframe(iframe, minHeight) {
        try {
//            var iframe = document.getElementById(iframeId);
            var bHeight = 0;
            if (isChrome == false && isSafari == false)
                bHeight = iframe.contentWindow.document.body.scrollHeight;

            var dHeight = 0;
            if (isFireFox == true)
                dHeight = iframe.contentWindow.document.documentElement.offsetHeight + 2;
            else if (isIE == false && isOpera == false)
                dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
            else if (isIE == true && isIE9More) {//ie9+
                var heightDeviation = bHeight - eval("window.IE9MoreRealHeight" + 1);
                if (heightDeviation == 0) {
                    bHeight += 3;
                } else if (heightDeviation != 3) {
                    eval("window.IE9MoreRealHeight" + 1 + "=" + bHeight);
                    bHeight += 3;
                }
            }
            else//ie[6-8]、OPERA
                bHeight += 3;

            var height = Math.max(bHeight, dHeight);
            if (height < minHeight) height = minHeight;
            iframe.style.height = height + "px";
        } catch (ex) { }
    }
    function addIframe(iframe,minHeight){
        minHeight = minHeight || 1;
        iframes.push({ iframe:iframe,minHeight:minHeight });
    }
    eval("window.IE9MoreRealHeight" + 1 + "=0");
    window.setInterval(function(){
        for(var i=0;i<iframes.length;i++){
            reinitIframe(iframes[i].iframe,iframes[i].minHeight);
        }
    }, 100);


    var DOM_TWINS_ID = "dom-twins-id";
    var cache = {},id = 0,closeMethod = {};

    function open(url,onclose){
        this.onclose = onclose;
        if(onclose && typeof onclose === 'string'){
            this.onclose = closeMethod[onclose] || eval(onclose);
        }
        var selector = this.selector;
        selector.hide();
        this.htmlLoaderDom.hide();
        $("iframe",this.iframeDom).attr("src",url);
        this.iframeDom.show();
    };

    function openHtml(html,onclose){
        this.onclose = onclose;
        if(onclose && typeof onclose === 'string'){
            this.onclose = closeMethod[onclose] || eval(onclose);
        }
        var selector = this.selector;
        selector.hide();
        this.iframeDom.hide();
        this.htmlLoaderDom.show();
    };

    function close(oncloseParams){
        var selector = this.selector;
        selector.show();
        this.iframeDom.hide();
        this.htmlLoaderDom.hide();
        this.onclose && typeof this.onclose === 'function' && this.onclose(this,oncloseParams);
        delete this.onclose;
    };

    function DomTwins(selector){
        this.selector = selector;
        var domTwinsId = this.selector.attr(DOM_TWINS_ID);
        if(!domTwinsId){
            domTwinsId = "id_" + ++id;
            this.selector.attr(DOM_TWINS_ID,domTwinsId);
        }else{
            if(cache[domTwinsId]){
                throw new Error("不允许出现相同的dom-twins-id："+domTwinsId);
            }
        }
        this.id = domTwinsId;

        //初始化;
        this.htmlLoaderDom = selector.clone(true)
            .removeAttr("id").removeAttr("dom-twins-id")
            .attr("dom-twins-copy",this.id).empty().hide();
        var iframe = $("<iframe src='' scrolling='no' frameborder='0' style='padding: 0px; width: 100%; height: 100%;'></iframe>");
        this.iframeDom = this.htmlLoaderDom.clone(true)
            .append(iframe);
        $(selector).after(this.htmlLoaderDom).after(this.iframeDom);
        addIframe(iframe[0]);
        cache[domTwinsId] = this;
    }

    DomTwins.prototype = {
        open:open,
        close:close
    }

    DomTwins.parentClose = function(dom,oncloseParams){
        var $childFrameWindow = dom;
        if(dom.toString() != "[object Window]"){
            $childFrameWindow = dom.ownerDocument.defaultView;
        }
        var bodyrel="temp"+ new Date().getTime();
        var curDocument = $childFrameWindow.document;
        $("body",curDocument).attr("dom-twins-body-rel",bodyrel);
        var parentDocument = $childFrameWindow.parent.document;
        $(parentDocument).find("iframe").each(function(){
            var iframe = $(this);
            var tRel=$(this.contentWindow.document).find("body").attr("dom-twins-body-rel");
            if(tRel==bodyrel){
                var $target = iframe.parent().prev();
                var domTwins = cache[$target.attr(DOM_TWINS_ID)];
                domTwins.close(oncloseParams);
            }
        });
    }

    DomTwins.registerCloseMethod = function(methodName,func){
        if(typeof func != "function"){
            throw new Error("入参func不是函数:" + func);
        }
        if(closeMethod.hasOwnProperty(methodName)){
            throw new Error("同名函数注册只能注册一次:" + methodName);
        }
        closeMethod[methodName] = func;
    }

    $.fn.DomTwins = function(selector){
        if(!selector){
            selector = $(this);
        }
        var domTwinsId = $(selector).attr(DOM_TWINS_ID);
        if(domTwinsId){
            return cache[domTwinsId] || new DomTwins(selector);
        }else{
            return new DomTwins(selector);
        }
    }
    //支持配置的方式的节点
//    dom-twins = target
    $(document).on("click","[dom-twins-target]",function(){
        var $this = $(this);
        var targetId = $this.attr("dom-twins-target");
        var $target = $("["+ DOM_TWINS_ID +"="+ targetId +"]");
        var domTwins = cache[targetId];
        if(!domTwins){
            domTwins = new DomTwins($target);
        }
        domTwins.open( $this.attr("dom-twins-href"),$this.attr("dom-twins-onclose"));
        return false;
    });

    window.DomTwins = DomTwins;
    return DomTwins;

}));


