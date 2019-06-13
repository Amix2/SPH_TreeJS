// TODO fluidType.density;

function calculateDensityAndPressure(particle, fluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    let h = configuration.kernerFunctionBase;
    let position = particle.position;
    let out_density = 0;
    while((nei = neighbourGenerator.next().value) != null) {
        let dist = SPH.calcVectorDiff(position, nei.position);
    }
}

// aka moveParticle()
function calculatePositionAndVelocityAndAcceleration(particle, fluidType) {
    var neighbourGenerator = getNeighbourParticles(particle);
    let density = particle.density;
    let pressure = particle.pressure;
    let position = particle.position;
    let velocity = particle.velocity;
    var a_pressure = new THREE.Vector3(0,0,0)
    var a_viscosity = new THREE.Vector3(0,0,0)
    while((nei = neighbourGenerator.next().value) != null) {
        let dist = SPH.calcVectorDiff(position, nei.position);
        a_pressure.add(
            SPH.calcAccelerationPressureVectorForOne(
                nei.mass
                , density, nei.density
                , pressure, nei.pressure
                , position, nei.position
                , dist, configuration.kernerFunctionBase, configuration.d_numOfDims
            ));
        a_viscosity.add(
            SPH.calcAccelerationViscosityVectorForOne(
                nei.mass
                , velocity, nei.velocity
                , density, nei.density
                , fluidType.viscosity
                , dist, configuration.kernerFunctionBase, configuration.d_numOfDims
            )
        )
    }
    var a_total = a_pressure.add(a_viscosity).add(new THREE.Vector3(0, -500000, 0));
    //console.log("a_total", a_total)
    particle.acceleration = a_total;
    var newVelocity = SPH.calcVelocityChange(particle.velocity, configuration.deltaT, a_total);
    particle.velocity = newVelocity;
    var newPosition = SPH.calcPositionChange(particle.position, configuration.deltaT, particle.velocity)
    particle.position = newPosition;
}

function calculateDensityInFluidRange(fluid, numOfGroups, thisGroupNumber) {
    let groupRange = Math.floor(fluid.particles.length / numOfGroups)
    let groupIndexStart = Math.min(groupRange * thisGroupNumber, fluid.particles.length)
    let groupIndexEnd = Math.min(groupRange + groupIndexStart, fluid.particles.length)
    for(let i=groupIndexStart; i<groupIndexEnd; i++) {
        let particle = fluid.particles[i]
        let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
        calculateDensityAndPressure(particle, fluidType);
    }
}

function moveParticlesInFluidRange(fluid, numOfGroups, thisGroupNumber) {
    let groupRange = Math.floor(fluid.particles.length / numOfGroups)
    let groupIndexStart = Math.min(groupRange * thisGroupNumber, fluid.particles.length)
    let groupIndexEnd = Math.min(groupRange + groupIndexStart, fluid.particles.length)
    for(let i=groupIndexStart; i<groupIndexEnd; i++) {
        let particle = fluid.particles[i]
        let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
        if(fluidType.isMoveable) {
            calculatePositionAndVelocityAndAcceleration(particle, fluidType);
        }
    }
}



class SPH {
    calcPressureForOne(m, h, dist) {
        return (m*315)/(64*Math.PI*Math.pow(h,9)) * Math.pow(Math.pow(h,2) - Math.pow(dist, 2));
    }
    
    calcDensityForOne(k, pointDensity, fluidAverageDensity) {
        return k*(pointDensity - fluidAverageDensity);
    }

    calcAccelerationForOne(m, pointDensity,neiDensity, pointPosition, neiPosition, pointPressure, neiPressure, pointVelosity, neiVelosity, dist, h) {
        let pressureScalar = m * neiDensity / pointDensity * (-45) / (Math.PI * Math.pow(h, 6)) * (Math.pow(h-dist, 2));
        let pressureGradient = new THREE.Vector3().add(pointPosition).sub(neiPosition).normalize().multiplyScalar(pressureScalar);

        let viscusScalar = m*45 * (h-dist) * viscosityConstant /( (Math.PI * Math.pow(h, 6)) * pointPressure * neiPressure)
        let viscusTerm = new THREE.Vector3().add(pointVelosity).sub(neiVelosity).multiplyScalar(viscusScalar);
        
        return viscusTerm.sub(pressureGradient);
    }
}