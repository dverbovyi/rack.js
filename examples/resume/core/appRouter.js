/**
 * Created with JetBrains PhpStorm.
 * User: Dmytro
 * Date: 17.07.15
 * Time: 23:09
 */
define([
    'Rack',
    'appController'
], function(Rack, AppController){
    var AppRouter = Rack.Router.extend({
        routes: {
            "": "index",
            "any": "notFound"
        },
        initialize: function(){
            console.log('AppRouter');
        }
    });

    return AppRouter;
});