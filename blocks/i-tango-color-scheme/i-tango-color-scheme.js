/** @requires BEM */

(function() {

BEM.decl('i-tango-color-scheme', {

    get : function(i) {
        return this.__self.colors[i % this.__self.colors.length];
    },

}, {

    colors : [
        '#73d216', // Chameleon
        '#edd400', // Butter
        '#3465a4', // Sky Blue
        '#cc0000', // Scarlet Red
        '#75507b', // Plum
        '#f57900', // Orange
        '#babdb6', // Aluminium
        '#c17d11'  // Chocolate
    ]

});

})();
