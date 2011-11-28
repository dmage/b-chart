/** @requires BEM */

(function() {

BEM.decl('i-time-range-provider', {

    onSetMod : {
        'js' : function() {
            var _this = this;

            _this.period = this.params.period || 3600;
            _this.updateInterval = this.params.updateInterval || 1000;

            this.interval = setInterval(function() {
                _this.trigger('update');
            }, _this.updateInterval);
        }
    },

    get : function() {
        var now = +new Date()/1000;
        return {
            min: now - this.period,
            max: now
        };
    }

});

})();
