define([
    
    'backbone'
    , 'text!templates/home.html'
	, 'datgui'
	, 'threejs'
	, 'stats'
	, 'mousewheel'
    
], function(Backbone, tmp) {
    
    var HomeView = Backbone.View.extend({
        
		tagName: 'section',
        id: 'home',
        template: _.template(tmp),
		
		events: {
			'mousedown': 'onTap',
			'mousemove': 'onDrag',
			'mouseup': 'onRelease',
			'mousewheel': 'onMousewheel'
		},
        
        initialize: function() {
			this.mouseX = 0;
			this.mouseY = 0;
			this.press = false;
			this.gamma = .05;
			this.planetsLen = 10;
			this.maxTrail = 500;
			this.showTrail = true;
			
			// Listeners
			window.addEventListener('resize', _.bind(this.onResize, this), false);
			window.addEventListener('keydown', _.bind(this.onKeyDown, this), false);
		},
		
		onMousewheel: function(e) {
			this.camera.position.add(new THREE.Vector3(0, 0, e.deltaY * 500));
		},
		
		onTap: function(e) {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
			this.press = true;
		},
		
		onDrag: function(e) {
			if(this.press) {
				var offsetX = (e.clientX - this.mouseX);
				var offsetY = (e.clientY - this.mouseY);
				
				this.universe.rotation.y += Math.PI * offsetX / 180;
				this.universe.rotation.x += Math.PI * offsetY / 180;
				
				this.mouseX = e.clientX;
				this.mouseY = e.clientY;
			}
		},
		
		onRelease: function() {
			this.press = false;
		},
		
		onKeyDown: function(e) {
			// 38 ^, 39 >, 40 v, 37 <
			
			//console.log(e.keyCode);
			
			switch(e.keyCode) {
				case 38:
				this.universe.position.add(new THREE.Vector3(0, 100, 0));
				break;
				case 39:
				this.universe.position.add(new THREE.Vector3(100, 0, 0));
				break;
				case 40:
				this.universe.position.add(new THREE.Vector3(0, -100, 0));
				break;
				case 37:
				this.universe.position.add(new THREE.Vector3(-100, 0, 0));
				break;
			}
		},
		
		onResize: function() {
			if(this.renderer && this.camera) {
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
				
				this.renderer.setSize(window.innerWidth, window.innerHeight);
			}
		},
        
		positionCamera: function() {
			var hyp = (window.innerWidth/2) / Math.sin(22.5 * (Math.PI/180));
			var height = Math.ceil(Math.sqrt(Math.pow(hyp, 2) - Math.pow((window.innerWidth/2), 2)));
			
			this.camZ = height * (window.innerHeight / window.innerWidth);
			
			this.camera.position.z = this.camZ + 500;
			this.camera.position.y = 0;
		},
		
        render: function() {
			var gui = new dat.GUI({
				height: 5 * 32 - 1
			});
			
			gui.add({'gamma': 0.05}, 'gamma').min(.0001).max(.5).step(.005).onChange(_.bind(function(newGamma) {
				this.gamma = newGamma;
			}, this));
			
			gui.add({'planets': 30}, 'planets').min(1).max(300).step(1).onChange(_.bind(function(newPlanetsLen) {
				var offset = newPlanetsLen - this.planetsLen;
				
				for(var i = 0; i < Math.abs(offset); i++) {
					this[(offset > 0 ? 'createPlanet' : 'deletePlanet')]();
				}
				
				this.planetsLen = newPlanetsLen;
				
			}, this));
			
			gui.add({'maxTrail': 500}, 'maxTrail').min(10).max(10000).step(1).onChange(_.bind(function(newMaxTrail) {
				this.maxTrail = newMaxTrail;
			}, this));
			
			gui.add({'showTrail': true}, 'showTrail').onChange(_.bind(function(showTrail) {
				this.showTrail = showTrail;
			}, this));
			
			// Fill el
            this.$el.html(this.template);
			
			// Stats
			this.initStats();
			
			// Scene
			this.scene = new THREE.Scene();
			// Universe
			this.universe = new THREE.Object3D();
			
			// Camera
			this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 6500000);
			this.positionCamera();
			
			// Renderer
			this.renderer = new THREE.WebGLRenderer({antialias: !0});
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setClearColor(new THREE.Color(0x000000, 1.0));
			
			// Planets
			this.objects = [];
			
			for(var i = 0; i < this.planetsLen; i++) {
				this.createPlanet(i);
			}
			
			this.scene.add(this.universe);
			
			// Light
			var ambientLight = new THREE.AmbientLight(0xffffff);
			this.scene.add(ambientLight);
			
			// Render loop
			this.renderLoop();
			
			// DOM Manipulation
			this.$el.append(this.renderer.domElement);
			return this.$el;
        },
		
		createPlanet: function() {
			var i = this.objects.length;
			
			// First is sun
			var radius = i == 0 ? 20 : Math.random() * 2 + 2;
			var color = i == 0 ? 0xffffff : Math.random() * 0xffffff;
			
			var objectGeometry = new THREE.SphereGeometry(radius,  i == 0 ? 50 : 10,  i == 0 ? 50 : 10);
			var objectMaterial = new THREE.MeshBasicMaterial({color: color});
			
			var obj = new THREE.Mesh(objectGeometry, objectMaterial);
			var posX = i === 0 ? 0 : Math.random() * 1600 - 800;
			var posY = i === 0 ? 0 : Math.random() * 1600 - 800;
			var posZ = i === 0 ? 0 : Math.random() * 1600 - 800;
				
			obj.position.set(
				posX, 
				posY,
				posZ
			);
			
			var r = .5;
			
			var lineGeometry = new THREE.Geometry();
				lineGeometry.vertices.push(obj.position.clone());
			
			var lineMaterial = new THREE.LineBasicMaterial({ color: color });
			var line = new THREE.Line(lineGeometry, lineMaterial);
			
			obj.data = {
				steering: new THREE.Vector3(0,0,0),
				velocity: new THREE.Vector3(
					i == 0 ? 0 : (Math.random() > .5 ? 1 : -1) * Math.random() * r, 
					i == 0 ? 0 : (Math.random() > .5 ? 1 : -1) * Math.random() * r, 
					i == 0 ? 0 : (Math.random() > .5 ? 1 : -1) * Math.random() * r
				),
				mass: i == 0 ? 4000 : Math.random() * 5,
				line: line,
				lineMaterial: lineMaterial
			}
			
			this.objects.push(obj);
			this.universe.add(obj);
			this.universe.add(line);
			
			//console.log(this.objects.length);
		},
		
		deletePlanet: function() {
			var planet = this.objects.pop();
			
			this.universe.remove(planet.data.line);
			planet.data.line.geometry.dispose();
			planet.data.line.material.dispose();
			
			this.universe.remove(planet);
		},
		
		renderLoop: function() {
			this.stats.update();
			
			for(var i = 0; i < this.objects.length; i++) {
				var currObj = this.objects[i];
				var currVelocity = currObj.data.velocity.clone();
				
				for(var ii = 0; ii < this.objects.length; ii++) {
					var otherObj = this.objects[ii];
					
					if(otherObj !== currObj) {
					
						var massMultip = currObj.data.mass * otherObj.data.mass;
						var distance = Math.sqrt(
							Math.pow(otherObj.position.x - currObj.position.x, 2) +
							Math.pow(otherObj.position.y - currObj.position.y, 2) +
							Math.pow(otherObj.position.z - currObj.position.z, 2)
						);
						
						var gravitySteer = this.gamma * (massMultip / Math.pow(distance, 2));
						var normVecBetweenObj = currObj.position.clone().sub(otherObj.position).normalize();
						
						gravitySteer = normVecBetweenObj.multiplyScalar(gravitySteer);
						currVelocity.add(gravitySteer.divideScalar(currObj.data.mass));
					}
				}
				
				currObj.data.velocity = currVelocity;
				currObj.position.sub(currVelocity);
				
				this.universe.remove(currObj.data.line);
				currObj.data.line.geometry.dispose();
				currObj.data.line.material.dispose();
				
				var geometry = new THREE.Geometry();
					geometry.vertices = currObj.data.line.geometry.vertices.slice();
					geometry.vertices.push(currObj.position.clone());
				
				while(geometry.vertices.length > this.maxTrail) {
					geometry.vertices.shift();
				}
				
				var line = new THREE.Line(geometry, currObj.data.lineMaterial);
				if(this.showTrail) this.universe.add(line);
				
				//if(i === 1) console.log(line.geometry.vertices.length);
				currObj.data.line = line;
			}
			
			//console.log(this.universe.children.length);
			
			this.renderer.render(this.scene, this.camera);
			requestAnimationFrame(_.bind(this.renderLoop, this));
		},
		
		initStats: function() {
			this.stats = new Stats();
			this.stats.setMode(0);
			
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.left = '0px';
			this.stats.domElement.style.top = '0px';
			
			this.$('#stats-output').append(this.stats.domElement);
		}
    });
    
    return HomeView;
});