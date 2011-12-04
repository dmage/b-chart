/** @requires BEM */

(function($) {

BEM.decl('b-chart-render__line', {

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
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y, prev,
            i, l, dots,
            mozilla = $.browser.mozilla;

        console.time('render ' + itemNo);

        ctx.clearRect(0, 0, dim.width, dim.height);
        canvas.css('left', '0');
        canvas.css('width', '100%');

        ctx.strokeStyle = item.color || "#000";
        ctx.lineWidth = 1;

        i = 0;
        l = xData.length;
        dots = 0;
        prev = null;
        while (i < l) {
            if (yData[i] === null) {
                if (dots > 0) {
                    ctx.stroke();
                }
                ++i;
                dots = 0;
                prev = null;
                continue;
            }

            if (prev === null) {
                ctx.beginPath();

                x = (xf(xData[i]) + 0.5);
                y = height - (yf(yData[i]) + 0.5);
                ctx.moveTo(x, y);
            } else {
                x = (xf(xData[i]) + 0.5);
                y = height - (yf(yData[i]) + 0.5);
                ctx.lineTo(x, y);
            }

            ++dots;
            if (dots == 2000) {
                // restart line every 2000 points
                // it gives a bit different result, but much faster on Linux
                ctx.stroke();
                ctx.beginPath();

                dots = 0;
                prev = null;
                continue;
            }

            prev = yData[i];
            ++i;
        }
        if (dots > 0) {
            ctx.stroke();
        }

        console.timeEnd('render ' + itemNo);
    }

});

})(jQuery);
