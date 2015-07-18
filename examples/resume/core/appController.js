/**
 * Created with JetBrains PhpStorm.
 * User: Dmytro
 * Date: 17.07.15
 * Time: 23:09
 */
define([
    'Rack',
    'appModel',
    'indexView'
], function(Rack, AppModel, IndexView){
    var AppController = Rack.Controller.extend({
        initialize: function(){
            this.appModel = new AppModel();
        },
        actions: {
            index: function(route, params, router){
                if(!this.indexView)
                    this.indexView = new IndexView({model: this.appModel});
            },
            notFound: function(route, params, router){
                alert('Route not found');
                router.navigate('/');
            }
        }
    });

    return AppController;
});