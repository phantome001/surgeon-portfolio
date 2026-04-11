'use client'

import { motion } from 'framer-motion'

export function AnimatedStomachSVG() {
  const pathVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 0.3, // Keep it subtle so it acts as background
      transition: { 
        duration: 4, 
        ease: "easeInOut",
        opacity: { duration: 1 }
      }
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-screen pointer-events-none z-0">
      <svg
        width="600"
        height="600"
        viewBox="0 0 200 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-3xl drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
      >
        {/* Esophagus */}
        <motion.path
          d="M100 20 C100 40, 105 60, 95 80"
          stroke="#D4AF37"
          strokeWidth="3"
          strokeLinecap="round"
          variants={pathVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
        {/* Stomach main body */}
        <motion.path
          d="M95 80 C80 90, 60 120, 75 140 C90 160, 130 150, 140 130 C150 110, 120 70, 95 80"
          stroke="#D4AF37"
          strokeWidth="3"
          strokeLinecap="round"
          variants={pathVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
        {/* Intestines summary/abstract lines */}
        <motion.path
          d="M85 145 C70 160, 60 180, 80 190 C100 200, 120 180, 100 170 C80 160, 130 190, 120 210"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 0.2,
              transition: { duration: 3, delay: 2, ease: "easeInOut" }
            }
          } as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
        {/* Gallbladder abstract small circle/bulb */}
        <motion.path
          d="M75 125 C70 130, 65 125, 70 120 C75 115, 80 120, 75 125"
          stroke="#14b8a6" // Teal color to represent gallbladder
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0, scale: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 0.4,
              scale: 1,
              transition: { duration: 1, delay: 3 }
            }
          } as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
      </svg>
    </div>
  )
}
