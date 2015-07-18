/**
 * Created with JetBrains PhpStorm.
 * User: Dmytro
 * Date: 17.07.15
 * Time: 23:09
 */
define([
    'Rack',
    'indexView'
], function(Rack, IndexView){
    var AppController = Rack.Controller.extend({
        initialize: function(){
            console.log('AppController');
        },
        actions: {
            index: function(route, params, router){
                if(!this.indexView)
                    this.indexView = new IndexView();
            },
            notFound: function(route, params, router){
                alert('Route not found');
                router.navigate('/');
            }
        }
    });

    return AppController;
});