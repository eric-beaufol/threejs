define([
    'backbone'
    , 'models/asset'
    
], function(Backbone, Asset) {
    
    var Assets = Backbone.Collection.extend({
        model: Asset,
        
        initialize: function() {}
    });
    
    return Assets;
});