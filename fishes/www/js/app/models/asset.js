define([
    'backbone'
    
], function(Backbone) {
    
    var Asset = Backbone.Model.extend({
        
        defaults: {
            type: '',
            path: '',
            loaded: false
        }
    });
    
    return Asset;
});