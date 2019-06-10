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
    static calcPressureVectorForOne(m_j, g_i, g_j, p_i, p_j, pos_i, pos_j, dist, h, d) {
        let a = new THREE.Vector().add(pos_i).sub(pos_j).normalize();
        return a.multiplyScalar(
            (-m_j / (g_j * g_i )) *
            (p_i / Math.pow(g_i, 2) + p_j / Math.pow(g_j, 2)) *
            this.calcKernelDerivative(dist, h, d));
    }

    // 7
    // mj- masa J, vi- prędkość i, vj- prędkość j, gi- gęstość i, gj- gęstość j, theta- lepkość, dist- ||Ri - Rj||, h- kernelBase, d- ilość wymiarów (3?)
    static calcViscosityVectorForOne(mj, vi, vj, gi, gj, theta, dist, h, d) {
        var res = new THREE.Vector3(0, 0, 0);
        res = res.add(vi).divideScalar(Math.pow(gi, 2));
        res = res.add(vj).divideScalar(Math.pow(gj, 2));
        res = res.multiplyScalar(mj/gj * theta);
        res.multiplyScalar(this.calcKernelSecondDerivative(dist, h, d));
        return red

    }

    // 9

    // 10
    static calcVelocityHalfDelta(vi, t, deltaT, ai) {
        let v = new THREE.Vector3();
        v.x = vi.x * (t - deltaT / 2) + deltaT * ai(t).x;
        v.y = vi.y * (t - deltaT / 2) + deltaT * ai(t).y;
        v.z = vi.z * (t - deltaT / 2) + deltaT * ai(t).z;
        return v;
    }

    // 11
    static calcMovementDelta(xi, t, deltaT, vi) {
        let x = new THREE.Vector3();
        x.x = xi(t).x + vi.x * (t + deltaT / 2) * deltaT;
        x.y = xi(t).y + vi.y * (t + deltaT / 2) * deltaT;
        x.z = xi(t).z + vi.z * (t + deltaT / 2) * deltaT;
        return x;
    }
}