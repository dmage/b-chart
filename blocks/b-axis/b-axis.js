/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-axis', {

    update : function(ticks) {
        var offsets = {
            left: 'top', right: 'top',
            top: 'left', bottom: 'left'
        };

        var content = "";
        var offset = offsets[this.getMod('pos')] || 'top';
        for (var i = 0; i < ticks.length; ++i) {
            var tick = ticks[i];
            content += BEMHTML.apply([{
                block: 'b-axis',
                elem: 'value',
                attrs: { style: offset + ':' + tick.offset + 'px' },
                content: [
                    { elem: 'label', content: tick.label },
                    { elem: 'tick' }
                ]
            }]);
        }
        this.domElem.empty().append(content);
    }

});

})();
