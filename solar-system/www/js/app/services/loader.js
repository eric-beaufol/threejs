define([
    
    'backbone'
	, 'collections/assets'
	, 'views/loader'
    
], function(
	Backbone,
	Assets,
	LoaderView
) {
    
    var Loader = function() {
        this.assets = [];
    };
    
    _.extend(Loader.prototype, Backbone.Events, {
        
        count: 0,
        
        load: function(collection, deferred) {
			
            collection.each(function(model, index) {
				
                var img = new Image(),
                    url = model.get('path'),
                    that = this;
                
                img.onload = function() {
                    that.count++;
					
                    var src = $(this).attr('src'),
                        i = collection.where({'path': src})[0];
                        i.set({loaded: true});
                    
                    if(that.count === collection.length) {
                        deferred.resolve();
                    }
                }
                
                img.src = url;
                
            }, this);
        },
		
		loadAssetsBeforeStart: function(json, $el) {
			var d1 = new $.Deferred();
			
            // On récupère la liste des assets à charger
            $.getJSON(json, _.bind(function(data) {
               
               // On en fait une collection
               this.assetsCollection = new Assets(data.assets);
               
               // On instancie la vue du loader en lui passant la collection d'assets
               this.loaderView = new LoaderView({collection: this.assetsCollection});
               $el.append(this.loaderView.render());
               
               // On demande au loader de charger notre collection d'assets
               this.load(this.assetsCollection, d1);
               
               // La collection d'assets sera mise à jour par le loader
               // passant la clé "loaded" de chaque asset à "true" au fur et à mesure
               // la vue du loader écoute ces changements et se met à jour en conséquence
               
            }, this));
            
            $.when(d1).done(_.bind(function() {
				
                // On supprime le loader ainsi que sa vue
                this.loaderView.$el.fadeOut(_.bind(function() {
                    
                    this.loaderView.remove();
					delete this.loaderView;
                    
                    Backbone.history.start();
                    
                }, this));
            }, this));
		}
    });
    
    return Loader;
});