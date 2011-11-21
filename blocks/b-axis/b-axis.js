/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-axis', {

    update : function() {
        this.domElem.empty().append($('<b>test</b>'));
    }

});

})();
