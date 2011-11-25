/** @requires BEM */

(function() {

BEM.decl('i-task-scheduler', {

    onSetMod : {
        'js' : function() {
            this.tasks = [];
            this.byId = {};
            this.minPrio = null;
            this.currentPrio = null;
            this.currentTask = null;
            this.lastTimeout = new Date();
        }
    },

    _findPrioBlock : function(prio) {
        var tasks = this.tasks;
        var prioBlock;
        for (var i = 0, l = tasks.length; i < l; ++i) {
            if (tasks[i].prio == prio) {
                prioBlock = tasks[i];
                break;
            }
            if (tasks[i].prio > prio) {
                prioBlock = { prio: prio, queue: [], revQueue: [] };
                tasks.splice(i, 0, prioBlock);
                break;
            }
        }
        if (!prioBlock) {
            prioBlock = { prio: prio, queue: [], revQueue: [] };
            tasks.push(prioBlock);
        }
        return prioBlock;
    },

    run : function(prio, subtasks, context) {
        context = context || {};
        if (context.id && this.byId[context.id]) {
            var task = this.byId[context.id];
            task.subtasks = subtasks.slice();
            task.context = context;
            task.reset = true;
            return;
        }

        var prioBlock = this._findPrioBlock(prio);
        var task = {
            subtasks: subtasks.slice(),
            context: context
        };
        prioBlock.queue.push(task);
        if (context.id) {
            this.byId[context.id] = task;
        }

        if (this.minPrio === null || prio < this.minPrio) {
            this.minPrio = prio;
        }

        if (this.currentTask === null) {
            this.next();
        }
    },

    _nextTask : function(finished) {
        finished = (typeof finished === 'undefined') ? true : finished;
        if (finished && this.currentTask && this.currentTask.context.id) {
            delete this.byId[this.currentTask.context.id];
        }

        var tasks = this.tasks;
        var prioBlock;
        for (var i = 0, l = tasks.length; i < l; ++i) {
            if (tasks[i].queue.length > 0 || tasks[i].revQueue.length > 0) {
                prioBlock = tasks[i];
                break;
            }
        }
        if (!prioBlock) {
            this.minPrio = null;
            this.currentPrio = null;
            this.currentTask = null;
            return false;
        }

        if (prioBlock.revQueue.length == 0) {
            var q = prioBlock.queue,
                rq = prioBlock.revQueue,
                l = q.length;
            while (l--) rq.push(q.pop()); // q.reverse much slower in Firefox
        }
        this.minPrio = prioBlock.prio;
        this.currentPrio = prioBlock.prio;
        this.currentTask = prioBlock.revQueue.pop();
        return true;
    },

    next : function(func) {
        if (this.currentTask !== null && this.currentTask.reset) {
            delete func;
            delete this.currentTask.reset;
        }

        var nextFunc;
        if (this.minPrio !== null && this.currentPrio !== null &&
            this.minPrio < this.currentPrio) {
            // urgent task available
            if (typeof func !== 'undefined') {
                this.currentTask.subtasks.unshift(func);
            }
            var currentPrioBlock = this._findPrioBlock(this.currentPrio);
            currentPrioBlock.revQueue.push(this.currentTask);

            // swtich to urgent task
            this._nextTask(false);
        } else {
            nextFunc = func;
        }
        if (typeof nextFunc === 'undefined') {
            while (this.currentTask === null || this.currentTask.subtasks.length == 0) {
                if (!this._nextTask()) {
                    break;
                }
            }
            if (this.currentTask !== null) {
                nextFunc = this.currentTask.subtasks.shift();
            }
        }

        if (typeof nextFunc !== 'undefined') {
            var _this = this;
            var context = (this.currentTask && this.currentTask.context) || {};
            var args = [_this].concat(context.args || []);
            if (+new Date() - +this.lastTimeout > this.__self.lockTime) {
                setTimeout(function() {
                    _this.lastTimeout = new Date();
                    nextFunc.apply(_this, args);
                }, _this.__self.collectTime);
            } else {
                nextFunc.apply(_this, args);
            }
        }
    }

}, {

    PRIO_SYSTEM : -5,
    PRIO_DATA : 0,
    PRIO_UI : 5,

    collectTime : 10,
    lockTime : 50

});

BEM.blocks['i-task-scheduler'].instance = BEM.create('i-task-scheduler');

})();
