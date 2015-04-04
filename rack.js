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

    // Rack.Service
    //----------------
    var Service = Rack.Service = function () {
        throw new Error("The instance shouldn\'t be created");
    };

    /**
     *
     * @param url - {String}
     * @param data - {*}
     * @param method - {String}
     * @param resolve - {Function}
     * @param reject - {Function}
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

    Service.get = function(url, async) {
        return new Promise(function(resolve, reject){
            this.sendRequest(url, null, 'GET', resolve, reject, async);
        }.bind(this));
    };

    Service.post = function(url, data, async) {
        return new Promise(function(resolve, reject){
            this.sendRequest(url, data, 'POST', resolve, reject, async);
        }.bind(this));
    };
    //-----------------------

    //Rack.Model
    //----------
    var Model = Rack.Model = function (attributes, options) {
        this.attributes = attributes || {};
        this.prevAttributes = {};
        this.options = options || {};
        this.changed = true;
        this.listenersObj = {};
        this.set(this.attributes);
        this.initialize.apply(this, arguments);
    };

    Helpers.extend(Model, {
        /**
         * virtual @method initialize
         * initialization logic
         */
        initialize: function () {
            console.warn('@method initialize isn\'t implemented');
        },
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

    //Rack.View
    //----------
    var View = Rack.View = function (attributes) {
        this.attributes = attributes || {};
        this.eventsMap = [];
        this.setAttributes();
        this.initialize.apply(this, arguments);
    };

    Helpers.extend(View, {
        templateId: '',
        templatePath: '',
        container: document.body,
        tagName: 'div',
        id: '',
        className: '',
        events: {},
        setAttributes: function() {
            if(Object.keys(this.attributes).length)
                for(var key in this.attributes) {
                    this[key] = this.attributes[key];
                }
        },
        undelegateEvents: function () {
            if (!this.eventsMap.length) return;
            this.eventsMap.forEach(function (val) {
                val.el.removeEventListener(val.type, val.handler, false);
            });
            this.eventsMap = [];
        },
        remove: function () {
            this.undelegateEvents();
            this.container.removeChild(this.el);
            this.el = null;
            if(this.template)
                this.templateContainer.removeChild(this.template);
            return this;
        },
        delegateEvents: function () {
            if(!this.eventsMap.length) return;
            this.eventsMap.forEach(function (val) {
                val.el.addEventListener(val.type, val.handler, false);
            });
        },
        initialize: function () {
            this.render();
        },
        parseTemplate: function(template) {
            this.template = template;
            this.el.innerHTML = this.template.innerHTML;
            this.setupViewEvents();
        },
        render: function () {
            if(this.el)
                this.remove();
            this.templateContainer = document.getElementById('templates') || (function() {
                    var el = document.createElement('div');
                    el.setAttribute('id', 'templates');
                    document.body.appendChild(el);
                    return el;
                })();

            this.el = document.createElement(this.tagName);
            if (this.id) this.el.setAttribute('id', this.id);
            if (this.className) this.el.setAttribute('class', this.className);
            var template = document.getElementById(this.templateId);
            if(template)
                this.parseTemplate(template);
            else if(this.templatePath)
                Service.get(this.templatePath, true).then(function(response){
                    this.templateContainer.insertAdjacentHTML("beforeEnd", response);
                    template = document.getElementById(this.templateId);
                    if(template)
                        this.parseTemplate(template);
                    else
                        throw new Error('Template with id "'+this.templateId+'" doesn\'t exist');
                }.bind(this), function(xhr){
                    throw new Error(xhr.responseURL+' '+xhr.statusText);
                });
            else
                throw new Error('Template with id "'+this.templateId+'" doesn\'t exist');
            this.container.appendChild(this.el);
        },
        setupViewEvents: function () {
            var events = this.events;
            if (!events) return;
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

    Model.extend = View.extend = extend;

    return Rack;
});