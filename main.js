window.onload = function() {
    let world = new World();
};

class World {
    constructor() {
        this.scene = null;
        this.camera = null; 
        this.renderer = null;
       
        this.setup()
    }
    
    setup(){
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.z = 250
        this.camera.position.x = -10;
        this.camera.position.y = 2*World.SCENE_SIZE[1];
        this.camera.lookAt(new THREE.Vector3(World.SCENE_SIZE[0],0,0));
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor("#ffffff");
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        // Resizing window
        //THREEx.WindowResize(this.renderer, this.camera);
        document.body.appendChild( this.renderer.domElement );
        //window.addEventListener( 'resize', this.onWindowResize, false ); // ????????????
        
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
        this.renderer.render(this.scene, this.camera);   
    };

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        //this.controls.handleResize();
    }
}
World.SCENE_SIZE = [100, 50, 100]
//                   X    Y   Z
