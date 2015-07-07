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
     * @param {Object } protoProps
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
     * @param {Function} Child
     * @param {Function|Object} Parent
     */
    Helpers.extend = function (Child, Parent) {
        var type = this.getType(Parent);
        if (type == 'Function') {
            var Surrogate = function () {
                this.constructor = Child;
            };
            Surrogate.prototype = Parent.prototype;
            Child.prototype = new Parent();
            Child.__super__ = Parent.prototype;
        } else if (type == 'Object') {
            for (var key in Parent) {
                if (Parent.hasOwnProperty(key))
                    Child.prototype[key] = Parent[key];
            }
            Child.constructor = Child;
            Child.__super__ = Parent;
        }
    };

    /**
     * @method clone - clone passes object
     * @param {Object} obj
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
     * @param {*} object
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

    /**
     *
     * @param {Array} array
     * @returns {Array}
     */
    Helpers.uniqueArray = function (array) {
        if (this.getType(array) != 'Array')
            throw new Error(array + ' isn\'t Array');
        var u = {}, a = [];
        for (var i = 0, l = array.length; i < l; ++i) {
            if (!u[array[i]]) {
                a.push(array[i]);
                u[array[i]] = 1;
            }
        }
        return a;
    };

    /**
     *
     * @param {Function} callback
     * @param {Object} context
     */
    Helpers.defer = function (callback, context) {
        setTimeout(callback.bind(context), 0);
    };

    /**
     *
     * @param {String} selector
     * return {Object} DOM element
     */
    Helpers.getEl = function (selector) {
        var type = selector[0], el;
        if (selector.indexOf(' ') + 1)
            el = document.querySelectorAll(selector);
        else if (type == '#')
            el = document.getElementById(selector.substring(1, selector.length));
        else if (type == '.')
            el = document.getElementsByClassName(selector.substring(1, selector.length));
        else
            el = document.getElementsByTagName(selector);
        return el;
    };
    //-------------------------

    // Rack.Service
    //----------------
    var Service = Rack.Service = function () {
        throw new Error("The instance shouldn\'t be created");
    };

    /**
     *
     * @param {String} url
     * @param {*} data
     * @param {String} method
     * @param {Function} resolve
     * @param {Function} reject
     * @param {Boolean} async
     */
    Service.sendRequest = function (url, data, method, resolve, reject, async) {
        var asyncReq = async || true;
        var xhr = (function () {
            var xmlhttp;
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlhttp = false;
                }
            }
            if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
                xmlhttp = new XMLHttpRequest();
            }
            return xmlhttp;
        })();

        xhr.open(method, url, asyncReq);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr);
                }
            }
        };
        xhr.send(data);
    };

    /**
     *
     * @param {String} url
     * @param {Boolean} async
     * @returns {Promise}
     */
    Service.get = function (url, async) {
        return new Promise(function (resolve, reject) {
            this.sendRequest(url, null, 'GET', resolve, reject, async);
        }.bind(this));
    };

    /**
     *
     * @param {String} url
     * @param {JSON} data
     * @param {Boolean} async
     * @returns {Promise}
     */
    Service.post = function (url, data, async) {
        return new Promise(function (resolve, reject) {
            this.sendRequest(url, data, 'POST', resolve, reject, async);
        }.bind(this));
    };
    //-----------------------

    //Rack.Model
    //----------
    var Model = Rack.Model = function (attributes) {
        this.attributes = attributes || {};
        this.prevAttributes = {};
        this.listenersObj = {};
        var defaults = this.defaults;
        if (defaults) this.set(defaults);
        this.set(this.attributes);
        this.initialize.apply(this, arguments);
    };

    Helpers.extend(Model, {

        /**
         * abstract @method initialize
         * initialization logic
         */
        initialize: function () {
        },

        /**
         * @method set - set property as model attributes
         *
         * @param {String|JSON} key
         * @param {*} val
         */
        set: function (key, val) {
            var keyType = Helpers.getType(key), _changed = false;
            if (keyType === 'Object') {
                for (var index in key) {
                    if (key.hasOwnProperty(index)) {
                        this.attributes[index] = key[index];
                        if (this.prevAttributes[index] != this.attributes[index]) {
                            _changed = true;
                            this.trigger('change', index);
                        }
                    }
                }
            } else if (keyType === 'Array') {
                throw new Error('Incorrect input parameters');
            } else {
                this.attributes[key] = val;
                if (this.prevAttributes[key] != this.attributes[key]) {
                    _changed = true;
                    this.trigger('change', key);
                }
            }
            if (_changed) {
                this.prevAttributes = Helpers.clone(this.attributes);
            }
        },

        /**
         * @method unset - delete property(ies) and listeners from model's attributes
         *
         * @param {String|Array} prop
         *
         */
        unset: function (prop) {
            var propType = Helpers.getType(prop);
            if (propType === 'Array') {
                prop.forEach(function (val) {
                    if (this.attributes[val]) {
                        this.unwatch(val);
                        this.attributes[val] = null;
                    }
                }.bind(this));
            } else if (propType === 'Object') {
                throw new Error('Incorrect input parameters');
            } else {
                if (this.attributes[prop]) {
                    this.unwatch(prop);
                    this.attributes[prop] = null;
                }
            }

        },

        /**
         * @method watch - initialize handler for watched property
         *
         * @param {String|Array} prop
         * @param {Function} callback
         * @param {Object} context
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
         *
         * @param {String} prop
         */
        unwatch: function (prop) {
            var propType = Helpers.getType(prop);
            if (propType === 'Array') {
                prop.forEach(function (val) {
                    if (this.listenersObj[val])
                        this.listenersObj[val] = null;
                }.bind(this));
            } else if (propType === 'Object') {
                throw new Error('Incorrect input parameters');
            } else {
                if (this.listenersObj[prop]) {
                    this.listenersObj[prop] = null;
                }
            }
        },

        /**
         * @method get - get property's value
         *
         * @param {String} key
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
         * @param {String} event - event type
         * @param {String} watchKey
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

    //Rack.View
    //----------
    var View = Rack.View = function (attributes) {
        this.attributes = attributes || {};
        this.eventsMap = [];
        this.setAttributes();
        this.initialize.apply(this, arguments);
        this.render();
    };

    Helpers.extend(View, {
        model: null,
        helpers: {},
        templateId: '',
        path: '',
        container: 'body',
        tagName: 'div',
        id: '',
        className: '',
        events: {},

        /**
         *
         * @param {Boolean} unset
         */
        setAttributes: function (unset) {
            if (Object.keys(this.attributes).length)
                for (var key in this.attributes) {
                    if (this.attributes.hasOwnProperty(key))
                        this[key] = unset ? null : this.attributes[key];
                }
            if (unset) this.attributes = {};
        },
        undelegateEvents: function () {
            if (!this.eventsMap.length) return;
            this.eventsMap.forEach(function (val) {
                val.el.removeEventListener(val.type, val.handler, false);
            });
            this.eventsMap = [];
        },
        getContainerEl: function () {
            if (!this.parentEl) {
                var parentEl = Helpers.getEl(this.container);
                this.parentEl = Helpers.getType(Array.prototype.slice.call(parentEl)) === 'Array' ? parentEl[0] : parentEl;
            }
            return this.parentEl;
        },

        /**
         *
         * @param {Boolean} calledFromRender
         * @returns {View}
         */
        remove: function (calledFromRender) {
            !calledFromRender && this.setAttributes(true);
            this.undelegateEvents();
            !calledFromRender && this.removeEventListeners();
            this.getContainerEl().removeChild(this.el);
            this.el = null;
            this.parentEl = null;
            this.helpers = {};
            if (this.template) {
                this.templateContainer && this.templateContainer.removeChild(this.template);
                this.template = null;
            }
            return this;
        },
        delegateEvents: function () {
            if (!this.eventsMap.length) return;
            this.eventsMap.forEach(function (val) {
                val.el.addEventListener(val.type, val.handler, false);
            });
        },

        /**
         *
         * @param {String} name
         * @param {Function} replacer
         * @param {Object} context
         */
        registerHelper: function (name, replacer, context) {
            if (!(Helpers.getType(name) == 'String' && Helpers.getType(replacer) == 'Function'))
                throw new Error('Invalid arguments type');
            this.helpers[name] = replacer.call(context || this);
        },

        /**
         *
         * @param {String} name
         */
        deleteHelper: function (name) {
            if (this.helpers[name])
                this.helpers[name] = null;
        },

        /**
         * abstract @method initialize
         * initialization logic
         */
        initialize: function () {
        },

        /**
         *
         * @param {String} val
         * @returns {*}
         */
        getParsedModelValue: function (val) {
            var prevModelValue, modelValue,
                parser = function (key) {
                    var isObjectPriority = key.indexOf('[') != -1 ? key.indexOf('.') != -1 ? key.indexOf('.') < key.indexOf('[') : !key.indexOf('[') : true;
                    if (isObjectPriority) {
                        var chainKey = key.split('.');
                        chainKey.forEach(function (arrVal) {
                            prevModelValue = modelValue;
                            modelValue = modelValue && modelValue[arrVal] || this.helpers[arrVal] || this.model.get(arrVal);
                            if (typeof modelValue === "undefined" && typeof prevModelValue != "undefined") {
                                parser(arrVal);
                            }
                        }.bind(this));
                    } else {
                        var splitedStr = key.split('['),
                            arrName = splitedStr[0];
                        splitedStr.shift();
                        var indexArr = splitedStr.map(function (v) {
                            return {
                                index: +v.split(']')[0],
                                prop: v.indexOf('.') + 1 ? v.split(']')[1].substr(1) : false
                            }
                        });
                        prevModelValue = prevModelValue && prevModelValue[arrName] || this.helpers[arrName] || this.model.get(arrName);
                        indexArr.forEach(function (v) {
                            modelValue = modelValue && modelValue[v.index] || prevModelValue[v.index];
                            v.prop && parser(v.prop);
                        });
                    }
                    return modelValue;
                }.bind(this);
            return parser(val);
        },
        parseTemplate: function () {
            var source = this.template.innerHTML;
            if (this.model || Object.keys(this.helpers).length) {
                var templateKeys = [],
                    escapes = {
                        "'": "'",
                        '\[': '[',
                        '\]': ']',
                        '\\': '\\',
                        '\r': 'r',
                        '\n': 'n',
                        '\t': 't'
                    },
                    escapePattern = /\\|\[|\]|'|\r|\n|\t|\u2028|\u2029/g,
                    trimedSource = source.replace(/\s+/g, ''),
                    splited = trimedSource.match(/{{(.*)}}/g)[0].split('{{');
                splited.shift();
                splited.forEach(function (val) {
                    var key = val.split('}}')[0];
                    templateKeys.push(key);
                });
                Helpers.uniqueArray(templateKeys).forEach(function (val) {
                    var key = val.replace(escapePattern, function (match) {
                        return '\\' + escapes[match]
                    });
                    source = source.replace(new RegExp('{{' + key + '}}', "g"), this.getParsedModelValue(val));
                }.bind(this));
            }
            this.el.innerHTML = source;
            this.setupViewEvents();
        },
        beforeRender: function (e) {
        },
        afterRender: function (e) {
        },
        addEventListeners: function () {
            this.el.addEventListener('beforeRender', this.beforeRender.bind(this), false);
            this.el.addEventListener('afterRender', this.afterRender.bind(this), false);
        },
        removeEventListeners: function () {
            this.el.removeEventListener('beforeRender', this.beforeRender.bind(this), false);
            this.el.removeEventListener('afterRender', this.afterRender.bind(this), false);
        },

        /**
         *
         * @param {Boolean} hardRerender
         */
        render: function (hardRerender) {
            hardRerender && this.remove(hardRerender);
            if (!this.el) {
                this.el = document.createElement(this.tagName);
                this.addEventListeners();
                this.id && this.el.setAttribute('id', this.id);
                this.className && this.el.setAttribute('class', this.className);
            }
            this.el.dispatchEvent(new CustomEvent('beforeRender'));
            if (!this.template)
                this.template = Helpers.getEl('#' + this.templateId);
            if (this.template)
                this.parseTemplate();
            else if (this.path) {
                Service.get(this.path, true).then(function (response) {
                    if (!this.templateContainer) {
                        this.templateContainer = Helpers.getEl('#templates') || (function () {
                            var el = document.createElement('div');
                            el.setAttribute('id', 'templates');
                            document.body.appendChild(el);
                            return el;
                        }());
                    }
                    this.templateContainer.insertAdjacentHTML("beforeEnd", response);
                    this.template = document.getElementById(this.templateId);
                    if (this.template)
                        this.parseTemplate();
                    else
                        throw new Error('Template with id "' + this.templateId + '" doesn\'t exist');
                }.bind(this), function (xhr) {
                    throw new Error(xhr.responseURL + ' ' + xhr.statusText);
                });
            }
            this.getContainerEl().appendChild(this.el);
            Helpers.defer(function () {
                this.el.dispatchEvent(new CustomEvent('afterRender'));
            }, this);
        },
        setupViewEvents: function () {
            this.undelegateEvents();
            var events = this.events;
            if (!Object.keys(events).length) return;
            for (var key in events) {
                if (events.hasOwnProperty(key)) {
                    var parsedArr = key.split(' '),
                        eventType = parsedArr.shift();
                    if (parsedArr.length) {
                        var nodesList = this.el.querySelectorAll(parsedArr.join(' ')),
                            nodeArr = Array.prototype.slice.call(nodesList);
                        nodeArr.forEach(function (val) {
                            this.eventsMap.push({
                                el: val,
                                type: eventType,
                                handler: this[events[key]].bind(this)
                            });
                        }.bind(this));
                    } else {
                        this.eventsMap.push({
                            el: this.el,
                            type: eventType,
                            handler: this[events[key]].bind(this)
                        });
                    }
                }
            }
            this.delegateEvents();
        }
    });
    //-------------

    //Rack.View
    //----------
    var Controller = Rack.Controller = function (options) {
        var defaultRoutes = this.routes;
        this.routes = options && options.routes || defaultRoutes;
        this.initialize.apply(this, arguments);
        this.addEventListeners();
        this.checkRoute();
    };

    Helpers.extend(Controller, {

        /**
         * abstract @method initialize
         * initialization logic
         */
        initialize: function () {},
        addEventListeners: function () {
            window.addEventListener('hashchange', this.checkRoute.bind(this), false);
        },

        /**
         *
         * @param {String} route
         */
        navigate: function (route) {
            var routes = this.routes;
            if (!Object.keys(routes).length)
                return;
            if (!route.length) {
                location.hash = routes['index'] && 'index' || 'any';
                return;
            }
            if (routes[route]) {
                location.hash = route;
                this[routes[route]].call(this, route)
            } else if (routes['any']) {
                location.hash = 'any';
            }
        },
        getHash: function () {
            return window.location.hash.substring(1);
        },

        /**
         *
         * @param {Object} e - HashChangeEvent
         */
        checkRoute: function (e) {
            if (!e || e.returnValue)
                this.navigate(this.getHash())
        }

    });

    Model.extend = View.extend = Controller.extend = extend;

    return Rack;
});