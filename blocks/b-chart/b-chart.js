/** @requires BEM.DOM */

(function() {
"use strict";

var PRIO_SYSTEM = BEM.blocks['i-task-scheduler'].PRIO_SYSTEM;
var PRIO_UI = BEM.blocks['i-task-scheduler'].PRIO_UI;
var taskScheduler = BEM.blocks['i-task-scheduler'].instance;

BEM.DOM.decl({ name: 'b-chart', baseBlock: 'i-chart' }, {

    onSetMod : {
        'js' : function() {
            this.$legend = $(BEMHTML.apply([{ block: 'b-legend' }]));
            this.elem('legend').append(this.$legend);
            BEM.DOM.init(this.$legend);
            this.legend = this.$legend.bem('b-legend');

            this.__base.apply(this, arguments);
        }
    },

    _getYAxes : function(pos) {
        var axes = this.content.yAxes || [];
        return axes.filter(function(axis) { return axis.pos == pos; });
    },

    initContent : function () {
        var _this = this;

        _this.content.viewport = _this.elem('viewport');
        _this.content.clippedViewport = _this.elem('clipped-viewport');
    },

    initResize : function() {
        var _this = this;

        _this.bindToWin('resize', function() {
            taskScheduler.run(PRIO_SYSTEM, [function(sched) {
                _this.applySize();
                sched.next();
            }], {
                id: _this._uniqId + ".resize"
            });
        });
    },

    busy : function() {
        this.__base.apply(this, arguments);

        this.$busy = $(BEMHTML.apply([{ block: 'b-busy' }]));
        this.domElem.append(this.$busy);
        BEM.DOM.init(this.$busy);
    },

    stopBusy : function() {
        BEM.DOM.destruct(_this.$busy);
        delete _this.$busy;

        this.__base.apply(this, arguments);
    },

    _initOverlay : function(overlay) {
        var _this = this,
            layers = _this.content.layers,
            request = overlay.layersRequest();

        var localLayers = [];
        for (var i = 0, l = request.length; i < l; ++i) {
            var layer = request[i];

            var $canvas = $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'canvas'
            }]));
            _this.elem('clipped-viewport').append($canvas);

            layer.canvas = $canvas;
            layer.ctx = layer.canvas.get(0).getContext('2d');

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

    setOverlays : function(overlays) {
        var _this = this;

        _this.content.overlays = overlays;

        for (var i = 0, l = _this.content.overlays.length; i < l; ++i) {
            var overlay = _this.content.overlays[i];
            overlay.dimensions = _this.dimensions;
            overlay.content = _this.content;
            _this.content.overlays[i] = BEM.create(
                overlay.name,
                overlay
            );
        }

        if (this._initState.items) {
            this._initLayers();
        }

        this._initState.overlays = true;
        this._updateInit();
    },

    setTitle : function(title) {
        this.elem('title').text(title);

        this.__base.apply(this, arguments);
    },

    _initYAxis : function(yAxisNo, domElem) {
        function createDomElem() {
            return $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'axis',
                elemMods: { pos: this.pos }
            }]));
        }

        var _this = this,
            yAxis = this.content.yAxes[yAxisNo],
            domElem;

        if (yAxis.pos == 'left') {
            domElem = createDomElem.call(yAxis);
            _this.elem('row', 'v', 'middle').prepend(domElem);
        } else if (yAxis.pos =='right') {
            domElem = createDomElem.call(yAxis);
            _this.elem('row', 'v', 'middle').append(domElem);
        }

        yAxis.block = $('.b-axis', domElem).bem('b-axis');

        this.__base.apply(this, arguments);
    },

    _initYAxes : function() {
        // FIXME add gap to X axes
    },

    _destroyYAxes : function() {
        var _this = this;

        _this.content.yAxes && $.each(_this.content.yAxes, function() {
            this.block && BEM.DOM.destruct(this.block.domElem);
        });

        BEM.DOM.destruct(_this.findElem('cell', 'h', 'left'));
        BEM.DOM.destruct(_this.findElem('cell', 'h', 'right'));

        this.__base.apply(this, arguments);
    },

    _initXAxis : function(xAxisNo) {
        var _this = this;

        var yAxesLeftCount = _this._getYAxes('left').length;
        var yAxesRightCount = _this._getYAxes('right').length;

        function createDomElem() {
            var content = [{
                elem: 'axis',
                elemMods: { pos: this.pos }
            }];

            for (var i = 0; i < yAxesLeftCount; ++i) {
                content.unshift({
                    elem: 'cell',
                    elemMods: { h: 'left', v: this.pos }
                });
            }

            for (var i = 0; i < yAxesRightCount; ++i) {
                content.push({
                    elem: 'cell',
                    elemMods: { h: 'right', v: this.pos }
                });
            }

            return $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'row',
                elemMods: { v: this.pos },
                content: content
            }]));
        }

        var xAxis = this.content.xAxes[xAxisNo],
            domElem;

        if (xAxis.pos == 'top') {
            domElem = createDomElem.call(xAxis);
            _this.elem('chart-body').prepend(domElem);
        } else if (xAxis.pos == 'bottom') {
            domElem = createDomElem.call(xAxis);
            _this.elem('chart-body').append(domElem);
        }

        xAxis.block = $('.b-axis', domElem).bem('b-axis');

        this.__base.apply(this, arguments);

        xAxis.rangeProvider.on('update', function(e) {
            // shift canvases in new scheduler cycle (prevent flickering)
            taskScheduler.run(PRIO_SYSTEM, [function(sched) {
                _this._updateXAxisRange(xAxisNo);
                sched.next();
            }]);
        });
    },

    _destroyXAxes : function() {
        var _this = this;

        _this.content.xAxes && $.each(_this.content.xAxes, function() {
            this.domElem && this.domElem.remove();
        });

        // FIXME cleanup (see _destoryYAxes)

        this.__base.apply(this, arguments);
    },

    _updateXAxisRange : function(xAxisNo) {
        var _this = this,
            xAxis = _this.content.xAxes[xAxisNo],
            scale = xAxis.scale,
            items = _this.content.items,
            layers = _this.content.layers,
            range = xAxis.rangeProvider.get();

        for (var i = 0, l = items.length; i < l; ++i) {
            if (items[i].xAxis != xAxisNo) continue;
            items[i]._rendered = false;
        }

        var factor = (scale.outputMax - scale.outputMin)/(scale.inputMax - scale.inputMin);
        var delta = range.min - scale.inputMin;
        for (var i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            if (layer.xAxis != xAxisNo) continue;

            // FIXME sum shifts
            // FIXME support factor update
            var offset = layer.canvas.position();
            layer.canvas.css('left', -Math.round(delta*factor) + offset.left + 'px');
        }

        this.__base.apply(this, arguments);

        for (var i = 0, l = items.length; i < l; ++i) {
            if (items[i].xAxis != xAxisNo) continue;
            _this._updateItemData(items[i]);
        }
        if (_this._init == -1) {
            _this.render(_this.__self.waitFirstData);
        }
        for (var i = 0, l = items.length; i < l; ++i) {
            if (items[i].xAxis != xAxisNo) continue;
            _this._requestItemData(items[i]);
        }
    },

    setItems : function(items) {
        this.__base.apply(this, arguments);

        this.legend.setItems(items);
    },

    _updateItemData : function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0],
            filters = item.filters;

        this.__base.apply(this, arguments);

        item._rendered = false;
    },

    _renderYAxis : function(yAxisNo) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

        var ticks = this.__base.apply(this, arguments);
        yAxis.block.update(ticks);
    },

    _renderXAxis : function(xAxisNo) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        var ticks = this.__base.apply(this, arguments);
        xAxis.block.update(ticks);
    },

    applySize : function(force) {
        var _this = this,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes,
            layers = _this.content.layers,
            items = _this.content.items;

        typeof force !== 'undefined' || (force = false);

        var newHeight = _this.params.height || 200,
            newWidth = _this.elem('viewport').width();
        if (_this.dimensions.height == newHeight &&
            _this.dimensions.width == newWidth)
        {
            if (force) {
                _this.render();
            }
            return; // nothing changed
        }
        _this.dimensions.height = newHeight;
        _this.dimensions.width = newWidth;

        _this.elem('viewport').css('height', _this.dimensions.height + 'px');
        for (var i = 0, l = layers.length; i < l; ++i) {
            var layer = layers[i];
            layer.canvas.attr('width', _this.dimensions.width);
            layer.canvas.attr('height', _this.dimensions.height);
        }

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo];
            yAxis.scale.output(0, _this.dimensions.height - 1);
            yAxis.block.domElem.css('height', _this.dimensions.height + 'px');
            _this._renderYAxis(yAxisNo);
        }

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            var xAxis = xAxes[xAxisNo];
            xAxis.scale.output(0, _this.dimensions.width - 1);
            xAxis.block.domElem.css('width', _this.dimensions.width + 'px');
            _this._renderXAxis(xAxisNo);
        }

        for (var i = 0, l = items.length; i < l; ++i) {
            var item = items[i];
            item._rendered = false;
        }

        _this.render();
    },

    _itemsMask : function() {
        var _this = this,
            items = _this.content.items,
            mask = new Array(items.length);
        for (var i = 0, l = items.length; i < l; ++i) {
            mask[i] = items[i].ready;
        }
        return mask;
    },

    afterRender : function() {
        var _this = this,
            items = _this.content.items;

        for (var i = 0, l = items.length; i < l; ++i) {
            items[i]._rendered = true;
        }

        this.__base.apply(this, arguments);
    },

    render : function(delay) {
        if (this._init != -1) {
            return;
        }

        taskScheduler.run(PRIO_UI, this.renderTasks, {
            id: this._uniqId + ".draw",
            delay: delay,
            mask: this._itemsMask()
        });
    },

    renderItem : function(itemNo) {
        if (this._init != -1) {
            return;
        }

        taskScheduler.update(PRIO_UI, this.renderTasks, {
            id: this._uniqId + ".draw",
            delay: this.__self.waitNextData,
            mask: this._itemsMask()
        }, itemNo);
    }

}, {

    waitFirstData: 2000,
    waitNextData: 200

});

})();
