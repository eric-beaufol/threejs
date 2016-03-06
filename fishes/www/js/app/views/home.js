define([
    
    'backbone'
    , 'text!templates/home.html'
	, 'threejs'
	, 'stats'
	, 'datgui'
    
], function(Backbone, tmp) {
    
    var HomeView = Backbone.View.extend({
        
		tagName: 'section',
        id: 'home',
        template: _.template(tmp),
        
        initialize: function() {
			
			// Listeners
			window.addEventListener('resize', _.bind(this.onResize, this), false);
			window.addEventListener('mousemove', _.bind(this.onMousemove, this), false);
			window.addEventListener('mousewheel', _.bind(this.onMousewheel, this), false);
		},
		
		onResize: function() {
			if(this.renderer && this.camera) {
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
				
				/*
				this.positionCamera();
				this.plane.geometry.dispose();
				this.plane.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
				
				for(var i = 0; i < this.fishes.length; i++) {
					this.fishes[i].position.x = this.fishes[i].data.perX * (window.innerWidth/2);
					this.fishes[i].position.y = this.fishes[i].data.perY * (window.innerHeight/2);
				}
				*/
				
				this.renderer.setSize(window.innerWidth, window.innerHeight);
			}
		},
		
		onMousewheel: function(e) {
			this.mouseZ -= e.wheelDelta;
		},
		
		onMousemove: function(e) {
			this.mouseX = e.clientX - window.innerWidth/2;
			this.mouseY = window.innerHeight/2 - e.clientY;
		},
        
		positionCamera: function() {
			var hyp = (window.innerWidth/2) / Math.sin(22.5 * (Math.PI/180));
			var haut = Math.ceil(Math.sqrt(Math.pow(hyp, 2) - Math.pow((window.innerWidth/2), 2)));
			
			this.camZ = haut * (window.innerHeight / window.innerWidth);
			
			this.camera.position.z = this.camZ;
			this.camera.position.y = 0;
		},
		
        render: function() {
			this.mouseX = 0;
			this.mouseY = 0;
			this.mouseZ = 0;
			this.maxVelocity = 0.005;
			
			// Fill el
            this.$el.html(this.template);
			
			// Stats
			this.initStats();
			
			// Scene
			this.scene = new THREE.Scene();
			
			// Camera
			this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 6500);
			this.positionCamera();
			this.camera.lookAt(this.scene.position);
			
			// Renderer
			this.renderer = new THREE.WebGLRenderer({antialias: !0});
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setClearColor(new THREE.Color(0x000000, 1.0));
			
			// Axis
			var axes = new THREE.AxisHelper(window.innerWidth / 2);
			//this.scene.add(axes);
			
			// Plane
			var planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
			var planeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
			this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
			
			//this.scene.add(this.plane);
			
			// Fishes
			this.fishes = [];
			for(var i = 0; i < 100; i++) {
				var width = Math.random() * 35 + 20;
				var height = Math.random() * 50 + 35;
				
				var fishGeometry = new THREE.CylinderGeometry(0, width, height, 3);
					fishGeometry.rotateX(Math.PI / 2);
				
				var fishMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true});
				var fish = new THREE.Mesh(fishGeometry, fishMaterial);
				var posX = window.innerWidth / 2 - (Math.random() * (window.innerWidth));
				var posY = window.innerHeight / 2 - (Math.random() * (window.innerHeight));
				
					fish.position.set(
						posX, 
						posY,
						this.camZ / 2 - (Math.random() * this.camZ)
					);
					
					fish.data = {
						steering: new THREE.Vector3(0,0,0),
						velocity: new THREE.Vector3(0,0,0),
						mass: 250 + (width*height-200),
						perX: posX / (window.innerWidth / 2),
						perY: posY / (window.innerHeight / 2)
					}
				
				this.fishes.push(fish);
				this.scene.add(fish);
			}
			
			// Sphere
			var sphereGeometry = new THREE.SphereGeometry(2, 10, 10);
			var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
			this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
			
			this.scene.add(this.sphere);
			
			// Light
			var ambientLight = new THREE.AmbientLight(0x666666);
			this.scene.add(ambientLight);
			
			var spotLight = new THREE.SpotLight(0xffffff);
				spotLight.position.z = this.camZ * 2;
			this.scene.add(spotLight);
			
			this.step = 0;
			
			// Render loop
			this.renderLoop();
			
			
			// DOM Manipulation
			this.$el.append(this.renderer.domElement);
			return this.$el;
        },
		
		renderLoop: function() {
			this.stats.update();
			this.step++;
			
			if(this.step === 120) {
				this.step = 0;
				this.mouseX = (window.innerWidth / 4) - (Math.random() * window.innerWidth / 2);
				this.mouseY = (window.innerHeight / 4) - (Math.random() * window.innerHeight / 2);
				this.mouseZ = (this.camZ / 4) - (Math.random() * this.camZ);
			}
			
			var time = new Date() * 0.0005;
			
			this.sphere.position.x = this.mouseX;//Math.cos(time) * (window.innerWidth / 2);
			this.sphere.position.y = this.mouseY;//Math.sin(time) * (window.innerHeight / 2);
			this.sphere.position.z = this.mouseZ;
			
			for(var i = 0; i < this.fishes.length; i++) {
				var fish = this.fishes[i];
				var position = fish.position.clone();
				var target = this.sphere.position.clone();
				var currVelocity = fish.data.velocity;
				var mass = fish.data.mass;
				
				var desiredVelocity = target.sub(position).multiplyScalar(.1);
				var steering = desiredVelocity.sub(currVelocity).multiplyScalar(1/mass);
				var velocity = currVelocity.add(steering);
				
				fish.data.velocity = velocity;
				
				if(Math.round(Math.random() * 1000) === 1) fish.data.mass= 250 + Math.random() * 1050;
				
				fish.position.add(velocity);
				
				fish.lookAt(position.add(velocity.clone().multiplyScalar(10)));
			}
			
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