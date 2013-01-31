/**
 * Exports the Griddy class
 *
 * @module griddy
 */
(function(name, context, definition) {
    if(typeof module !== 'undefined' && module.exports) module.exports = definition(require('historian'));
    else if(typeof define === 'function' && define.amd) define(['historian'], definition);
    else context[name] = definition(context['historian']);
})('griddy', this, function(H) {
    function strrep(s, n) {
        var o = '';
        if(n < 1) return o;
        for(var i = 0; i < n; i++) {
            o += s;
        }
        return o;
    }

    /**
     * Represents a two-dimensional grid
     *
     * @class Griddy
     * @constructor
     * @param {number} [rows] - Number of rows
     * @param {number} [cols] - Number of columns
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

        this.history = H ? new H(this) : null;
        this.setSize(rows || 1, cols || 1);
    }

    Griddy.prototype = {
        /**
         * Sets the grid size.  Empty cells are set to null.
         *
         * @method setSize
         * @chainable
         * @param {number} r - Rows
         * @param {number} c - Columns
         * @return {Griddy} Griddy instance
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
         * @return {anything} Cell data
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
         * Set data at selected cell. Undoable.
         *
         * @method set
         * @chainable
         * @param {anything} d - Data
         * @param {number} [r] - Row
         * @param {number} [c] - Column
         * @return {Griddy} Griddy instance
         */
        set: function(d, r, c) {
            this.select(r, c);
            var cr = this.row;
            var cc = this.col;
            var cd = this.data[cr][cc];
            if(this.history) this.history.register(this.set, [cd, cr, cc]);
            this.data[cr][cc] = d;
            return this;
        },

        /**
         * Tests for empty cell
         *
         * @method isEmpty
         * @param {number} [r] - Row
         * @param {number} [c] - Column
         * @return {boolean} Whether cell is empty
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
         * Select a cell for next access. Undoable.
         *
         * @method select
         * @chainable
         * @param {number} r - Row
         * @param {number} c - Column
         * @param {boolean} [w] - Wrap
         * @return {Griddy} Griddy instance
         */
        select: function(r, c, w) {
            if(this.history) this.history.register(this.select, [this.row, this.col]);
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
         * @param {Number} r - Row
         * @param {Number} c - Column
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
         * @return {Griddy} Griddy instance
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
         * Move selection. Undoable.
         *
         * @method move
         * @chainable
         * @param {string} d - Direction (up, down, left, right)
         * @param {number} [n] - Number of steps
         * @param {boolean} [w] - Whether to wrap traversal
         * @return {Griddy} Griddy instance
         */
        move: function(d, n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            if(d == 'up' || d == 'down' || d == 'left' || d == 'right') {
                return this[d](n, w);
            }
            return this;
        },

        /**
         * Move selection up. Undoable.
         *
         * @method up
         * @chainable
         * @param {number} [n] - Number of steps
         * @param {boolean} [w] - Wrap traversal
         * @return {Griddy} Griddy instance
         */
        up: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var r = this.row - n;
            return this.select(r, null, w);
        },

        /**
         * Move selection down. Undoable.
         *
         * @method down
         * @chainable
         * @param {number} [n] - Number of steps
         * @param {boolean} [w] - Wrap traversal
         * @return {Griddy} Griddy instance
         */
        down: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var r = this.row + n;
            return this.select(r, null, w);
        },

        /**
         * Move selection left. Undoable.
         *
         * @method left
         * @chainable
         * @param {number} [n] - Number of steps
         * @param {boolean} [w] - Wrap traversal
         * @return {Griddy} Griddy instance
         */
        left: function(n, w) {
            if(typeof n !== 'number') { w = Boolean(n); n = 1; }
            var c = this.col - n;
            return this.select(null, c, w);
        },

        /**
         * Move selection right. Undoable.
         *
         * @method right
         * @chainable
         * @param {number} [n] - Number of steps
         * @param {boolean} [w] - Wrap traversal
         * @return {Griddy} Griddy instance
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
         * @param {Object} options Options
         * @return {Griddy} Griddy instance
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
