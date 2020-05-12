/*
* data-info = "draggable" 标识事件标签
* data-parent= "" 标识要改变style的标签
* data-style ="" 可选width top left 标识要改变的对象的style
*/
+function ($) {
    //记录初始位置
    var startX = 0, startY = 0, offsetX, offsetY;

    var Draggable = function (element) {
        this.element = $(element);
    }

    Draggable.prototype.mouseDown = function () {
        this.getStyle();
    }

    // 获取要改变的样式
    Draggable.prototype.getStyle = function () {
        var style = this.element.data('style');

        switch (style) {
            case 'width':
                this.pre = $(this.element.data('parent'));
                this.preWidth = this.pre.outerWidth();
                this.mouseMove('setWith');
                break;
            case 'top':
                this.mouseMove('setTop');
                break;
            case 'right':
                this.pre = $(this.element.data('parent'));
                this.width = this.element.outerWidth();
                this.preWidth = this.pre.outerWidth();
                this.right = this.element.css('right');
                this.maxRight = this.preWidth - this.width;

                /*定义事件*/
                this.rightEvent = $.Event('right.fy.draggable');
                this.mouseMove('setRight');
                break;
            case 'move':
                this.parent = $(this.element.data('parent'));
                this.right = this.parent.css('right');
                this.bottom = this.parent.css('bottom');
                this.mouseMove('elemMove');
                break;
            case 'leftBottom':
                this.parent = $(this.element.data('parent'));
                this.left = this.parent.css('left');
                this.bottom = this.parent.css('bottom');
                this.mouseMove('leftBottom');
                break;
        }
    }
    Draggable.prototype.mouseMove = function (style) {
        var $this = this;
        var i = 1;

        //开始事件
        $this.element.trigger('fy.draggable.start');
        $(document).on('mousemove.fy.draggable', function (event) {
            //开始事件
            $this.element.trigger('fy.draggable.move');
            i++;
            if (!(i % 2)) return;
            var pos = {};
            pos.x = event.pageX;
            pos.y = event.pageY;
            $this[style](pos);
        });
        $(document).one('mouseup.fy.draggable', function () {
            $(document).off('mousemove.fy.draggable');
            //结束事件
            $this.element.trigger('fy.draggable.end');
        });
    }

    //改变宽度
    Draggable.prototype.setWith = function (point) {
        //要注意坐标系的方向
        var width = startX - point.x + this.preWidth;
        this.pre.width(width);
    },
    //改变top值
    Draggable.prototype.setTop = function (point) { }

    //改变right值
    Draggable.prototype.setRight = function (point) {

        var right = startX - point.x + parseInt(this.right);
        var minRight = 0;
        if (right >= minRight && right <= this.maxRight) { this.element.css('right', right + 'px');}
        else if (right > this.maxRight) { this.element.css('right', this.maxRight + 'px'); right = this.maxRight; }
        else { this.element.css('right', minRight + 'px'); right = minRight; }

        /*触发事件*/
        this.element.trigger(this.rightEvent, [this.maxRight, right]);
    }
    //移动元素
    Draggable.prototype.elemMove = function (point) {
        var top = point.y - offsetY;
        var left = point.x - offsetX;
        this.parent.offset({ top: top,left:left});
        //var right = startX - point.x + parseInt(this.right);
        //var bottom = startY - point.y + parseInt(this.bottom);
        //this.parent.css({
        //    'right': right,
        //    'bottom': bottom
        //});
    }
    Draggable.prototype.leftBottom = function (point) {
        var left = point.x - startX + parseInt(this.left);
        var bottom = startY - point.y + parseInt(this.bottom);

        this.parent.css({
            'left': left,
            'bottom': bottom
        });
    }

    function initialize(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('fy.draggable');

            //实例存放在元素的data属性
            if (!data) { $this.data('fy.draggable', (data = new Draggable(this))) }
            if (typeof option == 'string'); data[option]();
        });
    }
    function Plugin() {
        var $this = this;
        return this.each(function () {
            $(this).on('mousedown.fy.draggable', function (e) {
                e.preventDefault();
                //记录初始值
                startX = e.pageX;
                startY = e.pageY;
                initialize.call($(this), 'mouseDown');
            });
        });
    }

    $.fn.draggable = Plugin;
    $.fn.draggable.Constructor = Draggable;


    $(document).on('mousedown.fy.draggable', '[data-info = "draggable"]', function (e) {
        e.preventDefault();

        //记录初始值
        startX = e.pageX;
        startY = e.pageY;

        offsetX = e.offsetX == undefined ? e.originalEvent.layerX : e.offsetX;
        offsetY = e.offsetY == undefined ? e.originalEvent.layerY : e.offsetY;

        initialize.call($(this), 'mouseDown');
    });
}(jQuery)