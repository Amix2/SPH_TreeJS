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
        if (0 < x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - x * x + x * x * x / 2) / Math.pow(h, d);
        } else if (h < x < 2 * h) {
            return 3 / (2 * Math.PI) * (Math.pow(2 - x, 3) / 6) / Math.pow(h, d);
        } else if (2 * h < x) {
            return 0;
        }
    }

    static calcKernelDerivative(x, h, d) {
        if (0 < x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 * x + 3 * x * x / 2) / Math.pow(h, d);
        } else if (h < x < 2 * h) {
            return 3 / (2 * Math.PI) * (-3) * (Math.pow(2 - x, 2) / 6) / Math.pow(h, d);
        } else if (2 * h < x) {
            return 0;
        }
    }

    static calcKernelSecondDerivative(x, h, d) {
        if (0 < x < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 + 6 * x / 2) / Math.pow(h, d);
        } else if (h < x < 2 * h) {
            return 3 / (2 * Math.PI) * 6 * (2 - x) / 6 / Math.pow(h, d);
        } else if (2 * h < x) {
            return 0;
        }
    }

    // 4
    // mj - masa sąsiada, dist - ||Ri - Rj||, h - kernelBase, d - ilość wymiarów (3?)
    static calcDensityForOne(mj, dist, h, d = 3) {  
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

    // 6 TOOOOODOOOOOO
    // mj - masa J, pi - ciśnienie i, pj - ciśnienie j, gi - gęstość i, gj - gęstość j, dist - ||Ri - Rj||
    static calcPressureVectorForOne(mj, gj, gi, pj, qj, p, q, rj) {
        let a = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < j; ++i) {
            a.add((p[i].divideScalar(q[i] * q[i]).add(pj.divideScalar(qj * qj))).multiplyScalar(this.calcKernelDerivative(rj[i])))
        }
        return a.multiplyScalar(mj / gj / gi);
    }

    // 7
    // mj- masa J, vi- prędkość i, vj- prędkość j, gi- gęstość i, gj- gęstość j, theta- lepkość, dist- ||Ri - Rj||, h- kernelBase, d- ilość wymiarów (3?)
    static calcViscosityVectorForOne(mj, vi, vj, gi, gj, theta, dist, h, d) {
        var res = new THREE.Vector3(0, 0, 0);
        res.add(vi.divideScalar(Math.pow(gi, 2)));
        res.add(vj.divideScalar(Math.pow(gj, 2)));
        res.multiplyScalar((-1) * mj/gj * theta * this.calcKernelSecondDerivative(dist, h, d))
        // -1 bo lepkosc powinna spowalniać ruch
        return res

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