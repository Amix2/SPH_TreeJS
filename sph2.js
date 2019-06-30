// TODO fluidType.density;

function calculateDensityAndPressure(particle, fluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    let h = configuration.kernerFunctionBase;
    let position = particle.position;
    let mass = fluidType.mass;
    let k_fluidStiffness = fluidType.stiffness
    let fluidDensity = fluidType.density;

    let pointDensity = 0;

    while ((nei = neighbourGenerator.next().value) != null) {
        let dist = SPH2.calcVectorDiff(position, nei.position);
        if(dist > configuration.kernerFunctionBase) continue;
        pointDensity += SPH2.calcDensityForOne(mass, h, dist);
    }
    particle.density = pointDensity;
    particle.pressure = SPH2.calcPressureForOne(k_fluidStiffness, pointDensity, fluidDensity)
}

function calculateAcceleration(particle, fluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    let h = configuration.kernerFunctionBase;
    let gravityVector = configuration.gravity;
    let mass = fluidType.mass;
    let viscosity = fluidType.viscosity
    let density = particle.density;
    let pressure = particle.pressure;
    let position = particle.position;
    let velocity = particle.velocity;
    particle.surfaceMinDistance = configuration.kernerFunctionBase*2

    var pointAcceleration = new THREE.Vector3(0, 0, 0)
    var glassSurfaceVector = new THREE.Vector3(0, 0, 0);
    var neiCount = 0;
    var surfaceAvgDistance = 0;
    while ((nei = neighbourGenerator.next().value) != null) {
        //console.log("nei", nei)
        let dist = SPH2.calcVectorDiff(position, nei.position);
        if(dist > configuration.kernerFunctionBase) continue;
        
        let neiFluidType = world.fluid.fluidTypeList[nei.fluidTypeIndex];
        if(neiFluidType.isMoveable) {   // nei is fluid particle
            pointAcceleration.add(SPH2.calcAccelerationForOne(
                mass,
                density, nei.density,
                position, nei.position,
                pressure, nei.pressure,
                velocity, nei.velocity,
                viscosity, dist, h
            ))
            neiCount++; // czą
        } else {    // nei is glass particle
            surfaceAvgDistance = (surfaceAvgDistance * neiCount + dist) / (neiCount + 1)    // średnia odległość cząstek szklanki
            particle.surfaceMinDistance = Math.min(particle.surfaceMinDistance, dist)
            //  vektor normalny powierzchni
            let currentSurfacePointsVector = new THREE.Vector3().add(position).sub(nei.position);
            currentSurfacePointsVector.divideScalar(Math.pow(currentSurfacePointsVector.length(), 3))
            glassSurfaceVector.add(currentSurfacePointsVector)

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //      METODA BRZEGOWA #1
            //      Cząstka szklanki zamieniana jest na cząstke płynu 
            //          TODO: prędkość z https://www.sciencedirect.com/science/article/pii/S0032591018305424 wzór (13)
            pointAcceleration.add(SPH2.calcAccelerationForOne(
                mass,
                density, density,
                position, nei.position,
                pressure, pressure,
                velocity, new THREE.Vector3(),
                viscosity, dist, h
            ))
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
    }
    glassSurfaceVector.normalize();
    // zamienianie cząstki szklanki na neiCount cząstek płynu w odległości particle.surfaceMinDistance i płożeniu zgodym z glassSurfaceVector
    //console.log("before", pointAcceleration)
    if(glassSurfaceVector.length() > 0 && false) {   // near glass
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //      METODA BRZEGOWA #2
        //      dodawanie cząstek pomiędzy szklanką z cząstką płynu, ważne jest wyliczanie wektora normalnego szklanki glassSurfaceVector
        let distanceToSurfaceParticle = particle.surfaceMinDistance
        let glassParticlePosOffset = new THREE.Vector3().sub(glassSurfaceVector).multiplyScalar(distanceToSurfaceParticle);
        let glassParticlePos = new THREE.Vector3().add(particle.position).add(glassParticlePosOffset);
        for (let i = 0; i < neiCount; i++) {
            pointAcceleration.add(SPH2.calcAccelerationForOne(
                mass,
                density, density,
                position, glassParticlePos,
                pressure, pressure,
                velocity, velocity,
                viscosity, distanceToSurfaceParticle, h
            ))
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    //if(Math.abs(pointAcceleration.x) > 100) throw "pointAcceleration";

    particle.acceleration = pointAcceleration.add(gravityVector);
    particle.neighbourCount = neiCount;
    particle.surfaceAvgDistance = surfaceAvgDistance;
    particle.surfaceNormalVector = glassSurfaceVector;
    //console.log("glassSurfaceVector", glassSurfaceVector)
}

function mirrorVector(orgVector, referenceVector) { // referenceVector is normalized    
    //  https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
    return new THREE.Vector3().add(orgVector).sub(new THREE.Vector3().add(referenceVector).multiplyScalar(orgVector.dot(referenceVector) * 2))
}

function calculateVelosityAndPosition(particle, fluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    let h = configuration.kernerFunctionBase;
    let gravityVector = configuration.gravity;
    let mass = fluidType.mass;
    let density = particle.density;
    let pressure = particle.pressure;
    let position = particle.position;
    let velocity = particle.velocity;
    let acceleration = particle.acceleration
    let dt = configuration.deltaT;

    var pointVelocity;
    var pointPosition;

    pointVelocity = SPH2.calcVelocityChange(velocity, acceleration, dt);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //      METODA BRZEGOWA #3
    //      Odbicie sprężyste z mnożnikiem po prędkościach jeśli cząstka jest (zadana odległość) od najbliższej cząstki szklanki, ważne jest wyliczanie wektora normalnego szklanki particle.surfaceNormalVector
    if(particle.velocity.angleTo(particle.surfaceNormalVector) > Math.PI/2 && particle.surfaceMinDistance < configuration.kernerFunctionBase/2) {
        particle.velocity = mirrorVector(pointVelocity, particle.surfaceNormalVector).multiplyScalar(configuration.glassBounceMultiplier);
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    //if(Math.abs(particle.velocity.x) > 100) throw "particle.velocity";
    pointPosition = SPH2.calcPositionChange(position, particle.velocity, dt);
    particle.position = pointPosition;
}

function calculateGlassAttributesForOne(glassParticle, glassFluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    var kernelSum = 0;
    var velosityKernelSum = new THREE.Vector3();
    var pressureKernelSum = 0 ;
    var gravityDifKernelSum = new THREE.Vector3();
}

function calculateDensityInFluidRange(fluid, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        let particle = fluid.particles[i]
        let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
        calculateDensityAndPressure(particle, fluidType);
    }
}

function calculateAccelerationInFluidRange(fluid, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        let particle = fluid.particles[i]
        let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
        if (fluidType.isMoveable) calculateAcceleration(particle, fluidType);
    }
}

function calculateVelosityAndPositionInFluidRange(fluid, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
        let particle = fluid.particles[i]
        let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
        if (fluidType.isMoveable) calculateVelosityAndPosition(particle, fluidType);
    }
}

function densityShepardFilter(fluid) {
    var newDensity = [];
    for(let particle in fluid.particles) {

    }
}

function sphIteration(fluid) {
    calculateDensityInFluidRange(fluid, 0, fluid.particles.length)
    calculateAccelerationInFluidRange(fluid, 0, fluid.particles.length)
    calculateVelosityAndPositionInFluidRange(fluid, 0, fluid.particles.length)
}


class SPH2 {

    static calcVectorDiff(ri, rj) {
        return Math.sqrt(Math.pow(ri.x - rj.x, 2) + Math.pow(ri.y - rj.y, 2) + Math.pow(ri.z - rj.z, 2));
    }

    static calcDensityForOne(m, h, dist) {
        if(dist > configuration.kernerFunctionBase) return 0;
        return (m * 315) 
        / (64 * Math.PI * Math.pow(h, 9)) 
        * Math.pow(Math.pow(h, 2) - Math.pow(dist, 2), 3);
    }

    static calcPressureForOne(k, pointDensity, fluidAverageDensity) {
        //console.log("pointDensity", pointDensity, "fluidAverageDensity", fluidAverageDensity)
        //return k * (Math.pow(pointDensity / fluidAverageDensity, 7) - 1)
        return k * (pointDensity - fluidAverageDensity);
    }

    static calcAccelerationForOne(m, pointDensity, neiDensity, pointPosition, neiPosition, pointPressure, neiPressure, pointVelosity, neiVelosity, viscosityConstant, dist, h) {
        if(dist > configuration.kernerFunctionBase) return new THREE.Vector3(0,0,0);
        let pressureScalar = m
            * (pointPressure / Math.pow(pointDensity, 2)
                + neiPressure / Math.pow(neiDensity, 2))
            * (-45) / (Math.PI * Math.pow(h, 6)) 
            * (Math.pow(h - dist, 2));
        let pressureGradient = new THREE.Vector3().add(pointPosition).sub(neiPosition).normalize().multiplyScalar(pressureScalar);

        let viscusScalar = m * 45 * (h - dist) * viscosityConstant 
            / Math.PI / Math.pow(h, 6) / pointDensity / neiDensity
        let viscusTerm = new THREE.Vector3().add(neiVelosity).sub(pointVelosity).normalize().multiplyScalar(viscusScalar);
        //console.log("pressureGradient", pressureGradient, "viscusTerm", viscusTerm)
       // return new THREE.Vector3().sub(pressureGradient)
        return viscusTerm.sub(pressureGradient);
    }

    static calcVelocityChange(pointVelocity, pointAcceleration, dt) {
        pointVelocity.add(new THREE.Vector3().add(pointAcceleration).multiplyScalar(dt))
        return pointVelocity//.multiplyScalar(0.9);
    }

    static calcPositionChange(pointPosition, pointVelocity, dt) {
        pointPosition.add(new THREE.Vector3().add(pointVelocity).multiplyScalar(dt))
        return pointPosition;
    }

}