/** @requires BEM */

(function() {

BEM.decl('b-chart__static-settings-provider', {

    get : function(callback) {
        callback.title(this.params.title || "");
        callback.yAxes(this.params.yAxes || []);
        callback.items(this.params.items || []);
    }

});

})();
