define([

    'backbone'
    
], function(Backbone) {

        'use strict';

        var transitionHandler = _.extend({}, Backbone.Events, {
            
            initialize: function(options) {
				this.options = options;
                this.toDisplay = [];
				this.toRemove = [];
				this.$main = this.options.$el;
				this.queue = [];
				this.transDeferred;
            },
			
			/**
			 * @param {object} viewsArray -> views's array to display
			 * @param {string} mainClass -> class to set to the main $el
			 * @param {boolean} skipManualTransition -> if true, bypass the onShow & onHide functions and replace them by fade function
			 * @param {boolean} synchro -> if true, launch onHide() & onShow() together
			 */
			getTransition: function(viewsArray, mainClass, skipManualTransition, synchro) {
				skipManualTransition = skipManualTransition || false;
				synchro = synchro || false;
				
				// On copie les vues en cours d'affichage dans l'array contenant les vues à supprimer
				this.toRemove = this.toDisplay.slice(0);
				
				// On vide l'array des vues en cours d'affichage et le remplit avec celles instanciées ci-dessus
				this.toDisplay = viewsArray;
				
				// On vide l'array des vues en cours d'affichage et le remplit avec celles instanciées ci-dessus
				this.queue.push([this.toRemove, this.toDisplay, mainClass, skipManualTransition, synchro]);
				
				if(this.queue.length === 1) {
					this.makeTransition(this.queue[0]);
				}
			},
			
			makeTransition: function(paramArr) {
				
				var r = paramArr[0], 
					d = paramArr[1],
					m = paramArr[2], 
					skip = paramArr[3], 
					sync = paramArr[4];
			
				var d1 = new $.Deferred();
				
				// Lorqu'une transition est terminée...
				$.when(d1).done(_.bind(function() {
					
					if(this.queue.length > 1) {
						// On récupère le tableau de vues de la dernière transition effective
						this.toRemove = this.queue[0][1].slice(0);
						// On retire toutes les transitions à l'exception de la dernière demandée
						var lastTrans = this.queue.pop();
						this.queue = [lastTrans];
						// On met à jour le tableau de vues à supprimer
						this.queue[0][0] = this.toRemove;
						// On lance la transition
						this.makeTransition(this.queue[0]);
					} else {
						this.queue = [];
					}
				}, this));
				
				// -> 1
				var common = _.intersection(d, r),
					toDsply = _.difference(d, common),
					toRmv = _.difference(r, common);
				
				if(!toDsply.length && !toRmv.length) {
					d1.resolve();
					return;
				}
				
				// -> 3 -> 2
				var fadeIn = function(v, deferred) {
					v.$el.fadeIn(0, function() {
						deferred.resolve();
						if(v.onRendered) v.onRendered();
					});
				}
				
				// -> 3 -> 1
				var display = _.bind(function() {
					
					window.scrollTo(0, 0);
					this.$main.removeClass().addClass(m);
					
					// Deferreds Array
					var deferreds = [];
					
					for(var i=0; i<toDsply.length; i++) {
						var v = toDsply[i];
						var $v = v.render();
						var deferred = new $.Deferred();
						deferreds.push(deferred);
						
						if(!v.onShow || skip) $v.css('display', 'none');
						
						v.delegateEvents();
						var index = _.indexOf(d, v);
						
						if(this.$main.children().length && index !== -1 && index !== 0) {
							this.$main.children(':nth-child(' + index + ')').after($v);
						} else {
							this.$main.prepend($v);
						}
						
						if(!v.onShow || skip) {
							fadeIn(v, deferred);
						} else {
							// Force reflow first...
							var t = v.$el[0].offsetHeight;
							// Launch onShow() after !
							v.onShow(deferred);
						}
						
						$.when.apply($, deferreds).done(function() {
							d1.resolve();
						});
					}
					
				}, this);
				
				// -> 2 -> 2
				var fadeOut = function(v, deferred) {
					v.$el.fadeOut(250, function() {
						v.remove();
						// reset fadeOut effect on $el
						v.$el.css('display', '');
						deferred.resolve();
					});
				}
				
				// -> 2 -> 1
				// If no view to remove, skip this step...
				if(!toRmv.length) {
					display();
				} else {
					// Deferreds Array
					var deferreds = [];
					
					for(var u = 0; u < toRmv.length; u++) {
						var v = toRmv[u];
						var deferred = new $.Deferred();
						deferreds.push(deferred);
						
						// Autotransition
						if(!v.onHide || skip) {
							fadeOut(v, deferred);
						// Manual transition
						} else {
							v.onHide(deferred);
						}
					}
					
					if(sync) {
						if(!toDsply.length) {
							d1.resolve();
						} else {
							display();
						}
					} else {
						$.when.apply($, deferreds).done(function() {
							if(!toDsply.length) {
								d1.resolve();
							} else {
								display();
							}
						});
					}
				}
			},
			
			getPopin: function(viewsArr) {
				if(typeof this.options.popins === 'undefined') return;
				if(Backbone.history.fragment.indexOf('p/') === -1) return;
				
				var urlParams = String(Backbone.history.fragment).split('/'),
					i = _.indexOf(urlParams, 'p'),
					popinId = urlParams[i + 1];
				
				_.each(this.options.popins, function(popin, key) {
					if(popinId === key) {
						var popinView = popinView || new popin();
						viewsArr.push(popinView);
					}
				});
			}
        });

        return transitionHandler;

    }
);