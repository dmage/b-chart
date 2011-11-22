/** @requires BEM */

(function() {

BEM.decl('b-chart__static-range-provider', {

    get : function() {
        return {
            min: this.params.min || 0,
            max: this.params.max || 1
        };
    }

});

})();
