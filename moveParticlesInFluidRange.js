self.addEventListener('message', (e) => {
    moveParticlesInFluidRange(e.data[0], e.data[1]);
    self.postMessage(e.data[0], e.data[1])
}, false)
