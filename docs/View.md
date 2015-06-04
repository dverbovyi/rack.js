#Rack.View API

### 1. extend

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
 higher on the prototype chain. If you override a core function like ```set``` (```get```, ```unset```, ```watch```, ```unwatch```, ```trigger```),
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

### 2. constructor/initialize

    new View([attributes])

When creating an instance of a view, you can pass in the initial values of the attributes, which will be available in
the view. If you want bind your model to view you should pass the model instance to your view constructor as object
with key ```model```,
See example:

```javascript
        var myView = new MyView({model: new Model()});
```

### 3. el

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

### 4. templateId, path

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
