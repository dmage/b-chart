/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-busy', {

    onSetMod : {
        'js' : function() {
            console.log('init busy overlay');
            this.domElem.animate({
                opacity: 0.75
            });
        }
    }

});

})();
