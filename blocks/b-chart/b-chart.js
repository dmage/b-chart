/** @requires BEM.DOM */

(function() {
"use strict";

var PRIO_SYSTEM = BEM.blocks['i-task-scheduler'].PRIO_SYSTEM;
var PRIO_UI = BEM.blocks['i-task-scheduler'].PRIO_UI;
var taskScheduler = BEM.blocks['i-task-scheduler'].instance;

BEM.DOM.decl('b-chart', {

    _getYAxes : function(pos) {
        var axes = this.content.yAxes || [];
        return axes.filter(function(axis) { return axis.pos == pos; });
    },

    onSetMod : {
        'js' : function() {
            var _this = this;

            _this._initState = {
                title: false,
                xAxes: false,
                yAxes: false,
                items: false,
                overlays: false
            };
            _this._init = 0;

            _this.dimensions = {
                width: 0,
                height: 0
            };

            _this.content = {
                xAxes: [],
                yAxes: [],
                items: [],
                overlays: [],
                layers: [],
                viewport: _this.elem('viewport'),
                clippedViewport: _this.elem('clipped-viewport')
            };

            _this.applySize();
            _this.bindToWin('resize', function() {
                taskScheduler.run(PRIO_SYSTEM, [function(sched) {
                    _this.applySize();
                    sched.next();
                }], {
                    id: _this._uniqId + ".resize"
                });
            });

            var initCallbacks = {
                title : function(title) {
                    _this.setTitle(title);
                },
                xAxes : function(xAxes) {
                    _this.setXAxes(xAxes);
                },
                yAxes : function(yAxes) {
                    _this.setYAxes(yAxes);
                },
                items : function(items) {
                    _this.setItems(items);
                },
                overlays : function(overlays) {
                    _this.setOverlays(overlays);
                },
                ping: function() {
                    _this.ping();
                }
            };

            var settingsProvider = BEM.create(
                this.params.settingsProvider.name,
                this.params.settingsProvider
            );

            this.ping();
            settingsProvider.get(initCallbacks);
        }
    },

    _updateInit : function() {
        if (this._init == -1)
            return;

        var initState = this._initState;
        if (this._init == 0 && initState.title)
            this._init = 1;
        if (this._init == 1 && initState.xAxes)
            this._init = 2;
        if (this._init == 2 && initState.yAxes)
            this._init = 3;
        if (this._init == 3 && initState.items)
            this._init = 4;
        if (this._init == 4 && initState.overlays)
            this._init = -1; // -1 = finished.

        if (this._init == -1) {
            this.ping(false); // send last ping and disable busy timer
            this.applySize(true);
        }
    },

    busy : function() {
        this.$busy = $(BEMHTML.apply([{ block: 'b-busy' }]));
        this.domElem.append(this.$busy);
        BEM.DOM.init(this.$busy);
    },

    ping : function(keep) {
        var _this = this;

        clearTimeout(_this.busyTimeout);
        delete _this.busyTimeout;

        if (_this.$busy) {
            BEM.DOM.destruct(_this.$busy);
            delete _this.$busy;
        }

        if (typeof keep === 'undefined' || keep) {
            _this.busyTimeout = setTimeout(function() {
                _this.busy();
            }, _this.__self.busyDelay);
        }
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
            _this._runProcessors();
            sched.next();
        });
        for (var i = 0, l = overlays.length; i < l; ++i) {
            _this._initOverlay(overlays[i]);
        }
        _this.renderTasks.push(function(sched) {
            _this._finishRender();
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

        this._initState.title = true;
        this._updateInit();
    },

    _destroyYAxes : function() {
        var _this = this;

        _this.content.yAxes && $.each(_this.content.yAxes, function() {
            this.block && BEM.DOM.destruct(this.block.domElem);
        });

        BEM.DOM.destruct(_this.findElem('cell', 'h', 'left'));
        BEM.DOM.destruct(_this.findElem('cell', 'h', 'right'));

        delete _this.content.yAxes;
    },

    _initYAxis : function(yAxisNo, domElem) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

        yAxis.block = $('.b-axis', domElem).bem('b-axis');

        yAxis.scale = BEM.create('b-scale__linear');

        yAxis.rangeProvider = BEM.create(
            yAxis.rangeProvider.name,
            yAxis.rangeProvider
        );

        typeof yAxis.processors !== 'undefined' || (yAxis.processors = []);
        for (var i = 0, l = yAxis.processors.length; i < l; ++i) {
            var processor = yAxis.processors[i];
            processor.dimensions = _this.dimensions;
            processor.content = _this.content;
            yAxis.processors[i] = BEM.create(
                processor.name,
                processor
            );
        }
    },

    _updateYAxisRange : function(yAxisNo, range) {
        var _this = this,
            yAxis = _this.content.yAxes[yAxisNo],
            scale = yAxis.scale;

        if (range.min == scale.inputMin && range.max == scale.inputMax) {
            return;
        }

        scale.input(range.min, range.max);

        _this._renderYAxis(yAxisNo);
    },

    setYAxes : function(yAxes) {
        var _this = this;

        _this._destroyYAxes();
        _this.content.yAxes = yAxes;

        function createDomElem() {
            return $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'axis',
                elemMods: { pos: this.pos }
            }]));
        }

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo],
                domElem;

            if (yAxis.pos == 'left') {
                domElem = createDomElem.call(yAxis);
                _this.elem('row', 'v', 'middle').prepend(domElem);
            } else if (yAxis.pos =='right') {
                domElem = createDomElem.call(yAxis);
                _this.elem('row', 'v', 'middle').append(domElem);
            }

            _this._initYAxis(yAxisNo, domElem);
        }

        // FIXME add gap to X axes

        _this._initState.yAxes = true;
        _this._updateInit();
    },

    _destroyXAxes : function() {
        var _this = this;

        _this.content.xAxes && $.each(_this.content.xAxes, function() {
            this.domElem && this.domElem.remove();
        });

        // FIXME cleanup (see _destoryYAxes)

        delete _this.content.xAxes;
    },

    _initXAxis : function(xAxisNo, domElem) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        xAxis.block = $('.b-axis', domElem).bem('b-axis');

        xAxis.scale = BEM.create('b-scale__linear');

        xAxis.rangeProvider = BEM.create(
            xAxis.rangeProvider.name,
            xAxis.rangeProvider
        );
        xAxis.rangeProvider.on('update', function(e) {
            // shift canvases in new scheduler cycle (prevent flickering)
            taskScheduler.run(PRIO_SYSTEM, [function(sched) {
                _this._updateXAxisRange(xAxisNo);
                sched.next();
            }]);
        });

        _this._updateXAxisRange(xAxisNo);
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

        xAxis.scale.input(range.min, range.max);
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

        _this._renderXAxis(xAxisNo);
    },

    setXAxes : function(xAxes) {
        var _this = this;

        _this._destroyXAxes();
        _this.content.xAxes = xAxes;

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

        for (var xAxisNo = 0, l = xAxes.length; xAxisNo < l; ++xAxisNo) {
            var xAxis = xAxes[xAxisNo],
                domElem;

            if (xAxis.pos == 'top') {
                domElem = createDomElem.call(xAxis);
                _this.elem('chart-body').prepend(domElem);
            } else if (xAxis.pos == 'bottom') {
                domElem = createDomElem.call(xAxis);
                _this.elem('chart-body').append(domElem);
            }

            _this._initXAxis(xAxisNo, domElem);
        }

        _this._initState.xAxes = true;
        _this._updateInit();
    },

    _initItem : function(itemNo) {
        var _this = this,
            item = _this.content.items[itemNo];

        item.dataProvider = BEM.create(
            item.dataProvider.name,
            item.dataProvider
        );
        item.dataProvider.on('update', function(e) {
            _this._updateItem(itemNo);
        });

        item.filters || (item.filters = []);
        for (var i = 0, l = item.filters.length; i < l; ++i) {
            item.filters[i] = BEM.create(
                item.filters[i].name,
                item.filters[i]
            );
        }

        if (_this.content.xAxes) {
            _this._updateItemData(item);
            _this._requestItemData(item);
        }
    },

    _updateItem : function(itemNo) {
        var _this = this,
            item = _this.content.items[itemNo];

        _this._updateItemData(item);
        item.ready = true;
        _this.renderItem(itemNo);
    },

    _updateItemData : function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0],
            filters = item.filters;

        item.rawData = item.dataProvider.get(xAxis.scale.inputMin, xAxis.scale.inputMax);

        console.time('filter');
        var data = {};
        $.each(item.rawData, function(name, arr) {
            data[name] = arr.slice();
        });
        for (var i = 0, l = filters.length; i < l; ++i) {
            data = filters[i].run(item, data);
        }
        item.data = data;
        console.timeEnd('filter');

        item.renderData = null;

        item._rendered = false;
    },

    _requestItemData : function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0];

        item.ready = false;
        item.dataProvider.range(xAxis.scale.inputMin, xAxis.scale.inputMax);
    },

    setItems : function(items) {
        var _this = this;

        _this.content.items = items;
        for (var i = 0, l = _this.content.items.length; i < l; ++i) {
            _this._initItem(i);
        }

        if (this._initState.layers) {
            this._initLayers();
        }

        _this._initState.items = true;
        _this._updateInit();
    },

    _renderYAxis : function(yAxisNo) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

        yAxis.ticks = yAxis.scale.ticks(5, 5);

        var ticks = [];
        for (var i = 0; i < yAxis.ticks.length; ++i) {
            var tickValue = yAxis.ticks[i];
            ticks.push({
                offset: _this.dimensions.height - Math.round(yAxis.scale.f(tickValue)) - 1,
                label: tickValue
            });
        }
        yAxis.block.update(ticks);
    },

    _renderXAxis : function(xAxisNo) {
        var _this = this,
            xAxis = this.content.xAxes[xAxisNo];

        xAxis.ticks = xAxis.scale.ticks(Math.floor(_this.dimensions.width / 50));

        var ticks = [];
        for (var i = 0; i < xAxis.ticks.length; ++i) {
            var tickValue = xAxis.ticks[i];
            ticks.push({
                offset: Math.round(xAxis.scale.f(tickValue)),
                label: (""+tickValue).substr(-6) // FIXME
            });
        }
        xAxis.block.update(ticks);
    },

    applySize : function(force) {
        var _this = this,
            xAxes = _this.content.xAxes,
            yAxes = _this.content.yAxes,
            layers = _this.content.layers,
            items = _this.content.items;

        typeof force !== 'undefined' || (force = false);

        var newHeight = 200,
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

    _runProcessors : function() {
        var _this = this,
            yAxes = _this.content.yAxes,
            items = _this.content.items;

        for (var yAxisNo = 0, l = yAxes.length; yAxisNo < l; ++yAxisNo) {
            var yAxis = yAxes[yAxisNo];

            var localItems = [];
            for (var i = 0, m = items.length; i < m; ++i) {
                var item = items[i];
                if (item.yAxis != yAxisNo) continue;

                item.renderData = item.data;
                localItems.push(item);
            }

            for (var i = 0, m = yAxis.processors.length; i < m; ++i) {
                yAxis.processors[i].run(localItems);
            }

            var range = yAxis.rangeProvider.get(localItems);
            _this._updateYAxisRange(yAxisNo, range);
        }
    },

    _finishRender : function() {
        var _this = this,
            items = _this.content.items;

        for (var i = 0, l = items.length; i < l; ++i) {
            items[i]._rendered = true;
        }
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

    busyDelay : 2500,
    waitFirstData: 2000,
    waitNextData: 200

});

})();
