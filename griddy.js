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
    function is(t, v) {
        return t.toLowerCase() === typeof v;
    }

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

        /**
         * Whether wrapped movement is enabled
         * @property _wrapping
         * @private
         * @type Boolean
         * @default false
         */
        this._wrapping = false;

        this.size(rows || 1, cols || 1);
    }

    Griddy.prototype = {
        /**
         * Get or set grid size.  Empty cells are set to null.
         *
         * @method size
         * @chainable
         * @param {Number} [r] Rows
         * @param {Number} [c] Columns
         * @return {Object} (rows, cols)
         */
        size: function(r, c) {
            // getter
            if(r === undefined && c === undefined) 
                return { rows: this.rows, cols: this.cols };

            // setter(s)
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
            if(!is('number', n))   n = this.row;
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
            if(!is('number', n))   n = this.col;
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
         */
        select: function(r, c) {
            this.row = (is('number', r) ? r : this.row);
            this.col = (is('number', c) ? c : this.col);
            if(this._wrapping) {
                this._wrap();
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
         * @method _wrap
         * @private
         * @chainable
         */
        _wrap: function() {
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
         */
        move: function(d, n) {
            if(d == 'up' || d == 'down' || d == 'left' || d == 'right') {
                return this[d](n);
            }
            return this;
        },

        /**
         * Move selection up
         *
         * @method up
         * @chainable
         * @param {Number} [n] Number of steps
         */
        up: function(n) {
            if(!n || !is('number', n)) n = 1;
            var r = this.row - n;
            return this.select(r, null);
        },

        /**
         * Move selection down
         *
         * @method down
         * @chainable
         * @param {Number} [n] Number of steps
         */
        down: function(n) {
            if(!n || !is('number', n)) n = 1;
            var r = this.row + n;
            return this.select(r, null);
        },

        /**
         * Move selection left
         *
         * @method left
         * @chainable
         * @param {Number} [n] Number of steps
         */
        left: function(n) {
            if(!n || !is('number', n)) n = 1;
            var c = this.col - n;
            return this.select(null, c);
        },

        /**
         * Move selection right
         *
         * @method right
         * @chainable
         * @param {number} [n] Number of steps
         */
        right: function(n) {
            if(!n || !is('number', n)) n = 1;
            var c = this.col + n;
            return this.select(null, c);
        },

        /**
         * Wrapper for toString that returns a chainable instance
         * and allows for a custom string handler function
         *
         * @method print
         * @chainable
         * @param {Function} printer Printing function
         * @param {Object} [options] Options
         */
        print: function(printer, options) {
            if(is('function', printer)) printer(this.toString(options));
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
            if(!options || !is('object', options)) options = {};
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
