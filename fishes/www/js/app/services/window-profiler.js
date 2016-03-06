define([

    'backbone',
    'mobileDetect'
    
], function(Backbone, MobileDetect) {

        'use strict';

        var windowProfiler = _.extend({}, Backbone.Events, {
            
            initialize: function() {
                this.md = new MobileDetect(window.navigator.userAgent);
                this.$window = $(window);
                this.$window.on('resize', _.bind(this.updateSize, this));
                this.updateSize();
            },

            updateSize: function() {
                var windowSize = this.getWindowSize();
                this.trigger('window:resize', windowSize);
            },
            
            getWindowSize: function() {
                this.windowSize = {
                    width: this.$window.width(),
                    height: this.$window.height()
                };

                return this.windowSize;
            },

            isMobile: function() {
                return !!this.md.mobile() && !this.md.tablet();
            },

            isTablet: function() {
                return !!this.md.tablet();
            },

            getDeviceType: function() {
                var device = this.isMobile() ? 'mobile' :
                    this.isTablet() ? 'tablet' : 'desktop';
                
                return device;
            }
        });

        return windowProfiler;

    }
);