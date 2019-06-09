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
    static calcKernel(q, h, d) {
        if (0 < q < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - q * q + q * q * q / 2) / Math.pow(h, d);
        } else if (h < q < 2 * h) {
            return 3 / (2 * Math.PI) * (Math.pow(2 - q, 3) / 6) / Math.pow(h, d);
        } else if (2 * h < q) {
            return 0;
        }
    }

    static calcKernelDerivative(q, h) {
        if (0 < q < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 * q + 3 * q * q / 2) / Math.pow(h, d);
        } else if (h < q < 2 * h) {
            return 3 / (2 * Math.PI) * (-3) * (Math.pow(2 - q, 2) / 6) / Math.pow(h, d);
        } else if (2 * h < q) {
            return 0;
        }
    }

    static calcKernelSecondDerivative(q, h) {
        if (0 < q < h) {
            return 3 / (2 * Math.PI) * (2 / 3 - 2 + 6 * q / 2) / Math.pow(h, d);
        } else if (h < q < 2 * h) {
            return 3 / (2 * Math.PI) * 6 * (2 - q) / 6 / Math.pow(h, d);
        } else if (2 * h < q) {
            return 0;
        }
    }

    // 4
    static calcDensity(mj, q, h, j, d = 3) {
        let g = 0;
        for (let i = 0; i < j; ++i) {
            g += this.calcKernel(q[i][j], h);
        }

        return mj * g / Math.pow(h, d);
    }

    // 5
    static calcPressure(k, gi, g0) {
        return k * (Math.pow(gi / g0, 7) - 1);
    }

    // 6
    static calcPressureVector(mj, gj, gi, pj, qj, p, q, rj) {
        let a = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < j; ++i) {
            a.add((p[i].divideScalar(q[i] * q[i]).add(pj.divideScalar(qj * qj))).multiplyScalar(this.calcKernelDerivative(rj[i])))
        }
        return mj * a / gj / gi;
    }

    // 7
    static calcViscosityVector(mj, gj, gi, vj, qj, v, q, rj, theta) {
        let a = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < j; ++i) {
            a.add((v[i].divideScalar(q[i] * q[i]).add(vj.divideScalar(qj * qj))).multiplyScalar(this.calcKernelSecondDerivative(rj[i])))
        }
        return theta * mj * a / gj / gi;
    }

    // 8
    static calcAOther(G) {
        return G;
    }

    // 9
    static calcAVector(mj, gj, vj, qj, gi, v, q, p, pj, theta, rj, G) {
        return this.calcPressureVector(mj, gj, gi, pj, qj, p, q, rj) +
            this.calcViscosityVector(mj, gj, gi, vj, qj, v, q, rj) +
            this.calcAOther(G)
    }

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