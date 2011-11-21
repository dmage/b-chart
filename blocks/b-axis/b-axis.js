/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-axis', {

    update : function(ticks) {
        var content = "";
        for (var i = 0; i < ticks.length; ++i) {
            var tick = ticks[i];
            // FIXME add support for top/bottom pos
            content += BEMHTML.apply([{
                block: 'b-axis',
                elem: 'value',
                attrs: { style: "top: " + tick.offset + "px" },
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
