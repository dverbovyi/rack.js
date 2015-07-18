requirejs.config({
    baseUrl: 'core',
    paths:{
        Rack: '../libs/rack'
    },
    shim: {
        Rack: {
            exports: 'Rack'
        }
    }
});

requirejs(['appRouter'], function(AppRouter){
    new AppRouter();
});