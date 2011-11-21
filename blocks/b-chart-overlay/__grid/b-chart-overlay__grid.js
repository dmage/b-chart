/** @requires BEM */

(function() {

BEM.decl('b-chart-overlay__grid', {

    draw : function(ctx) {
        var dim = this.params.dimensions,
            width = dim.width,
            height = dim.height,
            content = this.params.content,
            xAxis = content.xAxes[0],
            yAxis = content.yAxes[0],
            f, ticks;

        if (typeof ctx.mozDash !== 'undefined') {
            ctx.mozDash = [2, 4];
        }

        if (xAxis) {
            f = xAxis.scale.f;
            ticks = xAxis.ticks;
            ctx.strokeStyle = "rgb(235,235,235)";
            ctx.lineWidth = 1;
            for (var l = ticks.length, i = 0; i < l; ++i) {
                var x = (Math.round(f(ticks[i])) + 0.5);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        if (yAxis) {
            f = yAxis.scale.f;
            ticks = yAxis.ticks;
            ctx.strokeStyle = "rgb(220,220,220)";
            ctx.lineWidth = 1;
            for (var l = yAxis.ticks.length, i = 0; i < l; ++i) {
                var y = height - (Math.round(f(ticks[i])) + 0.5);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }
        
        if (typeof ctx.mozDash !== 'undefined') {
            ctx.mozDash = null;
        }
    }

});

})();
