/** @requires BEM */

(function($) {

BEM.decl('b-chart-overlay__tooltip', {

    onSetMod : {
        'js' : function() {
            var _this = this,
                viewport = _this.params.content.viewport;

            var $tooltip = $('<div>');
            $tooltip.css('position', 'absolute');
            $tooltip.css('min-width', '60px');
            $tooltip.css('background', 'white');
            $tooltip.css('border', '1px solid #666');

            _this.$tooltip = $tooltip;
            _this.$tooltip.appendTo(_this.params.content.viewport);

            viewport.mousemove($.proxy(this.handleMove, this));
        }
    },

    layersRequest : function() {
        return [];
    },

    draw : function(sched, layers) {
        sched.next();
    },

    handleMove : function(event) {
        var _this = this,
            dim = _this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = _this.params.content,
            items = content.items,
            xAxes = content.xAxes,
            yAxes = content.yAxes,
            viewport = _this.params.content.viewport,
            $tooltip = _this.$tooltip;

        var offset = viewport.offset();
        var px = (event.pageX - offset.left),
            py = height - (event.pageY - offset.top);

        var essential = 20,
            dist = essential*essential,
            nearest;
        var iters = 0;
        for (var i = 0, l = items.length; i < l; ++i) {
            var item = items[i],
                xAxis = xAxes[item.xAxis || 0] || xAxes[0],
                yAxis = yAxes[item.yAxis || 0] || yAxes[0],
                xData = item.renderData.x || [],
                yData = item.renderData.y || [],
                shiftData = item.renderData.shift || [],
                x = xAxis.scale,
                y = yAxis.scale;

            var xBegin = x.fInv(px - essential),
                xEnd = x.fInv(px + essential);

            var j = $.binarySearch(xBegin, xData),
                m = xData.length;
            if (j < 0) {
                j = -j - 1;
            }

            while (j < m) {
                var xVal = xData[j],
                    yVal = yData[j];
                    shiftVal = shiftData[j] || 0;
                if (xVal > xEnd) {
                    break;
                }
                if (yVal === null) {
                    ++j;
                    continue;
                }

                var dx = px - x.f(xVal),
                    dy = py - y.f(yVal + shiftVal),
                    dd = dx*dx + dy*dy;
                if (dd < dist) {
                    dist = dd;
                    nearest = { item: i, pos: j };
                }

                ++j;
                iters += 1;
            }
        }

        if (nearest) {
            var item = items[nearest.item],
                j = nearest.pos,
                xAxis = xAxes[item.xAxis || 0] || xAxes[0],
                yAxis = yAxes[item.yAxis || 0] || yAxes[0],
                xData = item.renderData.x || [],
                yData = item.renderData.y || [],
                shiftData = item.renderData.shift || [],
                xVal = xData[j],
                yVal = yData[j],
                shiftVal = shiftData[j] || 0,
                x = xAxis.scale,
                y = yAxis.scale;

            px = x.f(xVal);
            py = y.f(yVal + shiftVal);
            $tooltip.css('left', px + 'px');
            $tooltip.css('bottom', py + 'px');
            $tooltip.text(xVal + ',' + yVal + " -- " + iters);
        } else {
            $tooltip.text('miss ' + px + ',' + py + " -- " + iters);
        }
    }

});

})(jQuery);
