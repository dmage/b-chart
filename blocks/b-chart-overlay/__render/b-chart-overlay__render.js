/** @requires BEM */

(function($) {

BEM.decl('b-chart-overlay__render', {

    onSetMod : {
        'js' : function() {
            var _this = this;

            _this.render = BEM.create(
                'b-chart-render__line',
                _this.params
            );
        }
    },

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
        this.render.drawItem(sched, layers, itemNo);
        this._run(sched, layers, itemNo + 1);
    }

});

})(jQuery);
