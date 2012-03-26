/** @requires BEM */

(function() {
"use strict";

var Canvas = require('canvas');

BEM.decl({ name: 's-chart', baseBlock: 'i-chart' }, {

    onSetMod : {
        'js' : function() {
            this.__base.apply(this, arguments);
        }
    },

    _initOverlay : function(overlay) {
        var _this = this,
            layers = _this.content.layers,
            request = overlay.layersRequest();

        var localLayers = [];
        for (var i = 0, l = request.length; i < l; ++i) {
            var layer = request[i];

            //layer.canvas = $canvas;
            //layer.ctx = layer.canvas.get(0).getContext('2d');

            localLayers.push(layer);
            layers.push(layer);
        }

        _this.renderTasks.push(function(sched) {
            overlay.draw(sched, localLayers);
        });
    },

    _initLayers : function() {
        var _this = this,
            overlays = _this.content.overlays;

        _this.renderTasks = [];
        _this.renderTasks.push(function(sched) {
            _this.beforeRender();
            sched.next();
        });
        for (var i = 0, l = overlays.length; i < l; ++i) {
            _this._initOverlay(overlays[i]);
        }
        _this.renderTasks.push(function(sched) {
            _this.afterRender();
            sched.next();
        });
    },

    applySize : function(force) {
        var _this = this,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes;

        _this.dimensions.height = 200;
        _this.dimensions.width = 600;

        if (!force) {
            return;
        }

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo];
            yAxis.scale.output(0, _this.dimensions.height - 1);
        }

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            var xAxis = xAxes[xAxisNo];
            xAxis.scale.output(0, _this.dimensions.width - 1);
        }

        _this.render();
    },

    beforeRender : function() {
        var _this = this,
            layers = _this.content.layers;

        this.__base.apply(this, arguments);

        var dim = _this.dimensions;
        _this.content.canvas = new Canvas(dim.width, dim.height);
        _this.content.ctx = _this.content.canvas.getContext('2d');

        for (var i = 0, l = layers.length; i < l; ++i) {
            layers[i].ctx = _this.content.ctx;
        }
    },

    afterRender : function() {
        var out = this.params.out,
            stream = this.content.canvas.createPNGStream();

        stream.on('data', function(chunk) {
            out.write(chunk);
        });
        stream.on('end', function(chunk) {
            out.end();
        });
    },

    render : function() {
        var _this = this,
            items = _this.content.items;

        if (this._init != -1) {
            return;
        }

        for (var i = 0, l = items.length; i < l; ++i) {
            if (!items[i].ready) {
                //console.log('item', i, 'not ready');
                return;
            }
        }

        _this.tasksQueue = this.renderTasks.slice();
        this.next();
    },

    next : function(f) {
        var _this = this;
        if (f) {
            //console.log('f', f);
            f(this);
        } else {
            var nextTask = _this.tasksQueue.shift();
            if (nextTask) {
                //console.log('next', nextTask);
                setTimeout(function() { nextTask(_this); }, 0);
            }
        }
    }

});

})();
