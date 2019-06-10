self.addEventListener('message', (e) => {
    calculateDensityInFluidRange(e.data[0], e.data[1]);
    self.postMessage(e.data[0], e.data[1])
    console.log("lolza");
}, false)

// function calculateDensityInFluidRange(fluid, numOfGroups, thisGroupNumber) {
//     let groupRange = Math.floor(fluid.particles.length / numOfGroups)
//     let groupIndexStart = Math.min(groupRange * thisGroupNumber, fluid.particles.length)
//     let groupIndexEnd = Math.min(groupRange + groupIndexStart, fluid.particles.length)
//     for(let i=groupIndexStart; i<groupIndexEnd; i++) {
//         let particle = fluid.particles[i]
//         let fluidType = fluid.fluidTypeList[particle.fluidTypeIndex]
//         calculateDensityAndPressure(particle, fluidType);
//     }
// }