requirejs.config({
    baseUrl: 'core',
    paths:{
        Rack: '../../../rack'
    },
    shim: {
        Rack: {
            exports: 'Rack'
        }
    }
});

requirejs([
    'Rack',
    'appRouter',
    'appController'
], function(Rack, AppRouter, AppController){
    var appModule = (function(){
        var appController = new AppController(),
            getModuleData = function(url){
                Rack.Service.get(url, true).then(function(response){
                    appController.publish('dataReady', JSON.parse(response));
                    new AppRouter({controller: appController});
                }, function(responseError){
                    alert('Error getting data');
                });
        };
        return {
            start: function(args){
                args.dataURL&&getModuleData(args.dataURL)
            }
        }
    })();
    appModule.start({dataURL: './data.json'});
});