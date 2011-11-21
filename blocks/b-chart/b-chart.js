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
                yAxes: []
            };

            var initState = {
                title: false,
                yAxes: false,
                items: false
            };

            var initCheck = function() {
                var inited = initState.title && initState.yAxes && initState.items;
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
                yAxes : function(yAxes) {
                    initState.yAxes = true;
                    _this.setYAxes(yAxes);
                    initCheck();
                },
                items : function(items) {
                    initState.items = true;
                    _this.setItems();
                    initCheck();
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

    destroyYAxes : function() {
        var _this = this;

        _this.content.yAxes && $.each(_this.content.yAxes, function() {
            this.domElem && this.domElem.remove();
        });
        delete _this.content.yAxes;
    },

    setYAxes : function(yAxes) {
        var _this = this;

        _this.destroyYAxes();
        _this.content.yAxes = yAxes;

        function initAxis() {
            this.domElem = $(BEMHTML.apply([{
                block: 'b-chart',
                elem: 'axis',
                elemMods: { pos: this.pos },
                content: this.content
            }]));
            this.scale = BEM.create('b-scale__linear');
            this.scale.input(0, 1); // FIXME
        }

        var yAxesLeft = yAxes.filter(function(axis) { return axis.pos == 'left'; });
        $.each(yAxesLeft, function() {
            initAxis.call(this);
            this.domElem.prependTo(_this.elem('row-middle'));
        });

        var yAxesRight = yAxes.filter(function(axis) { return axis.pos == 'right'; });
        $.each(yAxesRight, function() {
            initAxis.call(this);
            this.domElem.appendTo(_this.elem('row-middle'));
        });

        // FIXME
        _this.setXAxes([
            {
                scale: 'b-scale__linear',
                rangeProvider: {
                    name: 'b-chart__static-range-provider',
                    min: 0,
                    max: 6
                }
            }
        ]);
    },

    setXAxes : function(xAxes) {
        // FIXME: compare with setYAxes; improve xAxes

        var _this = this;

        _this.content.xAxes = xAxes;

        var xAxis = xAxes[0];
        xAxis.scale = BEM.create('b-scale__linear');
        xAxis.scale.input(0, 1); // FIXME
    },

    setItems : function(items) {
        // ...
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

        $.each(_this.content.yAxes, function() {
            this.scale.output(0, _this.dimensions.height - 1);
            this.ticks = this.scale.ticks(5, 5);
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
    }

}, {

    busyDelay : 2500

});

})();
