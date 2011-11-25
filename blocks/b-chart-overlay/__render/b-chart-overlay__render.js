/** @requires BEM */

(function() {

BEM.decl('b-chart-overlay__render', {

    _run : function(sched, ctx, itemNo) {
        var _this = this,
            content = this.params.content;

        if (itemNo >= content.items.length) {
            return sched.next();
        } else {
            sched.next(function(sched, ctx) {
                _this.drawItem(sched, ctx, itemNo);
            });
        }
    },

    draw : function(sched, ctx) {
        this._run(sched, ctx, 0);
    },

    drawItem : function(sched, ctx, itemNo) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            item = content.items[itemNo],
            xAxis = content.xAxes[item.xAxis || 0] || content.xAxes[0],
            yAxis = content.yAxes[item.yAxis || 0] || content.yAxes[0],
            xData = item.data.x,
            yData = item.data.y,
            xf = xAxis.scale.f,
            yf = yAxis.scale.f,
            x, y;

        ctx.strokeStyle = item.color || "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();

        x = (xf(xData[0]) + 0.5);
        y = height - (yf(yData[0]) + 0.5);
        ctx.moveTo(x, y);
        for (var l = xData.length, i = 1; i < l; ++i) {
            x = (xf(xData[i]) + 0.5);
            y = height - (yf(yData[i]) + 0.5);
            ctx.lineTo(x, y);
        }

        ctx.stroke();

        this._run(sched, ctx, itemNo + 1);
    }

});

})();
