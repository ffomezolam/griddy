/**
 * Exports the Griddy class
 *
 * @module griddy
 */
(function(name, context, definition) {
    if(typeof module !== 'undefined' && module.exports) module.exports = definition();
    else if(typeof define === 'function' && define.amd) define(definition);
    else context[name] = definition();
})('griddy', this, function() {
    function strrep(s, n) {
        var o = '';
        if(n < 1) return o;
        for(var i = 0; i < n; i++) o += s;
        return o;
    }

    /**
     * Represents a two-dimensional grid
     *
     * @class Griddy
     * @constructor
     * @param {number} [rows] Number of rows
     * @param {number} [cols] Number of columns
     */
    function Griddy(rows, cols) {
        this.data = [];

        /**
         * Number of rows
         * 
         * @property rows
         * @type Number
         * @default 0
         */
        this.rows = 0;

        /**
         * Number of columns
         *
         * @property cols
         * @type Number
         * @default 0
         */
        this.cols = 0;

        /**
         * Row number
         *
         * @property row
         * @type Number
         * @default 0
         */
        this.row = 0;

        /**
         * Column number
         * @property col
         * @type Number
         * @default 0
         */
        this.col = 0;

        this.setSize(rows || 1, cols || 1);
    }

    Griddy.prototype = {
        /**
         * Sets the grid size.  Empty cells are set to null.
         *
         * @method setSize
         * @chainable
         * @param {number} r Rows
         * @param {number} c Columns
         */
        setSize: function(r, c) {
            if(r == this.rows && c == this.cols) return this;

            if(r < this.rows) {
                this.data = this.data.slice(r, this.rows);
            } else if(r > this.rows) {
                for(var rn = this.rows; rn < r; rn++) {
                    this.data.push([]);
                    for(var cn = 0; cn < this.cols; cn++) {
                        this.data[rn].push(null);
                    }
                }
            }

            this.rows = r;

            if(c < this.cols) {
                for(var rn = 0; rn < r; rn++) this.data[rn] = this.data[rn].slice(c, this.cols);
            } else if(c > this.cols) {
                for(var rn = 0; rn < this.rows; rn++) {
                    for(var cn = this.cols; cn < c; cn++) {
                        this.data[rn].push(null);
                    }
                }
            }

            this.cols = c;

            return this;
        },

        /**
         * Gets the grid size
         *
         * @method getSize
         * @return {object} (rows, cols)
         */
        getSize: function() {
            return { rows: this.rows, cols: this.cols };
        },

        /**
         * Get data at selected cell
         *
         * @method get
         * @param {number} [r] - Row
         * @param {number} [c] - Column
         * @return {any} Cell data
         */
        get: function(r, c) {
            this.select(r, c);
            return this.data[this.row][this.col];
        },

        /**
         * Get row of cells
         *
         * @method getRow
         * @param {Number} [n] Row number
         * @param {Function} [f] Filter function
         * @return {Array} Row cells
         */
        getRow: function(n, f) {
            if(typeof n !== 'number')   n = this.row;
            if(n < 0)                   n = 0;
            else if(n >= this.rows)     n = this.rows - 1;
            if(!f) f = function() { return true; }
            var a = [];
            var l = this.current();
            for(var c = 0; c < this.cols; c++) {
                var d = this.get(n, c);
                if(f(d)) a.push(d);
            }
            this.select(l.row, l.col);
            return a;
        },

        /**
         * Get column of cells
         *
         * @method getCol
         * @param {Number} [n] Column number
         * @param {Function} [f] Filter function
         * @return {Array} Column cells
         */
        getCol: function(n, f) {
            if(typeof n !== 'number')   n = this.col;
            if(n < 0)                   n = 0;
            else if(n >= this.cols)     n = this.cols - 1;
            if(!f) f = function() { return true; }
            var a = [];
            var l = this.current();
            for(var r = 0; r < this.rows; r++) {
                var d = this.get(r, n);
                if(f(d)) a.push(d);
            }
            this.select(l.row, l.col);
            return a;
        },

        /**
         * Set data at selected cell
         *
         * @method set
         * @chainable
         * @param {any} d - Data
         * @param {Number} [r] - Row
         * @param {Number} [c] - Column
         */
        set: function(d, r, c) {
            this.select(r, c);
            var cr = this.row;
            var cc = this.col;
            var cd = this.data[cr][cc];
            this.data[cr][cc] = d;
            return this;
        },

        /**
         * Tests for empty cell
         *
         * @method isEmpty
         * @param {Number} [r] - Row
         * @param {Number} [c] - Column
         * @return {Boolean} Whether cell is empty
         */
        isEmpty: function(r, c) {
            var or = this.row;
            var oc = this.col;
            var s = this.get(r, c);
            this.select(or, oc);
            if(s === undefined) return undefined;
            if(s === null) return true;
            return false;
        },

        /**
         * Get row and column numbers as object
         *
         * @method current
         * @return {Object} row, column
         */
        current: function() {
            return { row: this.row, col: this.col };
        },

        /**
         * Select a cell for next access
         *
         * @method select
         * @chainable
         * @param {Number} r Row
         * @param {Number} c Column
         * @param {Boolean} [w] Wrap
         */
        select: function(r, c, w) {
            this.row = (typeof r === 'number' ? r : this.row);
            this.col = (typeof c === 'number' ? c : this.col);
            if(w) {
                this.wrap();
            } else {
                if(this.row >= this.rows) this.row = this.rows - 1;
                if(this.row < 0) this.row = 0;
                if(this.col >= this.cols) this.col = this.cols - 1;
                if(this.col < 0) this.col = 0;
            }
            return this;
        },

        /**
         * Tests to see if passed cell is currently selected
         *
         * @method selected
         * @param {Number} r Row
         * @param {Number} c Column
         * @return {Boolean} Whether row is selected
         */
        selected: function(r, c) {
            if(r == this.row && c == this.col) return true;
            return false;
        },

        /**
         * Wrap selected index to available cell
         *
         * @method wrap
         * @private
         * @chainable
         */
        wrap: function() {
            var r = this.row;
            var c = this.col;

            while(r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
                if(c < 0) {
                    c = this.cols + c;
                    r > 0 ? r-- : r = this.rows - 1;
                } else if(c >= this.cols) {
                    c = c - this.cols;
                    r < this.rows - 1 ? r++ : r = 0;
                }

                if(r < 0) {
                    r = this.rows + r;
                    c > 0 ? c-- : c = this.cols - 1;
                } else if(r >= this.rows) {
                    r = r - this.rows;
                    c < this.cols - 1 ? c++ : c = 0;
                }
            }

            return this.select(r, c);
        },

        /**
         * Move selection
         *
         * @method move
         * @chainable
         * @param {String} d Direction (up, down, left, right)
         * @param {Number} [n] Number of steps
         * @param {Boolean} [w] Whether to wrap traversal
         */
        move: function(d, n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            if(d == 'up' || d == 'down' || d == 'left' || d == 'right') {
                return this[d](n, w);
            }
            return this;
        },

        /**
         * Move selection up
         *
         * @method up
         * @chainable
         * @param {Number} [n] Number of steps
         * @param {Boolean} [w] Wrap traversal
         */
        up: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var r = this.row - n;
            return this.select(r, null, w);
        },

        /**
         * Move selection down
         *
         * @method down
         * @chainable
         * @param {Number} [n] Number of steps
         * @param {Boolean} [w] Wrap traversal
         */
        down: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var r = this.row + n;
            return this.select(r, null, w);
        },

        /**
         * Move selection left
         *
         * @method left
         * @chainable
         * @param {Number} [n] Number of steps
         * @param {Boolean} [w] Wrap traversal
         */
        left: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var c = this.col - n;
            return this.select(null, c, w);
        },

        /**
         * Move selection right
         *
         * @method right
         * @chainable
         * @param {number} [n] Number of steps
         * @param {boolean} [w] Wrap traversal
         */
        right: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var c = this.col + n;
            return this.select(null, c, w);
        },

        /**
         * Wrapper for toString that returns a chainable instance
         * and allows for a custom string handler function
         *
         * @method print
         * @chainable
         * @param {Object} options Options
         */
        print: function(options) {
            var to = options.to || function(s) {};
            if(typeof to === 'string' && to == 'console') {
                to = function(s) { console.log(s); };
            }

            to(this.toString(options));
            return this;
        },

        /**
         * Print out grid as string
         *
         * @method toString
         * @param {Object} options Options
         * @return {String} Grid as a string
         */
        toString: function(options) {
            if(!options || typeof options !== 'object') options = {};
            var s = '';

            var content = options.content || 'x';
            var empty = options.empty || '-';
            var selWrapper = (options.selWrapper || '[]').split('', 2);
            var separator = strrep(options.separator || ' ', content.length);

            for(var rn = 0; rn < this.rows; rn++) {
                for(var cn = 0; cn < this.cols; cn++) {
                    var sep = separator
                    var e = this.isEmpty(rn, cn) ? empty : content;
                    if(this.selected(rn, cn)) {
                        e = selWrapper[0] + e + selWrapper[1];
                        sep = '';
                    }
                    s += sep + e + sep;
                }
                s += "\n";
            }

            return s;
        }
    };

    return Griddy;
});
