#Rack.Model API

### 1. extend

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

### 2. constructor/initialize

    new Model([attributes])

When creating an instance of a model, you can pass in the initial values of the attributes, which will be set on the model.
If you define an initialize function, it will be invoked when the model is created.
    
    ```javascript
        var myModel = new MyModel({
            title: 'Code Complete',
            author: 'Steve McConnell'
        });
    ```

### 3. get

    model.get(attribute)

Get the current value of an attribute from the model. For example:
   
    ```javascript
        myModel.get("title")
    ```

### 4. set

    model.set(attributes)

Set a hash of attributes (one or many) on the model.
You may also pass individual keys and values.

   ```javascript
        myModel.set({title: "March 20", content: "In his eyes she eclipses..."});
    ```
or

   ```javascript
        myModel.set("title", "A Scandal in Bohemia");
    ```

### 5. unset

    model.unset(attribute)

Remove an attribute by deleting it from the internal attributes.

   ```javascript
        myModel.unset("title")
    ```

### 6. clear

    model.clear()

Removes all attributes from the model.

   ```javascript
        myModel.clear()
    ```

### 7. watch

    model.watch(attribute, callback)

Initialize handler for change value of watched property. Handler will be triggered if the value of watched property will change.

   ```javascript
        myModel.watch('title', function(e) {
            console.log('Changed');
            console.log('New '+e.key+' value is '+e.val);
        });
    ```

If you want that handler was the same for several watched properties,
you should pass the first arguments as Array, See Example:

   ```javascript
        myModel.watch(['title', 'content'], function(e) {
            console.log(e.key+' has changed'); //Callback will be called per every array-item (twice in this case)
        });
    ```

If you want to watch for changing all model, you should mention a 'model' key-word as first argument

   ```javascript
        myModel.watch('model', function(e){
            console.log('Model has changed!');
        });
    ```

### 8. unwatch

    model.unwatch(attribute)

Unbind the handler from watched property(ies)

  ```javascript
        myModel.unwatch('title')
    ```

If you want to unbind all handlers from several properties you should pass the first arguments as Array, See Example:

   ```javascript
        myModel.unwatch(['title', 'content'])
    ```

### 9. toJSON

    model.toJSON

export model attribute to JSON format

   ```javascript
        var jsonModel = myModel.toJSON();
    ```
