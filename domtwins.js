"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('jQuery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery'],factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    if(!$){
        throw new Error("缺少依赖的jQuery");
    }
    var DOM_TWINS_ID = "dom-twins-id";
    var cache = {};

    function open(url,onclose){
        this.onclose = onclose;
        var selector = this.selector;
        selector.hide();
        this.htmlLoaderDom.hide();
        $("iframe",this.iframeDom).attr("src",url);
        this.iframeDom.show();
        location.hash = "dom-twins-" + this.id;
    };

    function openHtml(html,onclose){
        this.onclose = onclose;
        var selector = this.selector;
        selector.hide();
        this.iframeDom.hide();
        this.htmlLoaderDom.show();
        location.hash = this.id;
    };

    function close(){
        var selector = this.selector;
        selector.show();
        this.iframeDom.hide();
        this.htmlLoaderDom.hide();
        this.onclose && this.onclose(this);
        delete this.onclose;
    };

    function DomTwins(selector){
        this.selector = selector;
        var domTwinsId = this.selector.attr(DOM_TWINS_ID);
        if(!domTwinsId){
            domTwinsId = "id_" + new Date().getTime() + Math.random();
            this.selector.attr(DOM_TWINS_ID,domTwinsId);
        }else{
            if(cache[domTwinsId]){
                throw new Error("不允许出现相同的dom-twins-id："+domTwinsId);
            }
        }
        this.id = domTwinsId;

        //初始化;
        this.htmlLoaderDom = selector.clone(true).attr("dom-twins-copy",this.id).empty().hide();
        this.iframeDom = this.htmlLoaderDom.clone(true).html("<iframe src='' frameborder='0' width='100%' height='100%'></iframe>");
        $(selector).after(this.htmlLoaderDom).after(this.iframeDom);

        cache[domTwinsId] = this;
    }

    DomTwins.prototype = {
        open:open,
        close:close
    }

    DomTwins.parentClose = function(obj){
        var bodyrel="temp"+ new Date().getTime();
        var curDocument = obj.ownerDocument || obj.document;
        $("body",curDocument).attr("dom-twins-body-rel",bodyrel);
        var parentDocument = curDocument.defaultView.parent.document;
        $(parentDocument).find("iframe").each(function(){
            var iframe = $(this);
            var tRel=$(this.contentWindow.document).find("body").attr("dom-twins-body-rel");
            if(tRel==bodyrel){
                var $target = iframe.parent().prev();
                var domTwins = cache[$target.attr(DOM_TWINS_ID)];
                domTwins.close();
            }
        });
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
        domTwins.open( $this.attr("dom-twins-href"),
            (function(){
                var onclose = $this.attr("dom-twins-onclose");
                if(onclose){
                    var tempFunc = eval(onclose);
                    return tempFunc;
                }
            })()
        );
        return false;
    });

    window.DomTwins = DomTwins;
    return DomTwins;

}));


