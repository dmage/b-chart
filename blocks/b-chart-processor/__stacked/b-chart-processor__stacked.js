/** @requires BEM */

(function() {
"use strict";

BEM.decl('b-chart-processor__stacked', {

    run : function(items) {
        var sliceName = this.params.sliceName || "y",
            xSliceName = this.params.xSliceName || "x",
            shiftSliceName = this.params.shiftSliceName || "shift",
            yslices = [], xslices = [], shifts = [],
            renderSlices = [], renderX = [], renderShifts = [];

        var interpolate = {
            linear: function(x, x0, x1, y0, y1) {
                return y0 + (y1 - y0)*(x - x0)/(x1 - x0);
            }
        };

        for (var i = 0, l = items.length; i < l; ++i) {
            var renderData = items[i].renderData;
            var ySlice = renderData[sliceName] || [];
            var xSlice = renderData[xSliceName] || [];
            var shiftSlice = renderData[shiftSliceName] || [];
            yslices.push(ySlice);
            xslices.push(xSlice);
            shifts.push(shiftSlice);
            renderSlices.push([]);
            renderShifts.push([]);
        }

        var it = [], // iterators
            c = 0, // elements in each renderSlices and renderX
            x = null;

        // Initialize iterators and search minimal X value
        for (var i = 0; i < items.length; ++i) {
            it.push(0);

            if (xslices[i].length > 0) {
                if (x === null || xslices[i][0] < x) {
                    x = xslices[i][0];
                }
            }
        }

        // Main loop
        var done = (x === null);
        while (!done) {
            var s = 0;
            for (var i = 0; i < items.length; ++i) {
                var y;

                // Get Y for current X value
                if (it[i] == xslices[i].length) {
                    // TODO, shift offsets
                    y = 0; // end of list
                } else {
                    if (xslices[i][it[i]] != x) {
                        if (it[i] != 0) {
                            y = interpolate.linear(
                                x,
                                xslices[i][it[i] - 1],
                                xslices[i][it[i]    ],
                                yslices[i][it[i] - 1],
                                yslices[i][it[i]    ]
                            );
                        } else {
                            // TODO, shift offsets
                            y = 0; // begin of list
                        }
                    } else {
                        y = yslices[i][it[i]];
                    }
                    while (it[i] != xslices[i].length && xslices[i][it[i]] == x) {
                        ++it[i];
                    }
                }

                renderSlices[i][c] = s + y;
                renderShifts[i][c] = s;
                s += y;
            }
            renderX[c] = x;
            ++c;

            // Search for next X value
            x = null;
            done = true;
            for (var i = 0, l = items.length; i < l; ++i) {
                if (it[i] == xslices[i].length) {
                    continue;
                }
                done = false;

                if (x === null || xslices[i][it[i]] < x) {
                    x = xslices[i][it[i]];
                }
            }
        }

        for (var i = 0, l = items.length; i < l; ++i) {
            var renderData = items[i].renderData;
            renderData[sliceName] = renderSlices[i];
            renderData[xSliceName] = renderX;
            renderData[shiftSliceName] = renderShifts[i];
        }
    }

});

})();
