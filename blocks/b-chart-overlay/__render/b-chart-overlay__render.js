/** @requires BEM */

(function() {

BEM.decl('b-chart-overlay__render', {

    draw : function(ctx) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            xAxis = content.xAxes[0],
            yAxis = content.yAxes[0],
            xf, yf, x, y;

        for (var j = 0; j < content.items.length; ++j) {
            var item = content.items[j];
            var xAxis = content.xAxes[item.xAxis || 0] || content.xAxes[0];
            var yAxis = content.yAxes[item.yAxis || 0] || content.yAxes[0];
            var xData = item.data.x;
            var yData = item.data.y;

            xf = xAxis.scale.f;
            yf = yAxis.scale.f;

            ctx.strokeStyle = "rgb(100,200,100)";
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
        }
    }

});

})();
