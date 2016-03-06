define([
    
    'backbone'
    , 'services/window-profiler'
	, 'services/views-handler'
	, 'views/home'
	
], function(
        Backbone,
        windowProfiler,
		viewsHandler,
		HomeView
    ) {
    
    var Router = Backbone.Router.extend({
        routes: {
            '*path': 'onHomepage'
        },
        
        initialize: function() {            
            
			// Initialisation de l'objet de gestion des transitions
			viewsHandler.initialize({$el: $('#main'), popins: {}});
            // Initialisation du windowProfiler (taille de l'écran, type de client, etc..)
			windowProfiler.initialize();
            
			Backbone.history.start();
        },
        
        onHomepage: function() {
			this.homeView = this.homeView || new HomeView();
			var viewsArr = [this.homeView];
			
			viewsHandler.getPopin(viewsArr);
            viewsHandler.getTransition(viewsArr, 'home', false, true);
			
        }
    });
    
    var initialize = function() {
        var router = new Router();
    }
    
    return {
        initialize: initialize
    }
});