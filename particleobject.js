class ParticleObject{
    constructor(particleGeometries, position, density, fluidIndex){
        this.position = position;
        this.density = density;
        this.fluidIndex = fluidIndex;
        
        var particles = [];
        for(var particleGeometry of particleGeometries)
            particles = particles.concat(particleGeometry.generateParticles(density, fluidIndex));
        
        
        for(var i = 0; i < particles.length; i++){
           // console.log(particles[i]);
            particles[i].position.add(position);
        }
        this.particles = particles;
    }

    move(vector){
        this.position = this.position.add(vector);
        for(var i = 0; i < this.particles.length; i++)
            this.particles[i].position.add(vector);
    }

    rotatateAxis(axis, value){
        for(var i = 0; i < this.particles.length; i++) {
            this.particles[i].position.sub(this.position);
            this.particles[i].position.applyAxisAngle(axis, value);
            this.particles[i].position.add(this.position);
        }
    }
}

class ParticleMug extends ParticleObject {
    constructor(position, gap, fluidIndex, radius, height, thickness){
        var mugGeometries = [];
        mugGeometries.push(new CyllinderParticleGeometry(new THREE.Vector3(), radius, height)); //outer cyllinder
        mugGeometries.push(new CyllinderParticleGeometry(new THREE.Vector3(), radius-gap, height-gap)); //inner cyllinder
        //mugGeometries.push(new CircleParticleGeometry(new THREE.Vector3().sub(new THREE.Vector3(0, height * 0.5 + 0.5*gap, 0)), radius)); //outer bottom cap
        //mugGeometries.push(new CircleParticleGeometry(new THREE.Vector3().sub(new THREE.Vector3(0, (height-gap) * 0.5, 0)), radius-gap))
        if(thickness > 0){
            var innerCylH = height - thickness;
            var innerCylR = radius - thickness;
            mugGeometries.push(new CyllinderParticleGeometry(new THREE.Vector3(), innerCylR, innerCylH)); //inner cyllinder
            mugGeometries.push(new CircleParticleGeometry(new THREE.Vector3().sub(new THREE.Vector3(0, innerCylH * 0.5 + 0.5*gap, 0)), innerCylR)); //inner cyllinder
  //          mugGeometries.push(new CircleParticleGeometry(position + (height / 2.0) + gap, innerCylR, radius)); // top rim
        }
        super(mugGeometries, position, gap, fluidIndex);        
        this.radius = radius;
        this.height = height;
        this.thickness = thickness;
    }
}

class ParticleGeometry{
    constructor(position){
        if (this.constructor === ParticleGeometry) {
            throw new TypeError('Abstract class ParticleGeometry cannot be instantiated directly.'); 
        }
        if (this.generateParticles === undefined) {
            throw new TypeError('Classes extending the ParticleGeometry abstract class must implement generateParticles(density: number) function');
        }

        this.position = position;
    }


}

class CyllinderParticleGeometry extends ParticleGeometry{
    constructor(position, radius, height, capped = false){
        super(position);
        this.radius = radius;
        this.height = height;
        this.capped = capped;
    }

    generateParticles(gap, fluidIndex){
        var particles = [];
        var layerPosition = new THREE.Vector3(0, this.position.y - this.height * 0.5, 0);
        for(let i = 0; i <= this.height; i += gap){
            if((i === 0 || i + gap > this.height) && this.capped === true)
                particles = particles.concat(new CircleParticleGeometry(layerPosition, this.radius).generateParticles(gap, fluidIndex));
            else
                particles = particles.concat(new CircleParticleGeometry(layerPosition, this.radius, true).generateParticles(gap, fluidIndex));
            layerPosition.add(new THREE.Vector3(0, gap, 0));
        }
        console.log(particles);
        return particles;
    }
}

class CircleParticleGeometry extends ParticleGeometry{
    constructor(position, radius, isRing = false){
        super(position);
        this.radius = radius;
        this.isRing = isRing;
    }

    generateParticles(gap, fluidIndex){
        var particles = [];
        const rotationAxis = new THREE.Vector3(0, 1, 0);
        const eps = 0.001;

        if(this.isRing === false){
            const moveOut = new THREE.Vector3(-gap * 0.5, 0, -gap * Math.sqrt(3) * 0.5);
            const amountOfFaces = 6;

            var cursor = new THREE.Vector3();
            var moveDirection = new THREE.Vector3(gap, 0, 0);

            particles.push(new Particle(new THREE.Vector3().add(this.position), fluidIndex));
            cursor.add(moveOut);
            var currentFaceLength = 1;
            while(currentFaceLength * gap * Math.sqrt(3) * 0.5 <= this.radius + eps){
                for(let i = 0; i < amountOfFaces; i++){
                    for(let j = 0; j < currentFaceLength; j++){
                        if(cursor.length() <= this.radius + eps){
                            particles.push(new Particle(new THREE.Vector3().add(cursor).add(this.position), fluidIndex));
                        }
                        cursor.add(moveDirection);
                    }
                    moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/3);
                }
                cursor.add(moveOut);
                currentFaceLength++; 
            }
        }
        else{
            var cursor = new THREE.Vector3(this.radius, 0, 0);
            const amount = Math.ceil((2 * Math.PI) / Math.acos(1 - (Math.pow(gap, 2) * 0.5 / Math.pow(this.radius, 2))));
            console.log(amount)
            const angle = (2 * Math.PI) / amount;
            for(let i = 0; i < amount; i++){
                particles.push(new Particle(new THREE.Vector3().add(cursor).add(this.position), fluidIndex));
                cursor.applyAxisAngle(rotationAxis, angle);
            }
        }
        return particles;
    }
}
