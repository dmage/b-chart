/** @requires BEM */

(function() {

BEM.decl('i-task-scheduler', {

    onSetMod : {
        'js' : function() {
            this.tasks = [];
        }
    },

    run : function(prio, func) {
    }

}, {

    PRIO_DATA : 1,
    PRIO_UI : 2

});

BEM.blocks['i-task-scheduler'].instance = BEM.create('i-task-scheduler');

})();
