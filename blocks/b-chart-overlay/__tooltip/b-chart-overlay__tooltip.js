/** @requires BEM */

(function($) {

BEM.decl('b-chart-overlay__tooltip', {

    onSetMod : {
        'js' : function() {
            var _this = this,
                viewport = _this.params.content.viewport;

            var $tooltip = $('<div>');
            $tooltip.css('position', 'absolute');
            $tooltip.css('min-width', '60px');
            $tooltip.css('background', 'white');
            $tooltip.css('border', '1px solid #666');

            _this.$tooltip = $tooltip;
            _this.$tooltip.appendTo(_this.params.content.viewport);

            viewport.mousemove($.proxy(this.handleMove, this));
        }
    },

    layersRequest : function() {
        return [];
    },

    draw : function(sched, layers) {
        sched.next();
    },

    handleMove : function(event) {
        var _this = this,
            dim = _this.params.dimensions,
            width = dim.width,
            height = dim.height,
            viewport = _this.params.content.viewport,
            $tooltip = _this.$tooltip;

        var offset = viewport.offset();
        var px = (event.pageX - offset.left),
		    py = height - (event.pageY - offset.top);

        $tooltip.css('left', px + 'px');
        $tooltip.css('bottom', py + 'px');

        $tooltip.text(px + ',' + py);
    }

});

})(jQuery);
