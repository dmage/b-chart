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
                items: false
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

            _this.setOverlays(); // FIXME move to callbacks

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
                ping: function() {
                    _this.ping();
                }
            };

            var settingsProvider = BEM.create(
                this.params.settingsProvider.name,
                this.params.settingsProvider);

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

    setOverlays : function() {
        var _this = this;
        var canvas = this.elem('canvas').get(0);
        // FIXME get overlays from settingsProvider
        var _overlays = [
            'b-chart-overlay__grid',
            'b-chart-overlay__render'
        ];
        var _bemOverlays = [];
        _this.overlayTasks = [
            function(sched, ctx) {
                if ($.browser.webkit) {
                    canvas.width = canvas.width;
                } else {
                    ctx.clearRect(0, 0, _this.dimensions.width, _this.dimensions.height);
                }
                sched.next();
            }
        ];
        for (var i = 0; i < _overlays.length; ++i) {
            var bem = BEM.create(_overlays[i], {
                dimensions: _this.dimensions,
                content: _this.content
            });
            (function(bem) {
                _this.overlayTasks.push(function(sched, ctx) {
                    bem.draw(sched, ctx);
                });
            })(bem);
        }
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

        function initAxis(domElem) {
            this.block = $('.b-axis', domElem).bem('b-axis');

            this.scale = BEM.create('b-scale__linear');
            this.scale.input(-1, 1); // FIXME
            this.ticks = this.scale.ticks(5, 5);
        }

        var yAxesLeft = _this._getYAxes('left');
        $.each(yAxesLeft, function() {
            var domElem = createDomElem.call(this);
            _this.elem('row', 'v', 'middle').prepend(domElem);
            initAxis.call(this, domElem);
        });

        var yAxesRight = _this._getYAxes('right');
        $.each(yAxesRight, function() {
            var domElem = createDomElem.call(this);
            _this.elem('row', 'v', 'middle').append(domElem);
            initAxis.call(this, domElem);
        });

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
            xAxis.rangeProvider);
        xAxis.rangeProvider.on('update', function(e) {
            _this._updateXAxisRange(xAxisNo);
        });

        _this._updateXAxisRange(xAxisNo);
    },

    _updateXAxisRange : function(xAxisNo) {
        var _this = this,
            xAxis = _this.content.xAxes[xAxisNo],
            items = _this.content.items,
            range = xAxis.rangeProvider.get();

        xAxis.scale.input(range.min, range.max);
        xAxis.ticks = xAxis.scale.ticks(Math.floor(_this.dimensions.width / 50));
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
            item.ready = true;
            _this.itemReady(itemNo);
        });

        if (_this.content.xAxes) {
            _this._updateItemData(item);
            _this._requestItemData(item);
        }
    },

    _updateItemData : function(item) {
        var _this = this,
            xAxis = _this.content.xAxes[item.xAxis || 0] || _this.content.xAxes[0];

        item.data = item.dataProvider.get(xAxis.scale.inputMin, xAxis.scale.inputMax);
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

        _this._initState.items = true;
        _this._updateInit();
    },

    _renderYAxis : function(yAxisNo) {
        var _this = this,
            yAxis = this.content.yAxes[yAxisNo];

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
            xAxes = this.content.xAxes,
            yAxes = this.content.yAxes;

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

        _this.elem('canvas').attr('width', _this.dimensions.width);
        _this.elem('canvas').attr('height', _this.dimensions.height);
        _this.elem('viewport').css('height', _this.dimensions.height + 'px');

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

    render : function(delay) {
        if (this._init != -1) {
            return;
        }

        var _this = this,
            ctx = _this.elem('canvas').get(0).getContext('2d');
        taskScheduler.run(PRIO_UI, this.overlayTasks, {
            args: [ctx],
            id: _this._uniqId + ".draw",
            delay: delay,
            mask: _this._itemsMask()
        });
    },

    itemReady : function(feature) {
        if (this._init != -1) {
            return;
        }

        var _this = this,
            ctx = _this.elem('canvas').get(0).getContext('2d');
        taskScheduler.update(PRIO_UI, this.overlayTasks, {
            args: [ctx],
            id: _this._uniqId + ".draw",
            delay: _this.__self.waitNextData,
            mask: _this._itemsMask()
        }, feature);
    }

}, {

    busyDelay : 2500,
    waitFirstData: 2000,
    waitNextData: 200

});

})();
