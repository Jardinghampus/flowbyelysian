"use client";

import { Heatmap } from '@paper-design/shaders-react';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <Heatmap
        speed={0.67}
        contour={0.17}
        angle={-180}
        noise={0}
        innerGlow={0.61}
        outerGlow={0.09}
        scale={0.36}
        image="https://workers.paper.design/file-assets/01KG1QNB9R1VDSSN66RJJC7CA9/01KG6S7Q7697D7HW1S8F5MJ8E1.png"
        colors={['#11206A', '#1F3BA2', '#2F63E7', '#6BD7FF', '#FF0005', '#FF3D00', '#20DCFF']}
        colorBack="#00000000"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
      />
      <div className="absolute z-10 text-white text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-widest">DSP</h1>
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}
