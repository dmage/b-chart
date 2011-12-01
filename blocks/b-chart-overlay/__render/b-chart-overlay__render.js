/** @requires BEM */

(function($) {

BEM.decl('b-chart-overlay__render', {

    layersRequest : function() {
        var content = this.params.content,
            items = content.items,
            request = [];

        for (var i = 0, l = items.length; i < l; ++i) {
            request.push({
                xAxis: items[i].xAxis,
                yAxis: items[i].yAxis,
                item: i
            });
        }

        return request;
    },

   _run : function(sched, layers, itemNo) {
        var _this = this,
            content = this.params.content,
            items = content.items;

        if (itemNo >= items.length) {
            return sched.next();
        } else if (items[itemNo]._rendered) {
            _this._run(sched, layers, itemNo + 1);
        } else {
            sched.next(function(sched) {
                _this.drawItem(sched, layers, itemNo);
            });
        }
    },

    draw : function(sched, layers) {
        this._run(sched, layers, 0);
    },

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
            xData = item.data.x,
            yData = item.data.y,
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y,
            mozilla = $.browser.mozilla;

        console.time('render ' + itemNo);
        ctx.clearRect(0, 0, dim.width, dim.height);
        canvas.css('left', '0');
        canvas.css('width', '100%');

        ctx.strokeStyle = item.color || "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();

        x = (xf(xData[0]) + 0.5);
        y = height - (yf(yData[0]) + 0.5);
        ctx.moveTo(x, y);
        for (var l = xData.length, i = 1; i < l; ++i) {
            if (mozilla && i % 2000 == 0) {
                // restart line every 2000 points
                // it gives a bit different result, but much faster on Linux
                ctx.stroke();
                ctx.beginPath();

                x = (xf(xData[i - 1]) + 0.5);
                y = height - (yf(yData[i - 1]) + 0.5);
                ctx.moveTo(x, y);
            }
            x = (xf(xData[i]) + 0.5);
            y = height - (yf(yData[i]) + 0.5);
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        console.timeEnd('render ' + itemNo);

        item._rendered = true;

        this._run(sched, layers, itemNo + 1);
    }

});

})(jQuery);
