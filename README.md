# Rack.js

Tiny javascript MVC-framework for working with RESTful JSON interface.

...Under development...

##Documentation

* [Model](#model)
* [View](#view)
* [Controller](#controller)
* [Service](#service)
* [Helpers](#helpers)


### Model

* [extend](#extend)
* [constructor/initialize](#constructor/initialize)
* [get](#get)
* [set](#set)
* [unset](#unset)
* [clear](#clear)
* [watch](#watch)
* [unwatch](#unwatch)
* [toJSON](#toJSON)

### extend

    Rack.Model.extend(properties)

To create a Model class of your own, you extend Rack.Model and provide instance properties,
as well options to be attached directly to the constructor function.

extend correctly sets up the prototype chain, so subclasses created with the bellow described way
can be further extended and subclassed as far as you like.
Example:

```javascript
        var MyModel = Rack.Model.extend({
            getBookInfo: function() {
                return this.get('title') + ' - ' + this.get('author');
            }
        });
```
 
 * Brief aside on super: JavaScript does not provide a simple way to call super — the function of the same name defined
  higher on the prototype chain. If you override a core function like set (get, unset, watch, unwatch, trigger),
  and you want to invoke the parent object's implementation, you'll have to explicitly call it, along these lines:
 Example:

```javascript
         var MyModel = Rack.Model.extend({
             set: function(attributes) {
                MyModel.__super__.set.apply(this, arguments);
                 ...
             }
         });
```
