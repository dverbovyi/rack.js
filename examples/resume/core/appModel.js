/**
 * Created with JetBrains PhpStorm.
 * User: Dmytro
 * Date: 17.07.15
 * Time: 23:21
 */

define([
    'Rack'
], function(Rack){
    var AppModel = Rack.Model.extend({
        defaults:{
            name: 'Dmytro',
            surname: 'Verbovyi',
            title: 'web developer'
        },
        initialize: function(){
            console.log('AppModel');
        }
    });

    return AppModel;
});
