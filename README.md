# Rack.js

Tiny javascript MVC-framework for working with RESTful JSON interface.

...Under development...

##Documentation

* [Rack.Model](#model)
* [Rack.View](#view)
* [Rack.Router](#router)
* [Rack.Controller](#controller)
* [Rack.Service](#service)
* [Rack.Helpers](#helpers)


### Model

 * [extend](#extend)
 * [initialize](#initialize)
 * [get](#get)
 * [set](#set)
 * [unset](#unset)
 * [clear](#clear)
 * [watch](#watch)
 * [unwatch](#unwatch)
 * [toJSON](#tojson)


#### extend

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


#### initialize

    new Model([attributes])

When creating an instance of a model, you can pass in the initial values of the attributes, which will be set on the model.
If you define an initialize function, it will be invoked when the model is created.
    
```javascript
        var myModel = new MyModel({
            title: 'Code Complete',
            author: 'Steve McConnell'
        });
```


#### get

    model.get(attribute)

Get the current value of an attribute from the model. For example:
   
```javascript
        myModel.get("title");
```


#### set

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


#### unset

    model.unset(attribute)

Remove an attribute by deleting it from the internal attributes.

```javascript
        myModel.unset("title")
```


#### clear

    model.clear()

Removes all attributes from the model.

```javascript
        myModel.clear()
```


#### watch

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


#### unwatch

    model.unwatch(attribute)

Unbind the handler from watched property(ies)

```javascript
        myModel.unwatch('title')
```

If you want to unbind all handlers from several properties you should pass the first arguments as Array, See Example:

```javascript
        myModel.unwatch(['title', 'content'])
```


#### toJSON

    model.toJSON()

export model attribute to JSON format

```javascript
        var jsonModel = myModel.toJSON();
```


### View

 * [extend](#view-extend)
 * [initialize](#view-initialize)
 * [el](#el)
 * [templateId and path](#templateid-and-path)
 * [events](#events)
 * [delegateEvents](#delegateevents)
 * [undelegateEvents](#undelegateevents)
 * [before and after render](#before-and-after-render)
 * [registerHelper](#registerhelper)
 * [deleteHelper](#deletehelper)
 * [remove](#remove)
 

#### View extend

    Rack.View.extend(properties)

To create a View class of your own, you extend ```Rack.View``` and provide instance properties,
as well options to be attached directly to the constructor function.

extend correctly sets up the prototype chain, so subclasses created with the bellow described way
can be further extended and subclassed as far as you like.
Example:

```javascript
        var MyView = Rack.View.extend({
           templateId: 'testTemplate', // template Id
           path: './testTemplate.html', // if your template defined as separate file your should set template path
           tagName: 'ul', // tagName of your view element
           id: 'some_id', // id attribute of your view element
           container: '#parent', // parent element for pushing your view
           className: 'some_class', // class attribute of your view element
           events:{
               'click li': 'handler'
           },
           initialize: function(){
              this.model.watch('model', this.render, this);
           },
           handler: function(){...},
           beforeRender: function(){...}, // will be called before template render
           afterRender: function(){...} // will be called after template render
        });
```

 * Brief aside on super: JavaScript does not provide a simple way to call super — the function of the same name defined
 higher on the prototype chain. If you override a core function like ```render``` (```remove```, ```delegateEvents```, ```undelegateEvents```, ```setAttributes```, ```registerHelper```, ```unregisterHelper```, ```addEventListeners```, ```removeEventListeners```),
 and you want to invoke the parent object's implementation, you'll have to explicitly call it, along these lines:
Example:

```javascript
        var MyView = Rack.View.extend({
            ...
            render: function(){
                MyView.__super__.render.apply(this, arguments);
                ...
            }
            ...
        });
```


#### View initialize

    new View([attributes])

When creating an instance of a view, you can pass in the initial values of the attributes, which will be available in
the view. If you want bind your model to view you should pass the model instance to your view constructor as object
with key ```model```,
See example:

```javascript
        var MyView = Rack.View.extend({
            ...
            initialize: function(){
                //some initialization logic
                this.model.watch('title', this.render, this); //e.g. re-render view if title will change
            }
            ...
        });
        var myView = new MyView({model: new Model()});
```


#### el

    view.el

 All views have a DOM element at all times (the ```el``` property), whether they've already been inserted into the page.
 In this fashion, views can be rendered at any time, and inserted into the DOM all at once, in order to get
 high-performance UI rendering with as few reflows and repaints as possible.

 ```this.el``` will be created from the view's ```tagName```, ```className```, ```id``` and attributes properties. If none are set, ```this.el``` is an empty ```div```, which is often just fine.

```javascript
        var MyView = Rack.View.extend({
            tagName:'span',
            id: 'my_view',
            className:'my_view',
        });
```


#### templateId and path

    view.templateId, view.path

For binding template to your view you should point out ```templateId``` and ```path``` to this one if it separate file.

```javascript
        var MyView = Rack.View.extend({
            templateId: 'myViewTemplate',
            path: './myViewTemplate.html'
        });
```

View template example:

```html
        <script type="text/template" id="testTemplate">
            <ul>
                <li>{{title}} - {{author}}</li>
            </ul>
        </script>
```

You can dynamically set ```templateId, path```, but after that you should call method ```this.render(true)``` for hard re-rendering your view and see result


#### events

You can add DOM events listeners to your view like this:

```javascript
        var MyView = Rack.View.extend({
           templateId: 'testTemplate',
           path: './testTemplate.html',
           tagName: 'ul',
           id: 'some_id',
           container: '#containert',
           className: 'some_class',
           events:{
               'dblclick': 'open', //will be fired on whole this.el
               'click li': 'doSomething',
               'focus li span': 'doSomethingElse'
           },
           open: function(){...},
           doSomething: function(){...},
           doSomethingElse: function(){...}
           ...
        });
```


#### delegateEvents

    view.delegateEvents()
    
Binding all DOM events listeners to your view.el. This method applied with View's initialization by default


#### undelegateEvents

    view.undelegateEvents()
    
Unbinding your view DOM events. Called automaticaly with ```view.remove()```


#### before and after Render

Define this methods if you want to describe some logic before/after view rendering, e.g:

```javascript
        var MyView = Rack.View.extend({
           templateId: 'testTemplate',
           path: './testTemplate.html',
           beforeRender: function(){
                console.log('before render')
           }, // will be called before view render
           afterRender: function(){
                console.log('after render')
           } // will be called after view render
        });
```


#### registerHelper

    view.registerHelper(name, function, context)
    
If you want to show in some special rules array or object data from your view's model, you should define an helper where describe what you need, example:

```html
        <script type="text/template" id="testTemplate">
            <ul>
                {{myList}}
            </ul>
        </script>
```

Basic example:
```javascript
        var MyView = Rack.View.extend({
           templateId: 'testTemplate',
           path: './testTemplate.html',
           initialize: function(){
                this.registerHelper('list', function(){
                   var str = '';
                   this.model.get('myList').forEach(function(val){
                      str+='<li>'+val+'</li>';
                   });
                   return str;
                }, this);
           }
        });
```


#### deleteHelper

    view.deleteHelper(name)
    
Remove defined helper by name


#### remove

    view.remove()
    
Removes a view and view's template from the DOM, remove any bound events and unset view's attributes and helpers

### Router

 * [extend](#router-extend)
 * [initialize](#router-initialize)
 * [controller](#router-controller)
 * [routes](#routes)
 * [getHash](#gethash)
 * [navigate](#navigate)

Docs in progress

### Controller

 * [extend](#controller-extend)
 * [initialize](#controller-initialize)
 * [beforeDestroy](#beforeDestroy)
 * [destroy](#destroy)
 
Under development

### Service

Docs in progress

### Helpers

Docs in progress
Under development
