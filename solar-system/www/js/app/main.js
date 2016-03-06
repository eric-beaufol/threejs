require.config({
  urlArgs: 'bust=' + new Date().getTime(),
  paths: {
    underscore: 'libs/underscore/underscore'
    , jquery: 'libs/jquery/jquery'
    , backbone: 'libs/backbone/backbone'
    , text: 'libs/requirejs-text/text'
    , templates: '../../templates'
	, threejs: 'libs/three.js/build/three.min' 
    , mobileDetect: 'libs/mobile-detect/mobile-detect'
	, stats: 'libs/stats.js/build/stats.min'
	, datgui: 'libs/dat-gui/build/dat.gui.min'
	, mousewheel: 'libs/jquery-mousewheel/jquery.mousewheel.min'
  },
  shim: {
  	backbone: {
  		deps: [ 'underscore', 'jquery' ]
  		, exports: 'Backbone'
  	},
    mobileDetect: {
        exports: 'MobileDetect'
    }
  }
});

require([
    'app'

], function(App) {
    App.initialize();
});