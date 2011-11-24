/** @requires BEM.DOM */

(function() {
"use strict";

var PRIO_SYSTEM = BEM.blocks['i-task-scheduler'].PRIO_SYSTEM;
var PRIO_UI = BEM.blocks['i-task-scheduler'].PRIO_UI;
var taskScheduler = BEM.blocks['i-task-scheduler'].instance;

BEM.DOM.decl('b-chart', {

    _getXAxes : function(pos) {
        var axes = this.content.xAxes || [];
        return axes.filter(function(axis) { return axis.pos == pos; });
    },

    _getYAxes : function(pos) {
        var axes = this.content.yAxes || [];
        return axes.filter(function(axis) { return axis.pos == pos; });
    },

    onSetMod : {
        'js' : function() {
            var _this = this;

            _this.dimensions = {
                width: 0,
                height: 0
            };
            _this.content = {
                xAxes: [],
                yAxes: [],
                items: [],
            };

            var initState = {
                title: false,
                xAxes: false,
                yAxes: false,
                items: false
            };

            var initCheck = function() {
                var inited = initState.title &&
                    initState.xAxes &&
                    initState.yAxes &&
                    initState.items;

                if (inited) {
                    _this.ping(false); // send last ping and disable busy timer
                    _this.inited();
                }
            }

            var initCallbacks = {
                title : function(title) {
                    initState.title = true;
                    _this.setTitle(title);
                    initCheck();
                },
                xAxes : function(xAxes) {
                    initState.xAxes = true;
                    _this.setXAxes(xAxes);
                    initCheck();
                },
                yAxes : function(yAxes) {
                    initState.yAxes = true;
                    _this.setYAxes(yAxes);
                    initCheck();
                },
                items : function(items) {
                    initState.items = true;
                    _this.setItems(items);
                    initCheck();
                },
                ping: function() {
                    _this.ping();
                    initCheck();
                }
            };

            var settingsProvider = BEM.create(
                this.params.settingsProvider.name,
                this.params.settingsProvider);

            this.ping();
            settingsProvider.get(initCallbacks);
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

    setTitle : function(title) {
        this.elem('title').text(title);
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
    },

    _destroyXAxes : function() {
        var _this = this;

        _this.content.xAxes && $.each(_this.content.xAxes, function() {
            this.domElem && this.domElem.remove();
        });
        delete _this.content.xAxes;
    },

    setXAxes : function(xAxes) {
        var _this = this;

        _this._destroyXAxes();
        _this.content.xAxes = xAxes;

        var yAxesLeftCount = _this._getYAxes('left').length;
        var yAxesRightCount = _this._getYAxes('right').length;

        function createDomElem() {
            var leftGap = "";
            for (var i = 0; i < yAxesLeftCount; ++i) {
                leftGap += BEMHTML.apply([{
                    block: 'b-chart',
                    elem: 'cell',
                    elemMods: { h: 'left', v: this.pos }
                }]);
            }
            var rightGap = "";
            for (var i = 0; i < yAxesRightCount; ++i) {
                rightGap += BEMHTML.apply([{
                    block: 'b-chart',
                    elem: 'cell',
                    elemMods: { h: 'right', v: this.pos }
                }]);
            }
            var content = BEMHTML.apply([{
                block: 'b-chart',
                elem: 'axis',
                elemMods: { pos: this.pos }
            }]);
            return $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'row',
                elemMods: { v: this.pos },
                content: leftGap + content + rightGap
            }]));
        }

        function initAxis(domElem) {
            this.block = $('.b-axis', domElem).bem('b-axis');

            this.rangeProvider = BEM.create(
                this.rangeProvider.name,
                this.rangeProvider);
            this.scale = BEM.create('b-scale__linear');

            var initialRange = this.rangeProvider.get();
            this.scale.input(initialRange.min, initialRange.max);
        }

        var xAxesTop = _this._getXAxes('top');
        $.each(xAxesTop, function() {
            var domElem = createDomElem.call(this);
            _this.elem('chart-body').prepend(domElem);
            initAxis.call(this, domElem);
        });

        var xAxesBottom = _this._getXAxes('bottom');
        $.each(xAxesBottom, function() {
            var domElem = createDomElem.call(this);
            _this.elem('chart-body').append(domElem);
            initAxis.call(this, domElem);
        });
    },

    setItems : function(items) {
        var _this = this;

        _this.content.items = items;

        function initItem() {
            // FIXME
            this.dataProvider = BEM.create(
                this.dataProvider.name,
                this.dataProvider
            );

            // FIXME
            var xAxis = _this.content.xAxes[this.xAxis || 0] || _this.content.xAxes[0];
            var yAxis = _this.content.yAxes[this.yAxis || 0] || _this.content.yAxes[0];
            this.data = this.dataProvider.get(xAxis.scale.inputMin, xAxis.scale.inputMax);
        }

        $.each(_this.content.items, initItem);
    },

    inited : function() {
        var _this = this;

        // FIXME get overlays from settingsProvider
        var _overlays = [
            'b-chart-overlay__grid',
            'b-chart-overlay__render'
        ];
        var _bemOverlays = [];
        _this.overlayTasks = [
            function(sched, ctx) {
                ctx.clearRect(0, 0, _this.dimensions.width, _this.dimensions.height);
                sched.next();
            }
        ];
        $.each(_overlays, function() {
            var bem = BEM.create(this, {
                dimensions: _this.dimensions,
                content: _this.content
            });
            _bemOverlays.push(bem);
            _this.overlayTasks.push(function(sched, ctx) {
                bem.draw(sched, ctx);
            });
        });

        _this.applySize();
        _this.bindToWin('resize', function() {
            _this.applySize();
        });
    },

    applySize : function() {
        var _this = this;

        console.log('resize');
        this.dimensions.height = 200;
        this.dimensions.width = _this.elem('viewport').width();

        this.elem('canvas').attr('width', this.dimensions.width);
        this.elem('canvas').attr('height', this.dimensions.height);
        this.elem('viewport').css('height', this.dimensions.height + 'px');

        $.each(_this.content.yAxes, function() {
            this.scale.output(0, _this.dimensions.height - 1);
            this.ticks = this.scale.ticks(5, 5);
            this.block.domElem.css('height', _this.dimensions.height + 'px');

            var ticks = [];
            for (var i = 0; i < this.ticks.length; ++i) {
                var tickValue = this.ticks[i];
                ticks.push({
                    offset: _this.dimensions.height - Math.round(this.scale.f(tickValue)) - 1,
                    label: tickValue
                });
            }
            this.block.update(ticks);
        });

        $.each(_this.content.xAxes, function() {
            this.scale.output(0, _this.dimensions.width - 1);
            this.ticks = this.scale.ticks(Math.floor(_this.dimensions.width / 50));
            this.block.domElem.css('width', _this.dimensions.width + 'px');

            var ticks = [];
            for (var i = 0; i < this.ticks.length; ++i) {
                var tickValue = this.ticks[i];
                ticks.push({
                    offset: Math.round(this.scale.f(tickValue)),
                    label: tickValue
                });
            }
            this.block.update(ticks);
        });

        this.render();
    },

    render : function() {
        var _this = this;

        var ctx = _this.elem('canvas').get(0).getContext('2d');
        taskScheduler.run(PRIO_UI, this.overlayTasks, {
            args: [ctx],
            id: _this._uniqId
        });
    }

}, {

    busyDelay : 2500

});

})();
