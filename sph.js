// TODO fluidType.density;

function calculateDensityAndPressure(particle, fluidType) {
    let g0_fluidDensity = fluidType.density;
    //console.log("g0_fluidDensity", g0_fluidDensity)
    let k_fluidStiffness = fluidType.stiffness;
    //console.log(particle)
    var neighbourGenerator = getNeighbourParticles(particle)
    var density = 0;
    while((nei = neighbourGenerator.next().value) != null) {
        let dist = SPH.calcVectorDiff(particle.position, nei.position);
        density += SPH.calcDensityForOne(nei.mass, dist, configuration.kernerFunctionBase, configuration.d_numOfDims)
    }
    particle.density = density;
    if(density < 1) 
        particle.density = 1;
    particle.pressure = SPH.calcPressure(k_fluidStiffness, particle.density, g0_fluidDensity);
    //console.log("particle.density", particle.density)
    //console.log("particle.pressure", particle.pressure)
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
        .position = newPosition;
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

    // 1
    static calcMass(g0, V, N) {
        return g0 * V / N;
    }

    // 2
    static calcVectorDiff(ri, rj) {
        return Math.sqrt(Math.pow(ri.x - rj.x, 2) + Math.pow(ri.y - rj.y, 2) + Math.pow(ri.z - rj.z, 2));
    }

    // 3
    // x - argument, h - kernelBase, d - ilość wymiarów (3?)
    static calcKernel(x, h, d) {   
        //console.log("calcKernel x, h", x, h)
        var out;
        if (0 <= x && x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - x * x + x * x * x / 2) / Math.pow(h, d);
        } else if (h <= x && x < 2 * h) {
            return 3 / (2 * Math.PI) * (Math.pow(2 - x, 3) / 6) / Math.pow(h, d);
        } else if (2 * h <= x) {
            return 0;
        }
    }

    static calcKernelDerivative(x, h, d) {
        if (0 < x && x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 * x + 3 * x * x / 2) / Math.pow(h, d);
        } else if (h < x && x< 2 * h) {
            return 3 / (2 * Math.PI) * (-3) * (Math.pow(2 - x, 2) / 6) / Math.pow(h, d);
        } else if (2 * h < x) {
            return 0;
        }
    }

    static calcKernelSecondDerivative(x, h, d) {
        if (0 < x && x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 + 6 * x / 2) / Math.pow(h, d);
        } else if (h < x && x< 2 * h) {
            return 3 / (2 * Math.PI) * 6 * (2 - x) / 6 / Math.pow(h, d);
        } else if (2 * h < x) {
            return 0;
        }
    }

    // 4
    // mj - masa sąsiada, dist - ||Ri - Rj||, h - kernelBase, d - ilość wymiarów (3?)
    static calcDensityForOne(mj, dist, h, d = 3) {  
        //console.log("this.calcKernel(dist, h, d)", this.calcKernel(dist, h, d))
        return mj * this.calcKernel(dist, h, d);
        let g = 0;
        for (let i = 0; i < j; ++i) {
            g += this.calcKernel(q[i][j], h);
        }
        return mj * g / Math.pow(h, d);
    }

    // 5
    // gi = gęstosć cząstki, g0 = gęstość płynu
    static calcPressure(k, gi, g0) {
        return k * (Math.pow(gi / g0, 7) - 1);
    }

    // 6 
    // mj - masa J, pi - ciśnienie i, pj - ciśnienie j, gi - gęstość i, gj - gęstość j, dist - ||Ri - Rj||
    static calcAccelerationPressureVectorForOne(m_j, g_i, g_j, p_i, p_j, pos_i, pos_j, dist, h, d) {
        let a = new THREE.Vector3().add(pos_i).sub(pos_j).normalize();
        return a.multiplyScalar(
            (-m_j / (g_j * g_i )) *
            (p_i / Math.pow(g_i, 2) + p_j / Math.pow(g_j, 2)) *
            this.calcKernelDerivative(dist, h, d));
    }

    // 7
    // mj- masa J, vi- prędkość i, vj- prędkość j, gi- gęstość i, gj- gęstość j, theta- lepkość, dist- ||Ri - Rj||, h- kernelBase, d- ilość wymiarów (3?)
    static calcAccelerationViscosityVectorForOne(mj, vi, vj, gi, gj, theta, dist, h, d) {
        var res = new THREE.Vector3(0, 0, 0);
        res.add(vi.divideScalar(Math.pow(gi, 2)));
        res.add(vj.divideScalar(Math.pow(gj, 2)));
        res.multiplyScalar((-1) * mj/gj * theta * this.calcKernelSecondDerivative(dist, h, d));
        return res;

    }

    // 8
    static calcAOther(G) {
        return G;
    }

    // 9 // będzie licznone pięrwo wyżej bo strasznie dużo różnych parametrów
    static calcAVector(mj, gj, vj, qj, gi, v, q, p, pj, theta, rj, G) {
        return this.calcPressureVector(mj, gj, gi, pj, qj, p, q, rj).add(
            this.calcViscosityVector(mj, gj, gi, vj, qj, v, q, rj)).add(
            this.calcAOther(G))
    }

    // 10
    // vi- prędkosc z t-dt/2, ai- przyspieszenie w iteracji, 
    // return prędkosc w t+dt/2
    static calcVelocityChange(vi, dt, ai) {
        vi.add(ai.multiplyScalar(dt))
        return vi;
    }

    // 11
    // xi- położenie w t, vi- prędkość w t+dt/2
    // return położenie w t+dt
    static calcPositionChange(xi, dt, vi) {
        xi.add(vi.multiplyScalar(dt))
        return xi;
    }
}