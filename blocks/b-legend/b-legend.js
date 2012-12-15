/** @requires BEM.DOM */

(function() {
"use strict";

BEM.DOM.decl('b-legend', {

    setItems : function(items) {
        var html = "";
        for (var i = 0, l = items.length; i < l; ++i) {
            var item = items[i];
            html += BEMHTML.apply({
                block: 'b-legend',
                elem: 'item',
                color: item.color,
                name: item.name
            });
        }
        this.domElem.html(html);
    }

});

})();
