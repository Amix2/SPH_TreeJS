var world;
window.onload = function() {
    world = new World();

    document.getElementById("addFluidTypeButton").addEventListener("click", function() {
        var promptData = prompt("Insert fluid type data: color (format 0xef11ab), mass per particle, Cube Render Radius, is moveable by simulation (true/false)", "color, mass, radius, isMoveable");
        var data = promptData.split(",")
        world.addFluidType(new FluidType(Number(data[0]),Number(data[1]),Number(data[2]),Boolean(data[3])))
    });

    document.getElementById("addFluidButton").addEventListener("click", function() {
        var promptData = prompt("Insert fluid cuboid data: Start Position (Vector3), Size (Vector3), Fluid Type\nposX, posY, posZ, sizeX, sizeY, sizeZ, fluidType", "posX, posY, posZ, sizeX, sizeY, sizeZ, fluidType");
        var data = promptData.split(",")
        world.addFluid(new THREE.Vector3(Number(data[0]), Number(data[1]), Number(data[2])), new THREE.Vector3(Number(data[3]), Number(data[4]), Number(data[5])), Number(data[6]));
        world.render();
    });
    
    // world.addFluidType(new FluidType(Number(0xff0f00),10,0.2,true))
    // world.addParticle(new Vector3(20, 20, 20), 0);
    // world.render()
    // world.addFluid(new THREE.Vector3(5, 5, 5), new THREE.Vector3(10,10,10), 0)
    // world.render()

    // var gen = getNeighbourParticles(new THREE.Vector3(10,10,10))
    // console.log(world.fluid.cells)
    // while((part = gen.next().value) != null) {
    //     console.log(part.cellIndex)
    // }
};

var configuration = {
    sceneSize: [100, 50, 100],
    kernerFunctionBase: 2
}

class World {
    constructor() {
        this.scene = null;
        this.camera = null; 
        this.renderer = null;
        this.particleMeshList = []
        this.fluid = new Fluid();

        this.setup()

        }

    addFluidType(fluidType) {
        this.fluid.addFluidType(fluidType)
    }

    //  creates particle and mesh
    addParticle(pos, typeIndex) {
        if(this.fluid.fluidTypeList.length <= typeIndex) throw "Fluid Type does not exists! Add it first";

        let fluidType = this.fluid.fluidTypeList[typeIndex]
        let particle = new Particle(pos, typeIndex)
        let r = fluidType.renderRadius;
        let color = fluidType.color;
        var geometry = new THREE.SphereGeometry( r, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: color} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position = pos
        this.fluid.addParticle(particle);
        this.particleMeshList.push(sphere);
        this.scene.add( sphere );
    }

    addParticleObject(object){
        for(var i = 0; i < object.particles.length; i++)
            this.addSolidParticle(object.particles[i]);
    }

    addSolidParticle(particle) {
        if(this.fluid.fluidTypeList.length <= particle.fluidTypeIndex) throw "Fluid Type does not exists! Add it first";
        console.log(particle);
        let fluidType = this.fluid.fluidTypeList[particle.fluidTypeIndex]
        let r = fluidType.renderRadius;
        let color = fluidType.color;
        var geometry = new THREE.SphereGeometry( r, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: color} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position.x = particle.R.x;
        sphere.position.y = particle.R.y;
        sphere.position.z = particle.R.z;
     //   this.fluid.addParticle(particle);
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

    addFluid(vPosition, vSize, fluidType) {
        var volume = vSize.x * vSize.y * vSize.z
        var gapBetweenParticles = configuration.kernerFunctionBase / 2;
        for(let iX=gapBetweenParticles/2; iX<vSize.x; iX+=gapBetweenParticles) 
            for(let iY=gapBetweenParticles/2; iY<vSize.y; iY+=gapBetweenParticles)
                for(let iZ=gapBetweenParticles/2; iZ<vSize.z; iZ+=gapBetweenParticles) {
                    this.addParticle(new THREE.Vector3(vPosition.x+iX, vPosition.y+iY, vPosition.z+iZ), fluidType)
                    console.log("New particle" , vPosition.x+iX, vPosition.y+iY, vPosition.z+iZ)
                }
    }
    


    setup(){
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 1.1*World.SCENE_SIZE[2]
        this.camera.position.x = -10;
        this.camera.position.y = 2*World.SCENE_SIZE[1];
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

        //add mug
        //position, density, fluidIndex, radius, height, thickness
        this.addFluidType(new FluidType(0xef11ab, 3, 1, false));
        console.log(this.fluidTypeList);
        var mug = new ParticleMug(new THREE.Vector3(0,0,0), 3, 0, 10, 10, 2);
        this.addParticleObject(mug);
        
        this.scene.add( cube );
        //window.addEventListener( 'resize', this.onWindowResize, false ); // ????????????
        window.addEventListener('keypress', World.onKeyPress);
        this.renderer.render(this.scene, this.camera);
        window.addEventListener( 'keypress', this.onKeyPress, false );
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

    static onKeyPress(event) {
        console.log(world);
        switch (event.code) {
            case "KeyA":
                world.camera.rotation.y += 0.1;
                break;
            case "KeyD":
                world.camera.rotation.y -= 0.1;
                break;
            case "KeyW":
                world.camera.rotation.x += 0.1;
                break;
            case "KeyS":
                world.camera.rotation.x -= 0.1;
                break;
            case "KeyQ":
                world.camera.rotation.z += 0.1;
                break;
            case "KeyE":
                world.camera.rotation.z -= 0.1;
                break;
            case "KeyZ":
                world.camera.zoom *= 1.1;
                world.camera.updateProjectionMatrix();
                break;
            case "KeyX":
                world.camera.zoom /= 1.1;
                world.camera.updateProjectionMatrix();
                break;
            case "KeyI":
                world.camera.position.y += 10;
                break;
            case "KeyJ":
                world.camera.position.x -= 10;
                break;
            case "KeyK":
                world.camera.position.y -= 10;
                break;
            case "KeyL":
                world.camera.position.x += 10;
                break;            
            case "KeyN":
                world.camera.position.z -= 10;
                break;
            case "KeyM":
                world.camera.position.z += 10;
                break;
        }
        world.renderer.render(world.scene, world.camera);
    }

    onMouseWheelChange(event) {
        //
    }
}
World.SCENE_SIZE = [100, 50, 100]
//                   X    Y   Z
