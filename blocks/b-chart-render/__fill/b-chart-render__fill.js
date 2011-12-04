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
            mozilla = $.browser.mozilla;

        console.time('render ' + itemNo);

        ctx.clearRect(0, 0, dim.width, dim.height);
        canvas.css('left', '0');
        canvas.css('width', '100%');

        ctx.fillStyle = item.color || "#000";

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
