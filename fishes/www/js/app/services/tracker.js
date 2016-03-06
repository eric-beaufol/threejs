define([
    
    'backbone'
    
], function(Backbone) {
    
    var Tracker = {};
    
    _.extend(Tracker, Backbone.Events, {
        
        initialize: function() {
            
            $('body').on('click', '[data-tracking]', function(e) {
                var data = {
                    category: $(this).attr('data-tracking'),
                    action: 'click'
                }
                
                Tracker.send('event', data);
            });
        },
        
        send: function(type, data) {
            
            if(type==='pageView') {
                if(typeof data!=='undefined') {
                    ga('send', 'pageview', data);
                    //console.log(data);
                } else {
                    ga('send', 'pageview');
                }
                
            } else if(type==='event') {
                if(typeof data.category==='undefined' || typeof data.action==='undefined' || typeof ga==='undefined') return;
                ga('send', 'event', data.category, data.action);
            }
        }
    });
    
    return Tracker;
});