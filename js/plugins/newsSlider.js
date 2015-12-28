define([
    "funcs",
    "jquery"
], function(f, $) {
    "use strict";
    // предпологаеться сетка с элементами одинаковой шириной
    // но на состояние 28.12.2015 реализована только одна линия
    var NewsSlider = f.CreateClass("NewsSlider", {
        columns: 3,
        rows: 1,
        index: 0
    });
    
    NewsSlider.prototype.init = function(params, box) {
        params = params || {};
        
        this.box = box;
        this.$box = $(box);
        this.$box.css({
            "position": "relative"
        });
        
        // кол-во колонок
        if ( params.columns ) {
            this.columns = params.columns;
        }
        
        // кол-во строк
        if ( params.rows ) {
            this.rows = params.rows;
        }
        
        // кол-во элементов в одном кадре
        this.frameElemsCount = this.columns * this.rows;
        
        // номер текущего кадра
        if ( params.index ) {
            this.index = 0;
        }
        
        this.$elems = this.$box.find("li");
        this.initAnimation();
        
        this.initNavigation(params);
        window.temp1 = this;
        console.log(this);
    };
    
    NewsSlider.prototype.initNavigation = function(params) {
        this.$prev = params.$prev;
        this.$next = params.$next;
        
        this.$prev.on("click", function(e) {
            e.preventDefault();
            this.next(-1);
        }.bind(this));
        
        this.$next.on("click", function(e) {
            e.preventDefault();
            this.next(1);
        }.bind(this));
    };
    
    NewsSlider.prototype.initAnimation = function() {
        var time = 200,
            frameTime = 30,
            frameCount = time / frameTime;
        
        this.animParams = {
            time: time,
            frameTime: frameTime,
            frameCount: frameCount,
            opacity: {
                end: 0,
                step: 1 / frameCount
            },
            translate: {
                end: {
                    x: -40,
                    y: -20
                },
                step: {
                    x: 0,
                    y: 0
                }
            },
            scale: {
                end: 1.1,
                start: 1
            }
        };
        
        this.animParams.scale.step = (this.animParams.scale.end - this.animParams.scale.start) / frameCount;
        
        this.animParams.translate.step.x = this.animParams.translate.end.x / frameCount;
        this.animParams.translate.step.y = this.animParams.translate.end.y / frameCount;
        
    };
    
    NewsSlider.prototype.getAnimateCSSby = function(index) {
        var translate = this.animParams.translate,
            scale = this.animParams.scale,
            opacity = this.animParams.opacity,
            frameCount = this.animParams.frameCount;
        
        var transform = [
            "translateX("+ translate.step.x * index +"px)",
            "translateY("+ translate.step.y * index +"px)",
            "scale("+ (scale.start + scale.step * index) +")"
        ].join(" ");
        
        return {
            "transform": transform,
            "opacity": opacity.step * (frameCount - index)
        };
    };
    
    NewsSlider.prototype.stopElemAnimation = function($elem) {
        // сброс текущей анимации
        var interval = $elem.data("NewsSlider.elemInterval");
        clearInterval( interval );
        $elem.clearQueue();
    };
    
    NewsSlider.prototype.animateElem = function($elem, vector, callback) {
        this.stopElemAnimation($elem);
        $elem.show();
        
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        if ( vector === 0 ) {
            throw new Error("zero vector");
        }
        
        var index,
            endIndex,
            frameCount = this.animParams.frameCount,
            frameTime = this.animParams.frameTime;
        
        if ( vector > 0 ) {
            index = 0;
            endIndex = frameCount + 1;
        } else {
            index = frameCount;
            endIndex = 0;
        }
        
        var interval = setInterval(function() {
            $elem.css(this.getAnimateCSSby(index));
            
            index += vector;
            if ( index > endIndex && vector > 0 ||
                 index < endIndex && vector < 0 
            ) {
                clearInterval( interval );
                
                callback();
            }
        }.bind(this), frameTime);
        
        $elem.data("NewsSlider.elemInterval", interval);
    };
    
    NewsSlider.prototype.next = function(vector, callback) {
        if ( !f.isFunction(callback) ) {
            callback = function() {};
        }
        
        var index = this.index,
            count = this.frameElemsCount,
            // исчезнуть
            $outElems,
            // появиться
            $inElems;
        
        this.index += vector;
        
        // цикличность
        if ( vector > 0 && this.index * count >= this.$elems.length ) {
            this.index = 0;
        }
        if ( vector < 0 && this.index <= 0 ) {
            this.index = Math.ceil( this.$elems.length / count ) - 1;
        }
        
        $outElems = this.$elems.slice(index * count, index * count + count);
        $inElems = this.$elems.slice(this.index * count, this.index * count + count);
        
        this.animate($outElems, $inElems, callback);
    };
    
    NewsSlider.prototype.animate = function($outElems, $inElems, callback) {
        var width = $outElems.eq(0).width(),
            height = $outElems.eq(0).height(),
            margin = parseFloat( $outElems.eq(1).css("margin-left") );
        
        this.$box.height(height);
        $inElems.css({
            "display": "block",
            "opcity": "0",
            "position": "absolute",
            "top": "0"
        });
        
        var x = 0;
        $inElems.each(function(i, elem) {
            var $elem = $(elem);
            $elem.css({
                "left": x + "px"
            });
            
            x += width + margin;
        }.bind(this));
        
        // callback hell!
        var afterOut, afterIn;
        // сначал скрываем элементы
        $outElems.each(function(i, elem) {
            var $elem = $(elem);
            
            setTimeout(function() {
                var cb = false;
                if ( i >= $outElems.length -1 ) {
                    cb = afterOut;
                }
                
                this.animateElem($elem, 1, cb);
            }.bind(this), (i+1) * 30);
        }.bind(this));
        
        afterOut = function() {
            $inElems.each(function(i, elem) {
                var $elem = $(elem);
                var cb = false;
                if ( i >= $inElems.length -1 ) {
                    cb = afterIn;
                }
                
                setTimeout(function() {
                    this.animateElem($elem, -1, cb);
                }.bind(this), (i+1) * 30);
            }.bind(this));
        }.bind(this);
        
        afterIn = function() {
            $inElems.css({
                "opacity": "1",
                "position": "relative",
                "left": "0"
            });
            $outElems.hide();
            
            this.$box.css({
                "height": "auto"
            });
            
            callback();
        }.bind(this);
    };
    
    
    // =================
    $.fn.newsSlider = function(params) {
        
        return this.each(function() {
            var elem = this,
                $elem = $(elem);
            
            $elem.data("newsSlider", new NewsSlider(params, elem));
        });
    };
    
    return NewsSlider;
});
