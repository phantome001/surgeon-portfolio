'use client'

import { motion, useScroll, useTransform } from 'framer-motion'


export function LaparoscopeOverlay() {
  const { scrollY } = useScroll()

  // Fade in the vignette effect quickly between 200px and 600px of scrolling down,
  // making it feel like we just entered the body cavity.
  const opacity = useTransform(scrollY, [200, 600], [0, 1])
  // Slight scale effect to simulate endoscope pushing forward
  const scale = useTransform(scrollY, [200, 1500], [1.1, 1])

  return (
    <motion.div
      style={{ opacity, scale }}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {/* 
        The vignette overlay: radial gradient that is completely transparent in the center 
        and dark at the edges to simulate the round lens of a laparoscope.
      */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(5,10,20,0.95) 100%)'
        }}
      />
      
      {/* Subtle scanlines or measurement reticle simulation */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100% 4px'
        }}
      />
      
      <div className="absolute top-4 right-4 text-emerald-500/50 font-mono text-xs flex flex-col gap-1">
        <span>REC</span>
        <span>OPT: SURG-V1</span>
      </div>
    </motion.div>
  )
}
