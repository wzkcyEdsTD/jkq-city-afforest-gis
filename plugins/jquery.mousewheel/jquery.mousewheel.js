+function ($) {
    function mousewheel(){
        var mousewheelEventNames = {
            DOMMouseScroll: 'DOMMouseScroll',
            mousewheel: "mousewheel"
        }
        var mouseEvent = null;
        var sup = document.body.onmousewheel;
        if (sup !== undefined) {
            mouseEvent = mousewheelEventNames.mousewheel;
        } else {
            mouseEvent = mousewheelEventNames.DOMMouseScroll;
        }
        return { event: mouseEvent };
    }
    $(function () {
        $.support.mouseWheelEvent = mousewheel();
        $.event.special.bsmouseWheelEvent = {
            bindType: $.support.mouseWheelEvent.event,
            delegateType: $.support.mouseWheelEvent.event,
            handle: function (e) {

                //Y向上为负数，X
                var deltaY = 0,delta = 0, deltaX =0;
                var bsEvent = e.originalEvent;
                if (bsEvent.detail !== undefined) { deltaY = -bsEvent.detail / 3; }
                if (bsEvent.axis !== undefined) { deltaX = bsEvent.delta / 3; }
                if (bsEvent.wheelDelta !== undefined) { delta = bsEvent.wheelDelta/120 }
                if (bsEvent.wheelDeltaY !== undefined) { deltaY = bsEvent.wheelDeltaY / 120; }
                if (bsEvent.wheelDeltaX !== undefined) { deltaX = -1 * bsEvent.wheelDeltaX / 120; }
                deltaY = deltaY || delta;
                return e.handleObj.handler.call(this, arguments, { Y: deltaY,X: deltaX });
            }
        }
    });
}(jQuery);