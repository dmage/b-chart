/** @requires BEM */

(function($) {

BEM.decl('b-chart-render__fill', {

    drawItem : function(sched, layers, itemNo) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            item = content.items[itemNo],
            xAxis = content.xAxes[item.xAxis || 0] || content.xAxes[0],
            yAxis = content.yAxes[item.yAxis || 0] || content.yAxes[0],
            canvas = layers[itemNo].canvas,
            ctx = layers[itemNo].ctx,
            xData = item.renderData.x,
            yData = item.renderData.y,
            shiftData = item.renderData.shift || [],
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y, prev,
            i, l, dots, begin,
            colorMixin = this.params.colorMixin,
            colorMixinLevel = this.params.colorMixinLevel || 0.5,
            colorAlpha = this.params.colorAlpha,
            mozilla = $.browser.mozilla;

        console.time('render ' + itemNo);

        ctx.clearRect(0, 0, dim.width, dim.height);
        canvas.css('left', '0');
        canvas.css('width', '100%');

        var color = item.color || "rgb(0,0,0)";
        if (typeof colorMixin !== 'undefined' || typeof colorAlpha !== 'undefined') {
            var result = $.colorToRgba(color);

            if (typeof colorMixin !== 'undefined') {
                var mixin = $.colorToRgba(colorMixin)
                    lvl = colorMixinLevel;

                result = {
                    r: Math.floor((1 - lvl) * result.r + lvl * mixin.r),
                    g: Math.floor((1 - lvl) * result.g + lvl * mixin.g),
                    b: Math.floor((1 - lvl) * result.b + lvl * mixin.b),
                    a: result.a
                };
            }

            if (typeof colorAlpha !== 'undefined') {
                result.a = colorAlpha;
            }

            if (result.a == 1) {
                color = 'rgb(' + result.r + ',' + result.g + ',' + result.b + ')';
            } else {
                color = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + result.a + ')';
            }
        }
        ctx.fillStyle = color;

        i = 0;
        l = xData.length;
        dots = 0;
        prev = null;
        while (i < l) {
            if (yData[i] === null) {
                if (dots > 0) {
                    for (var j = i; j >= begin; --j) {
                        x = (xf(xData[j]) + 0.5);
                        y = height - (yf(shiftData[j] || 0) + 0.5);
                        ctx.lineTo(x, y);
                    }
                    ctx.fill();
                }
                ++i;
                dots = 0;
                prev = null;
                continue;
            }

            x = (xf(xData[i]) + 0.5);
            y = height - (yf(yData[i] + (shiftData[i] || 0)) + 0.5);
            if (prev === null) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                begin = i;
            } else {
                ctx.lineTo(x, y);
            }

            ++dots;
            if (mozilla && dots == 10000) {
                // restart line every 10000 points
                // it gives a bit different result, but much faster on Linux
                for (var j = i; j >= begin; --j) {
                    x = (xf(xData[j]) + 0.5);
                    y = height - (yf(shiftData[j] || 0) + 0.5);
                    ctx.lineTo(x, y);
                }
                ctx.fill();

                dots = 0;
                prev = null;
                continue;
            }

            prev = yData[i];
            ++i;
        }
        if (dots > 0) {
            for (var j = i; j >= begin; --j) {
                x = (xf(xData[j]) + 0.5);
                y = height - (yf(shiftData[j] || 0) + 0.5);
                ctx.lineTo(x, y);
            }
            ctx.fill();
        }

        console.timeEnd('render ' + itemNo);
    }

});

})(jQuery);
