window.onload = function() {
    let world = new World();
    world.addFluidType(new FluidType(0xff0f00,10,2,true))
    world.addParticle(20, 20, 20, 0);
    world.render()
};

var configuration = {
    sceneSize: [100, 50, 100],
    kernerFunctionBase: 1
}

class World {
    constructor() {
        this.scene = null;
        this.camera = null; 
        this.renderer = null;
        this.particleMeshList = []
        this.fluid = new Fluid(configuration)
       
        this.setup()
    }

    addFluidType(fluidType) {
        this.fluid.addFluidType(fluidType)
    }

    //  creates particle and mesh
    addParticle(x, y, z, typeIndex) {
        if(this.fluid.fluidTypeList.length <= typeIndex) throw "Fluid Type does not exists! Add it first";
        
        let fluidType = this.fluid.fluidTypeList[typeIndex]
        let particle = new Particle(new Vector3(x, y, z), typeIndex)
        let r = fluidType.renderRadius;
        let color = fluidType.color;
        var geometry = new THREE.SphereGeometry( r, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: color} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;

        this.fluid.addParticle(particle);
        this.particleMeshList.push(sphere);
        this.scene.add( sphere );  
    }

    //  updates positions of every particle 
    //  mesh and particle indexes must be the same
    redrawAllParticles() {
        if(this.fluid.particles.length != this.particleMeshList.length) throw "mesh and particle index must be the same & list must have the same length"
        for(let i=0; i<this.particleMeshList.length; i++) {
            let particle = this.fluid.particles[i];
            let mesh = this.particleMeshList[i]
            mesh.position.x = particle.R.x;
            mesh.position.y = particle.R.y;
            mesh.position.z = particle.R.z;
        }
    }
    
    setup(){
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1.1*World.SCENE_SIZE[2]
        this.camera.position.x = -10;
        this.camera.position.y = 0.9*World.SCENE_SIZE[1];
        this.camera.lookAt(new THREE.Vector3(World.SCENE_SIZE[0],0,0));
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor("#ffffff");
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        // Resizing window
        //THREEx.WindowResize(this.renderer, this.camera);
        document.body.appendChild( this.renderer.domElement );
        
        var geometry = new THREE.BoxGeometry( 1, 2, 3 );
        var material = new THREE.MeshBasicMaterial( { color: "#ff0000" } );
        var cube = new THREE.Mesh( geometry, material );
        //cube.position.set(World.SCENE_SIZE[0]/2, World.SCENE_SIZE[1]/2, World.SCENE_SIZE[2]/2)
        
        // Add cube to Scene
        var aquarium_geo = new THREE.BoxGeometry( World.SCENE_SIZE[0], World.SCENE_SIZE[1], World.SCENE_SIZE[2] );
        var aquarium_mat = new THREE.MeshBasicMaterial( { color: "#f0f0f0" } );
        aquarium_mat.side = THREE.BackSide;
        var aquarium_mesh = new THREE.Mesh( aquarium_geo, aquarium_mat );
        aquarium_mesh.position.set(World.SCENE_SIZE[0]/2, World.SCENE_SIZE[1]/2, World.SCENE_SIZE[2]/2)
        var aquarium_edges = new THREE.EdgesGeometry( aquarium_geo );
        var aquarium_line = new THREE.LineSegments( aquarium_edges, new THREE.LineBasicMaterial( { color: 0x0f0fff } ) );
        aquarium_line.position.x = aquarium_mesh.position.x
        aquarium_line.position.y = aquarium_mesh.position.y
        aquarium_line.position.z = aquarium_mesh.position.z
        this.scene.add( aquarium_line );
        this.scene.add( aquarium_mesh );
        
        this.scene.add( cube );
        //window.addEventListener( 'resize', this.onWindowResize, false ); // ????????????
        this.renderer.render(this.scene, this.camera);   
    };

    render() {
        this.renderer.render(this.scene, this.camera);   
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        //this.controls.handleResize();
    }
}
World.SCENE_SIZE = [100, 50, 100]
//                   X    Y   Z
