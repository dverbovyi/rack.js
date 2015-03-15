/**
 * User: Dmytro
 * Date: 14.03.15
 * Time: 20:57
 */

(function (root, factory) {
    root.Rack = factory(root, {});
})(this, function (root, Rack) {
    Rack.VERSION = '0.1';

    /**
     *
     * @param protoProps - {Object}
     * @returns {Function}
     */
    var extend = function (protoProps) {
        var parent = this,
            child = function () {
                return parent.apply(this, arguments);
            },
            Surrogate = function () {
                this.constructor = child;
            };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();
        if (protoProps)
            Helpers.extend(child, protoProps);

        child.__super__ = parent.prototype;
        child.extend = extend;
        return child;
    };

    // Rack.Helpers
    //----------------
    var Helpers = Rack.Helpers = function () {
        throw new Error("The instance shouldn\'t be created");
    };

    /**
     *
     * @param Child - {Function}
     * @param Parent - {Function|Object}
     */
    Helpers.extend = function (Child, Parent) {
        if (Helpers.getType(Parent) == 'Function') {
            Child.prototype = new Parent();
            Child.constructor = Child;
        } else {
            for (var key in Parent) {
                Child.prototype[key] = Parent[key];
            }
        }
    };

    /**
     * @method clone - clone passes object
     * @param obj - {Object}
     * @return {Object}
     *
     */
    Helpers.clone = function (obj) {
        if (obj == null || typeof(obj) != 'object')
            return obj;

        var temp = {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                temp[key] = obj[key];
            }
        }
        return temp;
    };
    /**
     *
     * @param object - type {*}
     * @returns {string}
     */
    Helpers.getType = function (object) {
        var stringConstructor = "".constructor,
            arrayConstructor = [].constructor,
            objectConstructor = {}.constructor,
            typeString = "unknown";

        if (object === null) {
            typeString = "null";
        } else if (object === undefined) {
            typeString = "undefined";
        }
        else if (object.constructor === stringConstructor) {
            typeString = "String";
        }
        else if (object.constructor === arrayConstructor) {
            typeString = "Array";
        }
        else if (object.constructor === objectConstructor) {
            typeString = "Object";
        } else if (typeof object === 'function') {
            typeString = "Function";
        }
        return typeString;
    };
    //-------------------------

    //Rack.Model
    //----------
    var Model = Rack.Model = function (attributes, options) {
        this.attributes = attributes || {};
        this.prevAttributes = {};
        this.options = options || {};
        this.changed = true;
        this.listenersObj = {};
        this.set(this.attributes);
    };

    Helpers.extend(Model, {

        /**
         * @method set - set property as model attributes
         *
         * @param key - {String|JSON}
         * @param val - {*}
         */
        set: function (key, val) {
            var keyType = Helpers.getType(key);
            if (keyType === 'Object') {
                for (var index in key) {
                    this.attributes[index] = key[index];
                }
            } else if (keyType === 'Array') {
                throw new Error('Incorrect input parameters');
            } else {
                this.attributes[key] = val;
            }
            this.changed = !(JSON.stringify(this.prevAttributes) === JSON.stringify(this.attributes));
            if (this.changed) {
                this.trigger('change', key);
                this.prevAttributes = Helpers.clone(this.attributes);
            }
        },

        /**
         * @method unset - delete property(ies) and listeners from model's attributes
         *
         * @param prop - {String|Array}
         *
         */
        unset: function (prop) {
            var propType = Helpers.getType(prop);
            if (propType === 'Array') {
                prop.forEach(function (val) {
                    if (this.attributes[val]) {
                        this.unwatch(val);
                        delete this.attributes[val];
                    }
                }.bind(this));
            } else if (propType === 'Object') {
                throw new Error('Incorrect input parameters');
            } else {
                if (this.attributes[prop]) {
                    this.unwatch(prop);
                    delete this.attributes[prop];
                }
            }

        },

        /**
         * @method watch - initialize handler for watched property
         * @param prop - {String|Array}
         * @param callback - {Function}
         * @param context - {Object}
         */
        watch: function (prop, callback, context) {
            var ctx = context || this,
                type = Helpers.getType(prop);
            if (type === 'Array') {
                prop.forEach(function (val) {
                    this.listenersObj[val] = callback.bind(ctx);
                }.bind(this));
            } else if (type === 'unknown' || type === 'Object') {
                throw new Error('Incorrect input parameters');
            } else {
                this.listenersObj[prop] = callback.bind(ctx);
            }
        },
        /**
         * @method unwatch - delete watching property
         * @param prop - {String}
         *
         */
        unwatch: function (prop) {
            var propType = Helpers.getType(prop);
            if (propType === 'Array') {
                prop.forEach(function (val) {
                    if (this.listenersObj[val])
                        delete this.listenersObj[val];
                }.bind(this));
            } else if (propType === 'Object') {
                throw new Error('Incorrect input parameters');
            } else {
                if (this.listenersObj[prop]) {
                    delete this.listenersObj[prop];
                }
            }
        },

        /**
         * @method get - get property's value
         *
         * @param key - {String}
         * @returns {*}
         */
        get: function (key) {
            return this.attributes[key];
        },

        /**
         * @property toJSON - get model's attribute in JSON format
         * @returns {Object}
         */
        toJSON: function () {
            return Helpers.clone(this.attributes);
        },

        /**
         * @method trigger - call appropriate handler
         *
         * @param event - event type, {String}
         * @param watchKey - {String}
         */
        trigger: function (event, watchKey) {
            if (event == 'change') {
                if (Helpers.getType(watchKey) === 'Object') {
                    for (var index in watchKey) {
                        if (watchKey.hasOwnProperty(index) && this.listenersObj[index]) {
                            this.listenersObj[index]({
                                key: index,
                                value: this.get(index)
                            });
                        }
                    }
                } else {
                    if (this.listenersObj[watchKey]) {
                        alert(true);
                        this.listenersObj[watchKey]({
                            key: watchKey,
                            value: this.get(watchKey)
                        });
                    }
                }
                if (this.listenersObj['model']) {
                    this.listenersObj['model']({
                        key: 'model',
                        value: this.toJSON()
                    });
                }
            }
        },

        /**
         *  @method clear - clear model data
         */
        clear: function () {
            this.attributes = {};
            this.prevAttributes = {};
            this.listenersObj = {};
        }
    });
    //-----------------------------
    Model.extend = extend;

    return Rack;
});