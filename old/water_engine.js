/** 
A simple ThreeJS/WebGL renderer that takes in a sph-fluid
and renders the positions of the particles
 */

class WaterEngine {
  xd = [];
  constructor(fluid){
    this.scene = null;
    this.camera = null; 
    this.renderer = null;
    this.renderEnable = true;
    this.meshes = [];
    this.fluid = fluid;
    this.list = [];
    
    // Set up all ThreeJS stuff
    this.setup();
    this.initScene();
    // var num_threads = 1;
    //   var MT = new Multithread(num_threads);
    //   var funcInADifferentThread = MT.process(
    //     function(a) { return a;
    //     },  
    //     function(r) { console.log("=================="+r);
    //     WaterEngine.xd.push("q");
    //       console.log(WaterEngine.xd) }  
    //   );
    //   funcInADifferentThread("s")
    //   funcInADifferentThread("w")
    //   funcInADifferentThread("e")
    //   funcInADifferentThread("r")  
  }

  clear() {
    for( var i = this.scene.children.length - 1 ; i > 0; i--){
      this.scene.remove(this.scene.children[i]);
    }
  }

  setup(){
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 1000;
    this.camera.position.set(WaterEngine.SQUARE_SIZE / 2, WaterEngine.SQUARE_SIZE / 2, WaterEngine.START_OFFSET_Z);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor( 0xe0e0e0, 1);

    // Resizing window
    THREEx.WindowResize(this.renderer, this.camera);
    document.body.appendChild( this.renderer.domElement );
  };

  initScene() {
    this.clear();
    this.drawGrid();
    this.meshes = []

    const geometry = new THREE.CircleGeometry( WaterEngine.PARTICLE_RADIUS, 16 );
    for (const particle of this.fluid.particles_) {
      const material = new THREE.MeshBasicMaterial( {color: particle.color} );
    // const material = new THREE.MeshBasicMaterial( {map : new
    // THREE.TextureLoader().load('../img/circle.png')} );
      let mesh = new THREE.Mesh(geometry, material);      
      mesh.position.set(particle.position.x, particle.position.y, particle.position.z);
      this.meshes.push(mesh);
      this.scene.add(mesh);

      

    }
  }

  update_(positions) {
    for (let i = 0; i < positions.length; i++) {
      this.meshes[i].position.set(
          positions[i].x, positions[i].y, positions[i].z);
    }
  }

  render() {
    if(this.renderEnable) {
      requestAnimationFrame( this.render.bind(this) ); 
      this.fluid.calculateAcceleration();
      this.fluid.idle();
      this.update_(this.fluid.particlePositions);
      this.renderer.render( this.scene, this.camera );
    }
  }

  toggleRender() {
    this.renderEnable = !this.renderEnable;
    this.render();  
  }

  stopAll() {
    this.clear();
    this.renderEnable = false;
    this.fluid.particles_ = [];
    this.fluid.numParticles = 0;
  }

  drawGrid() {
    let rectShape = new THREE.Shape();
    rectShape.moveTo(0, 0);
    rectShape.lineTo(0, WaterEngine.SQUARE_SIZE);
    rectShape.lineTo(WaterEngine.SQUARE_SIZE, WaterEngine.SQUARE_SIZE);
    rectShape.lineTo(WaterEngine.SQUARE_SIZE, 0);
    rectShape.lineTo(0, 0);

    const rectGeom = new THREE.ShapeGeometry(rectShape);
    const rectMesh = new THREE.Mesh(
        rectGeom, new THREE.MeshBasicMaterial({color: 0xffffff}));

    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial(
        {color: 0xff9b9b, linewidth: WaterEngine.LINE_WIDTH});

    // Draw line outside box
    /*geometry.vertices.push(new THREE.Vector3(-WaterEngine.LINE_WIDTH/2 + 1,
    -WaterEngine.LINE_WIDTH/2, 0));
    geometry.vertices.push(new THREE.Vector3(-WaterEngine.LINE_WIDTH/2 + 1,
    WaterEngine.SQUARE_SIZE + WaterEngine.LINE_WIDTH - 1, 0));

    geometry.vertices.push(new THREE.Vector3(-WaterEngine.LINE_WIDTH/2 + 1,
    WaterEngine.SQUARE_SIZE + WaterEngine.LINE_WIDTH/2 - 1, 0));
    geometry.vertices.push(new THREE.Vector3(WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH - 1, WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH/2 - 1, 0));

    geometry.vertices.push(new THREE.Vector3(WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH/2 - 1, WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH/2- 1, 0));
    geometry.vertices.push(new THREE.Vector3(WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH/2 - 1, -WaterEngine.LINE_WIDTH + 1, 0));

    geometry.vertices.push(new THREE.Vector3(WaterEngine.SQUARE_SIZE +
    WaterEngine.LINE_WIDTH/2 - 1, -WaterEngine.LINE_WIDTH/2 + 1, 0));
    geometry.vertices.push(new THREE.Vector3(-WaterEngine.LINE_WIDTH + 1,
    -WaterEngine.LINE_WIDTH/2 + 1, 0));

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);*/
    this.scene.add(rectMesh)
  };
}

WaterEngine.START_OFFSET_X = 100;
WaterEngine.START_OFFSET_Y = 256;
WaterEngine.START_OFFSET_Z = 750;
WaterEngine.SQUARE_SIZE = 512;
WaterEngine.LINE_WIDTH = 10;
WaterEngine.PARTICLE_RADIUS = 16/2; // h/2
