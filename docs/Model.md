Rack.Model
======

1. extend
=======
To create a Model class of your own, you extend Rack.Model and provide instance properties,
as well options to be attached directly to the constructor function.

extend correctly sets up the prototype chain, so subclasses created with the bellow described way
can be further extended and subclassed as far as you like.
Example:

    var MyModel = Rack.Model.extend({
        getBookInfo: function() {
            return this.get('title') + ' - ' + this.get('author');
        }
    });

    var myModel = new MyModel({
        title: 'Code Complete',
        author: 'Steve McConnell'
    });

    alert(myModel.getBookInfo());

 * Brief aside on super: JavaScript does not provide a simple way to call super — the function of the same name defined
 * higher on the prototype chain. If you override a core function like set (get, unset, watch, unwatch, trigger),
 * and you want to invoke the parent object's implementation, you'll have to explicitly call it, along these lines:
Example:

    var MyModel = Rack.Model.extend({
        set: function(attributes) {
            Rack.Model.prototype.set.call(this, arguments);
        }
    });

2. get
=======
model.get(attribute)

Get the current value of an attribute from the model. For example:

    myModel.get("title")

3. set
=======
model.set(attributes)

Set a hash of attributes (one or many) on the model.
You may also pass individual keys and values.

    myModel.set({title: "March 20", content: "In his eyes she eclipses..."});

or

    myModel.set("title", "A Scandal in Bohemia");

4. unset
======
model.unset(attribute)

Remove an attribute by deleting it from the internal attributes.

    myModel.unset("title")

5. clear
======
model.clear()

Removes all attributes from the model.

    myModel.clear()

6. watch
=========
model.watch(attribute, callback)

Initialize handler for change value of watched property. Handler will be triggered if the value of watched property will change.

    myModel.watch('title', function(e) {
        console.log('Changed');
        console.log('New '+e.key+' value is '+e.val);
    });

If you want that handler was the same for several watched properties,
you should pass the first arguments as Array, See Example:

    myModel.watch(['title', 'content'], function(e) {
        console.log(e.key+' has changed'); //Callback will be called per every array-item
    });

If you want to watch for changing all model, you should mention a 'model' key-word as first argument

    myModel.watch('model', function(e){
        console.log('Model has changed!');
    });

7. unwatch
===========
model.unwatch(attribute)

Unbind the handler from watched property(ies)

    myModel.unwatch('title')

If you want to unbind all handlers from several properties you should pass the first arguments as Array, See Example:

    myModel.unwatch(['title', 'content'])


8. toJSON
==========
model.toJSON

export model attribute in JSON-format

    var jsonModel = myModel.toJSON();
