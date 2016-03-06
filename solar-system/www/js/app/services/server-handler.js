define([
    
    'backbone'
    
], function(Backbone) {
    
    var ServerHandler = _.extend({}, Backbone.Events, {
        
        initialize: function() {}
    });
    
    return ServerHandler;
});