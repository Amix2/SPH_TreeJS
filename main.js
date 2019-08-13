
var world;
var mug

window.onload = function() {
    world = new World();

    document.getElementById("addFluidTypeButton").addEventListener("click", function() {
        var promptData = prompt("Insert fluid type data: color (format 0xef11ab), mass per particle, stiffness, viscosity, Cube Render Radius, density is moveable by simulation (true/false)", "color, mass, radius, isMoveable");
        var data = promptData.split(",")
        world.addFluidType(new FluidType(Number(data[0]),Number(data[1]),Number(data[2]),Number(data[3]),Number(data[4]),Number(data[4]),Boolean(data[5])))
    });

    document.getElementById("addFluidButton").addEventListener("click", function() {
        var promptData = prompt("Insert fluid cuboid data: Start Position (Vector3), Size (Vector3), Fluid Type\nposX, posY, posZ, sizeX, sizeY, sizeZ, fluidType", "posX, posY, posZ, sizeX, sizeY, sizeZ, fluidType");
        var data = promptData.split(",")
        world.addFluid(new THREE.Vector3(Number(data[0]), Number(data[1]), Number(data[2]))
            , new THREE.Vector3(Number(data[3]), Number(data[4]), Number(data[5]))
            , Number(data[6]));
        world.render();
    });

    

    //add mug
    //position, density, fluidIndex, radius, height, thickness
    world.addFluidType(new FluidType(0xffffff, 65,5000,4500,0.1, 90,false))
    //mug.rotatateAxis(new THREE.Vector3(0, 1, 1), Math.PI/3)
    
    
    world.addFluidType(new FluidType(0xff0f00,65,3000,4500,0.2, 5,true))
    //world.addParticle(new Vector3(20, 20, 20), 0);
    
    //world.addFluid(new THREE.Vector3(8,5,8), new THREE.Vector3(4,2,4), 1)

    mug = new ParticleMug(new THREE.Vector3(10,7,10), configuration.kernerFunctionBase*0.5, 0, 3, 4, 0);
    world.addParticleObject(mug);
    world.render()

    // var gen = getNeighbourParticles(new THREE.Vector3(10,10,10))
    // console.log(world.fluid.cells)
    // while((part = gen.next().value) != null) {
    //     console.log(part.cellIndex)
    // }

    //window.setInterval(doSPH,800)
    window.requestAnimationFrame(doSPH)
    //doSPH();
    //doSPH();

    
};

