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
        if(iframes.length == 0){
            eval("window.IE9MoreRealHeight" + 1 + "=0");
            window.setInterval(function(){
                for(var i=0;i<iframes.length;i++){
                    try{
                        reinitIframe(iframes[i].iframe,iframes[i].minHeight);
                    }catch (e){
                        //ignor ...
                    }
                }
            }, 100);
        }

        minHeight = minHeight || 1;
        iframes.push({ iframe:iframe,minHeight:minHeight });
    }


    var DOM_TWINS_ID = "dom-twins-id";
    var cache = {},id = 0,closeMethod = {};
    var Console = {
        info:function(p1,p2){
            console && console.info(p1,p2);
        },
        warn:function(p1,p2){
            console && console.warn(p1,p2);
        }
    }
    //历史页面管理器
    var History = {
        load:function(domtwins){
            domtwins.opts.history = domtwins.opts.history && ('pushState' in history);
            if(domtwins.opts.history){
                if(this.historyDomtwins){
                    //不允许多个有历史功能的domtwins
                    Console.warn("不允许多个有历史功能的domtwins,设置该对象history为false",domtwins);
                    domtwins.opts.history = false;
                }else{
                    this.historyDomtwins = domtwins;
                    this.init();
                }
            }
        },
        init:function(){
            var self = this;
            window.onpopstate = function(e){
                if(e.state){
                    var url = e.state.url,
                        domtwins_status = e.state.domtwins_status,
                        html = e.state.html,
                        domtwins_id = e.state.domtwins_id,
                        onclose = e.state.onclose;
                    if(status === 0){
                        //后退操作
                        if(domtwins_id && cache[domtwins_id]){
                            show(cache[domtwins_id],1);
                        }
                    }else if(domtwins_status === 1){
                        //前进操作
                        if(domtwins_id && cache[domtwins_id]){
                            if(url){
                                show(cache[domtwins_id],2);
                            }else{
                                show(cache[domtwins_id],3);
                            }
                        }
                    }
                }
            }
        },
        open:function(domtwins,url,html,onclose){
            if(domtwins.opts.history){
                var hashId = "#domtwins"+domtwins.id;
                history.replaceState($.extend({},history.state,{ domtwins_id:domtwins.id,domtwins_status:0 }),"",location.href);
                history.pushState({ domtwins_id:domtwins.id,opts:domtwins.opts,url:url,onclose:onclose,domtwins_status:1 },"",hashId);
            }
            if(url){
                _open(domtwins,url,onclose);
            }else{
                _openHtml(domtwins,html,onclose);
            }
        },
        back:function(domtwins,oncloseParams){
            if(this.historyDomtwins && domtwins.id === this.historyDomtwins.id
                && "#domtwins"+domtwins.id === location.hash){
                history.back();
            }else{
                _close(domtwins,oncloseParams);
            }
        }
    }

    function open(url,onclose){
        History.open(this,url,"",onclose);
    }
    function _open(domtwins,url,onclose){
        domtwins.onclose = onclose;
        $("iframe",domtwins.iframeDom).attr("src",url);
        show(domtwins,2);
    }
    function show(domtwins,type){
        var selector = domtwins.selector;
        selector.hide();
        domtwins.htmlLoaderDom.hide();
        domtwins.iframeDom.hide();
        if(type == 1){
            selector.show();
        }else if(type == 2){
            domtwins.iframeDom.show();
        }else if(type == 3){
            domtwins.htmlLoaderDom.show();
        }
    }
    function openHtml(html,onclose){
        History.open(this,"",html,onclose);
    }
    function _openHtml(domtwins,html,onclose){
        domtwins.onclose = onclose;
        domtwins.htmlLoaderDom.html(html);
        show(domtwins,3);
    }
    function _close(domtwins,oncloseParams){
        show(domtwins,1);
        if(domtwins.onclose && typeof domtwins.onclose === 'string'){
            var onclose = domtwins.onclose;
            if(onclose.indexOf("___temp") == 0){
                domtwins.onclose = closeMethod[onclose];
                delete closeMethod[onclose];
            }else{
                domtwins.onclose = closeMethod[onclose]|| eval(onclose);
            }
        }
        if(domtwins.onclose && typeof domtwins.onclose === 'function'){
            domtwins.onclose(domtwins,oncloseParams);
            delete domtwins.onclose;
        }
    }
    function close(oncloseParams){
        History.back(this,oncloseParams);
    }

    function DomTwins(selector,opts){
        this.selector = selector;
        this.opts = $.extend({
            "iframeFit":true,
            "history":false //支持后退按钮，同一页面只能设置一个DomTwins对象history为true，多个的话难以控制。一般来说整页型覆盖显示的才会开启此功能，局部页面的不支持
        },opts);
        History.load(this);
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

        if(this.opts.iframeFit != false){
            //要计算iframeFit
            addIframe(iframe[0]);
        }

        cache[domTwinsId] = this;
    }

    DomTwins.prototype = {
        open:open,
        close:close
    };

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
    };

    DomTwins.registerCloseMethod = function(methodName,func){
        if(typeof func != "function"){
            throw new Error("入参func不是函数:" + func);
        }
        if(closeMethod.hasOwnProperty(methodName)){
            throw new Error("同名函数注册只能注册一次:" + methodName);
        }
        closeMethod[methodName] = func;
    };

    $.fn.DomTwins = function(opts){
        var selector = $(this);
        var domTwinsId = selector.attr(DOM_TWINS_ID);
        if(domTwinsId){
            return cache[domTwinsId] || new DomTwins(selector);
        }else{
            return new DomTwins(selector,opts);
        }
    };
    //支持配置的方式的节点
//    dom-twins = target
    $(document).on("click","[dom-twins-target]",function(){
        var $this = $(this);
        var targetId = $this.attr("dom-twins-target");
        var $target = $("["+ DOM_TWINS_ID +"="+ targetId +"]");
        var domTwins = cache[targetId];
        if(!domTwins){
            var iframeFit = $this.attr("dom-twins-iframeFit") || $this.attr("dom-twins-iframefit");
            var history = $this.attr("dom-twins-history") || $this.attr("dom-twins-history");
            domTwins = new DomTwins($target,
                {
                    iframeFit : iframeFit === 'true' || iframeFit === '1',
                    history : history === 'true' || history === '1'
                }
            );
        }
        domTwins.open( $this.attr("dom-twins-href"),$this.attr("dom-twins-onclose"));
        return false;
    });

    window.DomTwins = DomTwins;
    return DomTwins;

}));


