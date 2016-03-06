define([
    'backbone'
    
], function(Backbone) {
    
    var DateModel = Backbone.Model.extend({
        
        defaults: {
            days: [1,31],
            week: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            monthes: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'],
            years: [1900, 2014]
        }
    });
    
    return DateModel;
});