#Rack.View API

### 1. extend

To create a View class of your own, you extend Rack.View and provide instance properties,
as well options to be attached directly to the constructor function.

extend correctly sets up the prototype chain, so subclasses created with the bellow described way
can be further extended and subclassed as far as you like.
Example:

 ```javascript
    var MyView = Rack.View.extend({
       tmpId: 'testTemplate', //template Id
       tmpPath: './testTemplate.html', //template path - unnecessary if template already exist in your index.html
       tagName: 'ul', // tagName of your view element
       id: 'some_id', // id attribute of your view element
       container: '#parent', // parent element for pushing your view
       className: 'some_class', //class attribute of your view element
       events:{
           'click li':'handler'
       },
       handler: function(){...}
    });

    var MyModel = Rack.Model.extend({...});
    var myView = new MyView({model: new MyModel()});
```

 * Brief aside on super: JavaScript does not provide a simple way to call super — the function of the same name defined
 higher on the prototype chain. If you override a core function like set (get, unset, watch, unwatch, trigger),
 and you want to invoke the parent object's implementation, you'll have to explicitly call it, along these lines:
Example:

    ```javascript
    var MyView = Rack.View.extend({
        ...
        initialize: function(){
            MyView.__super__.initialize.apply(this, arguments);
            ...
        }
        ...
    });
    ```