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
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y, prev,
            i, l, dots, begin,
            colorMixin = this.params.colorMixin,
            colorMixinLevel = this.params.colorMixinLevel || 0.5,
            colorAlpha = this.params.colorAlpha,
            mozilla = $.browser.mozilla;

        var xSliceName = this.params.xSliceName,
            topSliceName = this.params.topSliceName,
            bottomSliceName = this.params.bottomSliceName,
            shiftSliceName = this.params.shiftSliceName;
        typeof xSliceName !== 'undefined' || (xSliceName = "x");
        typeof topSliceName !== 'undefined' || (topSliceName = "y");
        typeof bottomSliceName !== 'undefined' || (bttomSliceName = "");
        typeof shiftSliceName !== 'undefined' || (shiftSliceName = "shift");

        var xData = item.renderData[xSliceName],
            topData = item.renderData[topSliceName],
            bottomData = item.renderData[bottomSliceName] || [],
            shiftData = item.renderData[shiftSliceName] || [];

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

        function fill() {
            for (var j = i - 1; j >= begin; --j) {
                x = (xf(xData[j]) + 0.5);
                y = height - (yf((bottomData[j] || 0) + (shiftData[j] || 0)) + 0.5);
                ctx.lineTo((x | 0) + 0.5, (y | 0) + 0.5);
            }
            ctx.fill();
        }

        i = 0;
        l = xData.length;
        dots = 0;
        prev = null;
        while (i < l) {
            if (topData[i] === null) {
                if (dots > 0) {
                    fill();
                }

                ++i;
                dots = 0;
                prev = null;
                continue;
            }

            x = (xf(xData[i]) + 0.5);
            y = height - (yf(topData[i] + (shiftData[i] || 0)) + 0.5);
            if (prev === null) {
                ctx.beginPath();
                ctx.moveTo((x | 0) + 0.5, (y | 0) + 0.5);
                begin = i;
            } else {
                ctx.lineTo((x | 0) + 0.5, (y | 0) + 0.5);
            }

            prev = topData[i];
            ++i;

            ++dots;
            if (mozilla && dots == 10000) {
                // restart line every 10000 points
                // it gives a bit different result, but much faster on Linux
                fill();
                i -= 1; // connect pieces

                dots = 0;
                prev = null;
                continue;
            }
        }
        if (dots > 0) {
            fill();
        }

        console.timeEnd('render ' + itemNo);
    }

});

})(jQuery);
