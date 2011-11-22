/** @requires BEM */

(function() {

BEM.decl('i-math-data-provider', {

    get : function(xbegin, xend) {
        var step = this.params.step || 1;
        var f = this[this.params.func || 'sin'] || this.sin;

        var x = Math.ceil(xbegin / step) * step;
        var i = 0;
        var length = Math.floor((xend - x) / step);
        var xData = new Array(length);
        var yData = new Array(length);
        while (x < xend) {
            xData[i] = x;
            yData[i] = f(x);
            x += step;
            i += 1;
        }
        return {
            x: xData,
            y: yData
        };
    },

    sin : Math.sin,

    cos : Math.cos

});

})();
