/**
 * Created with JetBrains PhpStorm.
 * User: Dmytro
 * Date: 17.07.15
 * Time: 23:09
 */
define([
    'Rack'
], function(Rack){
    var IndexView = Rack.View.extend({
        id: "index_view",
        class: "view",
        container: '#container',
        templateId: 'indexTemplate',
        initialize: function(){
            console.log('IndexView');
        }
    });

    return IndexView;
});