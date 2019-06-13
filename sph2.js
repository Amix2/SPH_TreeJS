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

    var pointAcceleration = new THREE.Vector3(0, 0, 0)

    while ((nei = neighbourGenerator.next().value) != null) {
        //console.log("nei", nei)
        let dist = SPH2.calcVectorDiff(position, nei.position);
        if(dist > configuration.kernerFunctionBase) continue;
        pointAcceleration.add(SPH2.calcAccelerationForOne(
            mass,
            density, nei.density,
            position, nei.position,
            pressure, nei.pressure,
            velocity, nei.velocity,
            viscosity, dist, h
        ))
    }
    console.log("pointAcceleration: ", pointAcceleration)
    particle.acceleration = pointAcceleration.add(gravityVector);
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
    particle.velocity = pointVelocity;
    pointPosition = SPH2.calcPositionChange(position, pointVelocity, dt);
    particle.position = pointPosition;
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
        return (m * 315) / (64 * Math.PI * Math.pow(h, 9)) * Math.pow(Math.pow(h, 2) - Math.pow(dist, 2), 3);
    }

    static calcPressureForOne(k, pointDensity, fluidAverageDensity) {
        return k * (pointDensity - fluidAverageDensity);
    }

    static calcAccelerationForOne(m, pointDensity, neiDensity, pointPosition, neiPosition, pointPressure, neiPressure, pointVelosity, neiVelosity, viscosityConstant, dist, h) {
        let pressureScalar = m
            * pointPressure / Math.pow(pointDensity, 2)
            * neiPressure / Math.pow(neiDensity, 2)
            * (-45) / (Math.PI * Math.pow(h, 6)) * (Math.pow(h - dist, 2));
        let pressureGradient = new THREE.Vector3().add(pointPosition).sub(neiPosition).normalize().multiplyScalar(pressureScalar);

        let viscusScalar = m * 45 * (h - dist) * viscosityConstant / Math.PI / Math.pow(h, 6) / pointDensity / neiDensity
        let viscusTerm = new THREE.Vector3().add(pointVelosity).sub(neiVelosity).multiplyScalar(viscusScalar);

        return viscusTerm.sub(pressureGradient);
    }

    static calcVelocityChange(pointVelocity, pointAcceleration, dt) {
        pointVelocity.add(new THREE.Vector3().add(pointAcceleration).multiplyScalar(dt))
        return pointVelocity;
    }

    static calcPositionChange(pointPosition, pointVelocity, dt) {
        pointPosition.add(new THREE.Vector3().add(pointVelocity).multiplyScalar(dt))
        return pointPosition;
    }

}