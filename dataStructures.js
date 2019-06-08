class FluidType {
    constructor(color, mass, renderRadius, isMoveable) {
        this.color = color;
        this.mass = mass;
        this.renderRadius = renderRadius;
        this.isMoveable = isMoveable;	// szklanka to też typ płyn tylko bez możliwości przemieszczania
    }
}

class Fluid {
    constructor(configuration) {
        this.particles = [];
        
        let numOfCells = Math.ceil(configuration.sceneSize[0] / configuration.kernerFunctionBase) 
            * Math.ceil(configuration.sceneSize[1] / configuration.kernerFunctionBase) 
            * Math.ceil(configuration.sceneSize[2] / configuration.kernerFunctionBase);
        this.cells = new Array(numOfCells);
        this.fluidTypeList = []
    }

    addFluidType(fluidType) {
        this.fluidTypeList.push(fluidType);
    }

    addParticle(particle) {
        this.particles.push(particle);
    }
}

class Particle {
    constructor(R, fluidTypeIndex) {
        this.R = R; // położenie
        this.fluidTypeIndex = fluidTypeIndex;
        
        self.V = new Vector3(0, 0, 0);    	// prędkość
        self.A = new Vector3(0, 0, 0);    // przyspieszenie
        self.g = 0;   // gęstość
        self.p = 0;   // ciśnienie
        //self.cell = Cell.from(r)  // komórka w której sie znajduje -> można ją dostać z położenia w czasie stałym (!)
    }
}

function* getNeighbourParticlesList(particlePosition)	{// generator dający wszystkie sząstki z sąsiednich komórek
    
}

class Cell {
    constructor(offsetX, offsetY, offsetZ) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.offsetZ = offsetZ;
        this.particles = [];
    }
    
    getMyCellIndex() {
    }
    
    getMyCellOffsetX() {
    }
    getMyCellOffsetY() {
    }
    getMyCellOffsetZ() {
    }
    
}
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    x() { return this.x }
    y() { return this.y }
    z() { return this.z }

    getTreeVector() {
        return new THREE.Vector3( this.x, this.y , this.z );
    }
}


function getZindex(x, y, z) {
    return mortonEncode_magicbits(x, y, z);
}

// source:    https://www.forceflow.be/2013/10/07/morton-encodingdecoding-through-bit-interleaving-implementations/
// method to seperate bits from a given integer 3 positions apart
function splitBy3(a) {
    var x = a & 0x1fffff; // we only look at the first 21 bits
    x = (x | x << 32) & 0x1f00000000ffff; // shift left 32 bits, OR with self, and 00011111000000000000000000000000000000001111111111111111
    x = (x | x << 16) & 0x1f0000ff0000ff; // shift left 32 bits, OR with self, and 00011111000000000000000011111111000000000000000011111111
    x = (x | x << 8) & 0x100f00f00f00f00f; // shift left 32 bits, OR with self, and 0001000000001111000000001111000000001111000000001111000000000000
    x = (x | x << 4) & 0x10c30c30c30c30c3; // shift left 32 bits, OR with self, and 0001000011000011000011000011000011000011000011000011000100000000
    x = (x | x << 2) & 0x1249249249249249;
    return x;
}
    
function mortonEncode_magicbits(x, y, z) {
    var answer = 0;
    answer |= splitBy3(x) | splitBy3(y) << 1 | splitBy3(z) << 2;
    return answer;
}