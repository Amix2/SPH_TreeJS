class ParticleObject{
    constructor(particleGeometries, position, density, fluidIndex){
        this.position = position;
        this.density = density;
        this.fluidIndex = fluidIndex;
        
        var particles = [];
        for(var particleGeometry of particleGeometries)
            particles = particles.concat(particleGeometry.generateParticles(density, fluidIndex));
        
        for(var i = 0; i < particles.length; i++)
            particles[i].R = particles[i].R.add(this.position);
        this.particles = particles;
    }

    move(vector){
        this.position = this.position.add(vector);
        for(var i = 0; i < this.particles.length; i++)
            this.particles[i] = this.particles[i].R.add(this.position);
    }

    rotatateAxis(axis, value){
        for(var i = 0; i < this.particles.length; i++) {
            this.particles[i] = this.particles[i].R.add(this.position.multiplyScalar(-1));
            this.particles[i].position.applyAxisAngle(axis, value);
            this.particles[i] = this.particles[i].R.add(this.position);
          }
    }
}

class ParticleMug extends ParticleObject {
    constructor(position, density, fluidIndex, radius, height, thickness){
        var mugGeometries = [];
        mugGeometries.push(new CyllinderParticleGeometry(position, radius, height, false)); //outer cyllinder
        mugGeometries.push(new CircleParticleGeometry(position - (height / 2.0) - density, 0, radius)); //outer bottom cap
        if(thickness > 0){
            var innerCylPos = position.add(new THREE.Vector3(0, thickness / 2.0, 0));
            var innerCylH = height - thickness;
            var innerCylR = radius - thickness;
            mugGeometries.push(new CyllinderParticleGeometry(innerCylPos, innerCylR, innerCylH, false)); //inner cyllinder
            mugGeometries.push(new CircleParticleGeometry(innerCylPos - (innerCylH / 2.0) - density, 0, innerCylR)); //inner cyllinder
            mugGeometries.push(new CircleParticleGeometry(position + (height / 2.0) + density, innerCylR, radius)); // top rim
        }
            super(mugGeometries, position, density, fluidIndex);        
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
    constructor(position, radius, height, capped){
        super(position);
        this.radius = radius;
        this.height = height;
        this.capped = capped;
    }

    generateParticles(density, fluidIndex){
        var particles = [];
        var layerPosition = new THREE.Vector3(0, this.position - this.height / 2.0, 0);
        for(var i = 0; i <= this.height; i += density){
            if((i === 0 || i + density > this.height) && this.capped === true)
                particles = particles.concat(new CircleParticleGeometry(layerPosition, 0, this.radius).generateParticles(density, fluidIndex));
            else
                particles = particles.concat(new CircleParticleGeometry(layerPosition, this.radius, this.radius).generateParticles(density, fluidIndex));
            layerPosition.add(new THREE.Vector3(0, density, 0));
        }
        return particles;
    }
}

class CircleParticleGeometry extends ParticleGeometry{
    constructor(position, innerRadius, outerRadius){
        super(position);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
    }

    generateParticles(density, fluidIndex){
        var particles = [];
        for(var radius = this.innerRadius; radius <= this.outerRadius; radius += density){
            var placmentPos = new THREE.Vector3(radius, 0, 0);
            for(var i = 0; i < density * radius; i++){
                particles.push(new Particle(placmentPos, fluidIndex))
                placmentPos = placmentPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.PI * 2.0) / (density * radius));
            }
        }
        return particles;
    }
}