function doSPH() {
    console.log("Iteracja XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    //let str = ""
    //for(let i=0; i<world.fluid.particles.length; i++) str += world.fluid.particles[i].position.x + ":" + world.fluid.particles[i].position.y + ":" + world.fluid.particles[i].position.z + " "
    //console.log(str)
    var timeStart = new Date().getTime()
    sphIteration(world.fluid)
    var timeEnd = new Date().getTime()
    console.log("time for iteration: " , timeEnd - timeStart)
    for(let i=0; i<world.fluid.particles.length; i++) {
        let particle = world.fluid.particles[i];
        if(particle.position.y < 0) particle.position.y = 0;
        if(particle.surfaceAvgDistance > 0) {
            //console.log("vec diff", new THREE.Vector3().add(particle.surfaceNormalVector).normalize().sub(new THREE.Vector3().add(particle.wallAcceleration).normalize()))
        }
    }
    world.redrawAllParticles();
    world.render();
    //window.setInterval(doSPH,1000)
    //str = ""
    //for(let i=0; i<world.fluid.particles.length; i++) str += world.fluid.particles[i].position.x + ":" + world.fluid.particles[i].position.y + ":" + world.fluid.particles[i].position.z + " "
    //console.log(str)

    window.requestAnimationFrame(doSPH)
}

var configuration = {
    sceneSize: [20, 20, 20],
    kernerFunctionBase: 1,
    d_numOfDims: 3,
    deltaT: 0.0005,
    gravity: new THREE.Vector3(0, -3000, 0),
    glassBounceMultiplier: 0.7
}

class World {
    constructor() {
        this.scene = null;
        this.camera = null; 
        this.renderer = null;
        this.particleMeshList = []
        this.arrows = [];
        this.fluid = new Fluid();
        this.controls = null;

        this.setup()

        }

    addFluidType(fluidType) {
        this.fluid.addFluidType(fluidType)
    }

    //  creates particle and mesh
    addParticle(pos, typeIndex) {
        if(this.fluid.fluidTypeList.length <= typeIndex) throw "Fluid Type does not exists! Add it first";

        let fluidType = this.fluid.fluidTypeList[typeIndex]
        let particle = new Particle(pos, typeIndex, fluidType.mass)
        let r = fluidType.renderRadius;
        let color = fluidType.color;
        var geometry = new THREE.SphereGeometry( r, 32, 32 );
        var material = new THREE.MeshLambertMaterial( {color: color} );
        var sphere = new THREE.Mesh( geometry, material );
        //sphere.receiveShadow = true;
        //sphere.castShadow = true;
        sphere.position.x = pos.x
        sphere.position.y = pos.y
        sphere.position.z = pos.z
        this.fluid.addParticle(particle);
        this.particleMeshList.push(sphere);
        this.scene.add( sphere );

        // var lineMath = new THREE.Line3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
        // var line = new THREE.Line(
        //     lineMath,//the line3 geometry you have yet
        //     new THREE.LineBasicMaterial({color:0x0000ff})//basic blue color as material
        // );
        // this.arrows.push(lineMath);
        // this.scene.add(line)
    }

    addParticleObject(object){
        console.log(object);
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
        var material = new THREE.MeshLambertMaterial( {color: color} );
        var sphere = new THREE.Mesh( geometry, material );
        sphere.castShadow = true;
        //sphere.receiveShadow = true;
        sphere.position.x = particle.position.x;
        sphere.position.y = particle.position.y;
        sphere.position.z = particle.position.z;
        this.fluid.addParticle(particle);
        this.particleMeshList.push(sphere);
        this.scene.add( sphere );

        // var lineMath = new THREE.Line3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
        // var line = new THREE.Line(
        //     lineMath,//the line3 geometry you have yet
        //     new THREE.LineBasicMaterial({color:0x0000ff})//basic blue color as material
        // );
        // this.arrows.push(lineMath)
        // this.scene.add(line)
    }

    //  updates positions of every particle
    //  mesh and particle indexes must be the same
    redrawAllParticles() {
        if(this.fluid.particles.length != this.particleMeshList.length) throw "mesh and particle index must be the same & list must have the same length"
        var minZ = 1000;
        var maxZ = 0;
        for(let i=0; i<this.particleMeshList.length; i++) {
            let particle = this.fluid.particles[i];
            let mesh = this.particleMeshList[i]
            mesh.position.x = particle.position.x;
            mesh.position.y = particle.position.y;
            mesh.position.z = particle.position.z;
            minZ = Math.min(minZ, mesh.position.y);
            maxZ = Math.max(maxZ, mesh.position.y);
            //this.arrows[i].start = particle.position
        }
        // for(let i=0; i<this.particleMeshList.length; i++) {
        //     let mesh = this.particleMeshList[i]
        //     let col = (mesh.position.y - minZ) / (maxZ - minZ)
        //     mesh.material.color.setRGB (1,col,1)
        // }
    }

    addFluid(vPosition, vSize, fluidType) {
        var gapBetweenParticles = configuration.kernerFunctionBase/2;
        for(let iX=gapBetweenParticles/2; iX<vSize.x; iX+=gapBetweenParticles) 
            for(let iY=gapBetweenParticles/2; iY<vSize.y; iY+=gapBetweenParticles)
                for(let iZ=gapBetweenParticles/2; iZ<vSize.z; iZ+=gapBetweenParticles) {
                    console.log("New particle in Fluid" , vPosition.x+iX, vPosition.y+iY, vPosition.z+iZ)
                    this.addParticle(new THREE.Vector3(vPosition.x+iX, vPosition.y+iY, vPosition.z+iZ), fluidType)
                }
    }
    


    setup(){
        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 0.7*configuration.sceneSize[2]
        this.camera.position.x = 0.3*configuration.sceneSize[0];
        this.camera.position.y = 0.5*configuration.sceneSize[1];
        this.camera.lookAt(new THREE.Vector3(configuration.sceneSize[0],0,0));

        
        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.addEventListener( 'change', this.onEvent );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor("#ffffff");
        this.renderer.setSize( window.innerWidth*0.95, window.innerHeight*0.92 );
        
        // Resizing window
        //THREEx.WindowResize(this.renderer, this.camera);
        document.body.appendChild( this.renderer.domElement );
        
        var geometry = new THREE.BoxGeometry( 1, 2, 3 );
        var material = new THREE.MeshBasicMaterial( { color: "#ff0000" } );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
        //cube.position.set(configuration.sceneSize[0]/2, configuration.sceneSize[1]/2, configuration.sceneSize[2]/2)
        
        // Add cube to Scene
        var aquarium_geo = new THREE.BoxGeometry( configuration.sceneSize[0], configuration.sceneSize[1], configuration.sceneSize[2] );
        var aquarium_mat = new THREE.MeshLambertMaterial( { color: "#f0f0f0" } );
        aquarium_mat.side = THREE.BackSide;
        var aquarium_mesh = new THREE.Mesh( aquarium_geo, aquarium_mat );
        aquarium_mesh.position.set(configuration.sceneSize[0]/2, configuration.sceneSize[1]/2, configuration.sceneSize[2]/2)
        var aquarium_edges = new THREE.EdgesGeometry( aquarium_geo );
        var aquarium_line = new THREE.LineSegments( aquarium_edges, new THREE.LineBasicMaterial( { color: 0x0f0fff } ) );
        aquarium_line.position.x = aquarium_mesh.position.x
        aquarium_line.position.y = aquarium_mesh.position.y
        aquarium_line.position.z = aquarium_mesh.position.z
        this.scene.add( aquarium_line );
        //this.scene.add( aquarium_mesh );

        // LIGHT

        this.renderer.setClearColor( 0xbbbbb1, 1);
        this.renderer.shadowMapEnabled = true;
;
        var ambiColor = "#000000";
        var ambientLight = new THREE.AmbientLight(ambiColor, 5);
        this.scene.add(ambientLight)

        var target = new THREE.Object3D();
        //target.position.set(new THREE.Vector3(configuration.sceneSize[0], 0, configuration.sceneSize[2]));
        target.position.x = 20;
        target.position.y = 1;
        target.position.z = 20;

        var pointColor = "#ffffff";
        var spotLight = new THREE.SpotLight(pointColor);
        spotLight.position.x = 0;
        spotLight.position.y = 25;
        spotLight.position.z = 1;
        spotLight.castShadow = true;
        spotLight.angle = 1;
        //spotLight.target = target;
        spotLight.shadowBias = 0.004;
        spotLight.distance = 0;



        this.scene.add(spotLight);



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
        var glassMoveAngleDiv = 100;    // szklanka obraca się o kąt (Math.PI / glassMoveAngleDiv)
        var glassMoveDistance = 0.005;
        switch (event.code) {
            
            case "KeyQ":
                world.camera.rotation.z += 0.05;
                break;
            case "KeyE":
                world.camera.rotation.z -= 0.05;
                break;
            case "KeyZ":
                world.camera.zoom *= 1.05;
                world.camera.updateProjectionMatrix();
                break;
            case "KeyX":
                world.camera.zoom /= 1.05;
                world.camera.updateProjectionMatrix();
                break;
            case "KeyI":
                world.camera.position.y += 5;
                break;
            case "KeyJ":
                world.camera.position.x -= 5;
                break;
            case "KeyK":
                world.camera.position.y -= 5;
                break;
            case "KeyL":
                world.camera.position.x += 5;
                break;            
            case "KeyN":
                world.camera.position.z -= 5;
                break;
            case "KeyM":
                world.camera.position.z += 5;
                break;

            case "Digit1":
                mug.rotatateAxis(new THREE.Vector3(1, 0, 0), Math.PI / glassMoveAngleDiv)
                break
            case "Digit2":
                mug.rotatateAxis(new THREE.Vector3(1, 0, 0), -Math.PI / glassMoveAngleDiv)
                break
            case "Digit3":
                mug.rotatateAxis(new THREE.Vector3(0, 1, 0), Math.PI / glassMoveAngleDiv)
                break
            case "Digit4":
                mug.rotatateAxis(new THREE.Vector3(0, 1, 0), -Math.PI / glassMoveAngleDiv)
                break
            case "Digit5":
                mug.rotatateAxis(new THREE.Vector3(0, 0, 1), Math.PI / glassMoveAngleDiv)
                break
            case "Digit6":
                mug.rotatateAxis(new THREE.Vector3(0, 0, 1), -Math.PI / glassMoveAngleDiv)
                break
            case "KeyW":
                mug.move(new THREE.Vector3(glassMoveDistance, 0, 0))
                break
            case "KeyS":
                mug.move(new THREE.Vector3(-glassMoveDistance ,0 , 0))
                break
            case "KeyA":
                mug.move(new THREE.Vector3(0, 0, -glassMoveDistance))
                break
            case "KeyD":
                mug.move(new THREE.Vector3(0, 0, glassMoveDistance))
                break
            case "KeyR":
                mug.move(new THREE.Vector3(0, -glassMoveDistance, 0))
                break
            case "KeyF":
                mug.move(new THREE.Vector3(0, glassMoveDistance, 0))
                break

        }
        world.renderer.render(world.scene, world.camera);
    }

    onEvent(){
        world.renderer.render(world.scene, world.camera);
    }

    onMouseWheelChange(event) {
        //
    }
}
//                   X    Y   Z
