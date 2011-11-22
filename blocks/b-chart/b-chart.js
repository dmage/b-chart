/** @requires BEM.DOM */

(function() {

BEM.DOM.decl('b-chart', {

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
                items: []
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
            this.domElem && this.domElem.remove();
        });
        delete _this.content.yAxes;
    },

    setYAxes : function(yAxes) {
        var _this = this;

        _this._destroyYAxes();
        _this.content.yAxes = yAxes;

        function createAxis() {
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

        var yAxesLeft = yAxes.filter(function(axis) { return axis.pos == 'left'; });
        $.each(yAxesLeft, function() {
            var domElem = createAxis.call(this);
            _this.elem('row-middle').prepend(domElem);
            initAxis.call(this, domElem);
        });

        var yAxesRight = yAxes.filter(function(axis) { return axis.pos == 'right'; });
        $.each(yAxesRight, function() {
            var domElem = createAxis.call(this);
            _this.elem('row-middle').append(domElem);
            initAxis.call(this, domElem);
        });
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

        function initAxis() {
            // FIXME add this.domElem = ...
            this.scale = BEM.create('b-scale__linear');
            this.scale.input(0, 10); // FIXME
        }

        var xAxesBottom = xAxes.filter(function(axis) { return axis.pos == 'bottom'; });
        $.each(xAxesBottom, function() {
            initAxis.call(this);
            // FIXME domElem
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

        _this.applySize();
        _this.bindToWin('resize', function() {
            _this.applySize();
        });
    },

    applySize : function() {
        var _this = this;

        this.dimensions.height = 200;
        this.dimensions.width = _this.elem('viewport').width();

        this.elem('canvas').attr('width', this.dimensions.width);
        this.elem('canvas').attr('height', this.dimensions.height);
        this.elem('viewport').css('height', this.dimensions.height + 'px');

        $.each(_this.content.yAxes, function() {
            this.scale.output(0, _this.dimensions.height - 1);
            this.ticks = this.scale.ticks(5, 5);
            // FIXME render ticks
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
        });

        this.render();
    },

    render : function() {
        var ctx = this.elem('canvas').get(0).getContext('2d');
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(0, 0, this.dimensions.width, this.dimensions.height);
        //renderChain.run(overlays, 'draw', ctx);

        var grid = BEM.create('b-chart-overlay__grid', {
            dimensions: this.dimensions,
            content: this.content
        });
        grid.draw(ctx);

        var render = BEM.create('b-chart-overlay__render', {
            dimensions: this.dimensions,
            content: this.content
        });
        render.draw(ctx);
    }

}, {

    busyDelay : 2500

});

})();
