class FluidType {
    constructor(color, mass, renderRadius, isMoveable) {
        this.color = color;
        this.mass = mass;
        this.renderRadius = renderRadius;
        this.isMoveable = isMoveable;	// szklanka to też typ płyn tylko bez możliwości przemieszczania
    }
}

class Fluid {
    constructor() {
        this.particles = [];
        
        let numOfCells = (Math.ceil(configuration.sceneSize[0] / configuration.kernerFunctionBase))
            * (Math.ceil(configuration.sceneSize[1] / configuration.kernerFunctionBase) )
            * (Math.ceil(configuration.sceneSize[2] / configuration.kernerFunctionBase));
        this.cells = new Array(numOfCells);
        this.createAllCells()
        this.fluidTypeList = []
    }

    createAllCells() {
        let kernelBase = configuration.kernerFunctionBase;
        for(let iX=0; iX<configuration.sceneSize[0]; iX+=kernelBase) 
            for(let iY=0; iY<configuration.sceneSize[0]; iY+=kernelBase)
                for(let iZ=0; iZ<configuration.sceneSize[0]; iZ+=kernelBase) {
                    this.cells[getZindex(Math.floor(iX/kernelBase), Math.floor(iY/kernelBase), Math.floor(iZ/kernelBase))] 
                        = new Cell(Math.floor(iX/kernelBase), Math.floor(iY/kernelBase), Math.floor(iZ/kernelBase));
                }
    }

    addFluidType(fluidType) {
        this.fluidTypeList.push(fluidType);
    }

    addParticle(particle) {
        this.particles.push(particle);
        this.assignCellToParticle(particle)
    }

    assignCellToParticle(particle) {
        let kernelBase = configuration.kernerFunctionBase;
        let cellIndex = getZindex(Math.floor(particle.R.x/kernelBase), Math.floor(particle.R.y/kernelBase), Math.floor(particle.R.z/kernelBase))
        if(particle.cellIndex != null)  {   // remove from old cell list if assigned
            let particleListInOldCell = this.cells[particle.cellIndex].particles;
            particleListInOldCell.splice(particleListInOldCell.indexOf(particle));
        }
        // add to new cell
        this.cells[cellIndex].particles.push(particle)
        particle.cellIndex = cellIndex;
    }
}
function* getNeighbourParticles(particlePosition)	{// generator dający wszystkie sząstki z sąsiednich komórek
    let kernelBase = configuration.kernerFunctionBase;
    let pX = Math.floor(particlePosition.x / kernelBase);
    let pY = Math.floor(particlePosition.y / kernelBase);
    let pZ = Math.floor(particlePosition.z / kernelBase);
    for(let oX = -1; oX < 2; oX ++)
        for(let oY = -1; oY < 2; oY ++)
            for(let oZ = -1; oZ < 2; oZ ++) {
                let cellIndex = getZindex(pX+oX, pY+oY, pZ+oZ);
                for(let i=0; i<world.fluid.cells[cellIndex].particles.length; i++) {
                    yield world.fluid.cells[cellIndex].particles[i];

                }
            }
    return null
}

class Particle {
    constructor(R, fluidTypeIndex) {
        this.R = R; // położenie
        this.fluidTypeIndex = fluidTypeIndex;
        
        this.V = new THREE.Vector3(0, 0, 0);    	// prędkość
        this.A = new THREE.Vector3(0, 0, 0);    // przyspieszenie
        this.g = 0;   // gęstość
        this.p = 0;   // ciśnienie
        this.cellIndex = null;
        //self.cell = Cell.from(r)  // komórka w której sie znajduje -> można ją dostać z położenia w czasie stałym (!)
    }
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
    return mortonEncode_for(x, y, z);
}

// source:    https://www.forceflow.be/2013/10/07/morton-encodingdecoding-through-bit-interleaving-implementations/
// method to seperate bits from a given integer 3 positions apart
function splitBy3(a) {
    var x = a  // we only look at the first 21 bits
    x = (x | x << 32) & 0x1f00000000ffff; // shift left 32 bits, OR with self, and 00011111000000000000000000000000000000001111111111111111
    x = (x | x << 16) & 0x1f0000ff0000ff; // shift left 32 bits, OR with self, and 00011111000000000000000011111111000000000000000011111111
    x = (x | x << 8) & 0x100f00f00f00f00f; // shift left 32 bits, OR with self, and 0001000000001111000000001111000000001111000000001111000000000000
    x = (x | x << 4) & 0x10c30c30c30c30c3; // shift left 32 bits, OR with self, and 0001000011000011000011000011000011000011000011000011000100000000
    x = (x | x << 2) & 0x1249249249249249;
    console.log(x)
    return x;
}
    
function mortonEncode_magicbits(x, y, z) {
    var answer = 0;
    answer |= splitBy3(x) | splitBy3(y) << 1 | splitBy3(z) << 2;
    return answer;
}

function mortonEncode_for(x, y, z){
    var answer = 0;
    for (let i = 0; i < (30)/3; ++i) {
    answer |= ((x & (1 << i)) << 2*i) | ((y & (1 << i)) << (2*i + 1)) | ((z & (1 << i)) << (2*i + 2));
    }
    return answer;
    }