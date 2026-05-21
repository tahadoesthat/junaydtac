'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// --- Global Aesthetic Configuration ---
// Boss requested a max of 30% for general lines for readability.
// We scale based on Z-depth for realism.
const GLOBAL_MESH_BASE_OPACITY = 0.3; 
const GLOBAL_MESH_DOT_OPACITY = 0.5;

// --- 3D Sculpture Engine (Version 3.0: High-Fidelity Contour) ---
const generateSculptedHead = (radius: number) => {
    const pts = [];
    const numPoints = 300; // Optimal density for recognizable structure without clutter
    
    // We are no longer morphing a sphere. We are plotting points along defined facial vectors.
    for(let i = 0; i < numPoints; i++) {
        const phi = Math.acos( -1 + ( 2 * i ) / numPoints );
        const theta = Math.sqrt( numPoints * Math.PI ) * phi;
        
        let x = radius * Math.cos(theta) * Math.sin(phi);
        let y = radius * Math.cos(phi); 
        let z = radius * Math.sin(theta) * Math.sin(phi);

        // Architectural sculpting logic (based on standard facial landmarks)
        // Adjust vertically (Y) for proportional head shape
        y *= 1.25; 

        // Morph based on orientation (Front Z+, Back Z-)
        if (z > -radius * 0.1) {
             // 1. FRONT FACE Contouring
             
             // Define Mid-line points more strongly
             if (Math.abs(x) < radius * 0.2) { x *= 0.8; }

             // Define Eyebrow ridges/brow line (Upper facial sector)
             if (y < -radius * 0.2 && y > -radius * 0.5 ) {
                 z *= 1.15; // Pull brow forward
                 if (Math.abs(x) > radius * 0.3) { x *= 1.1; } // Define temples
             }

             // Define Nase/Nose bridge
             if (y < radius * 0.2 && y > -radius * 0.3 && Math.abs(x) < radius * 0.15) {
                 z *= 1.55; // Extrude nase forward strongly
                 y += radius * 0.05; // Drop tip slightly
                 if (Math.abs(x) > radius * 0.05) { z *= 1.1; } // define base
             }

             // Define Cheekbones
             if (y < radius * 0.4 && y > -radius * 0.1 && Math.abs(x) > radius * 0.35) {
                 z *= 1.2; // Pull cheekbones forward
             }

             // Define Jawline and Beard (Lower sector)
             if (y > 0) {
                 x *= (1 - 0.3 * (y/radius)); // Taper jaw severely
                 if (z > 0 && Math.abs(x) < radius * 0.4) {
                     y *= 1.4; // Beard extends vertically
                     z *= 1.25; // Beard extends forward (creating defined beard contour)
                 }
                 // Neck taper
                 if (z < 0) { x *= 0.9; }
             }

        } else {
             // 2. BACK OF HEAD (Smoother, less defined)
             x *= 0.95;
             y *= 0.9;
             z *= 0.85;
        }

        pts.push({ x, y, z, isEye: false });
    }

    // Inject explicit tracking nodes (The Eyes) defined within the eye socket structure
    pts.push({ x: -radius * 0.35, y: -radius * 0.15, z: radius * 1.0, isEye: true });
    pts.push({ x: radius * 0.35, y: -radius * 0.15, z: radius * 1.0, isEye: true });

    return pts;
};

const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
    const lineRefs = useRef<(SVGLineElement | null)[]>([]);

    const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const { points3D, edges } = useMemo(() => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const radius = Math.min(w, h) * 0.35; 
        
        const pts = generateSculptedHead(radius);
        const edgesList = [];
        
        const connectionDist = radius * 0.42; 
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                const dz = pts[i].z - pts[j].z;
                if (Math.sqrt(dx*dx + dy*dy + dz*dz) < connectionDist) {
                    edgesList.push({ p1: i, p2: j });
                }
            }
        }
        return { points3D: pts, edges: edgesList };
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const renderLoop = () => {
            if (!containerRef.current) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const centerX = w / 2;
            const centerY = h / 2;
            const radius = Math.min(w, h) * 0.35;

            // Full 360 degree rotational mapping (Yaw/Pitch)
            const targetRotY = (smoothMouseX.get() / w - 0.5) * Math.PI * 2.5; 
            const targetRotX = (smoothMouseY.get() / h - 0.5) * Math.PI * 0.6; 

            const projectedPoints = points3D.map((p, i) => {
                // Apply Rotations
                const x1 = p.x * Math.cos(targetRotY) - p.z * Math.sin(targetRotY);
                const z1 = p.x * Math.sin(targetRotY) + p.z * Math.cos(targetRotY);

                const y2 = p.y * Math.cos(targetRotX) - z1 * Math.sin(targetRotX);
                const z2 = p.y * Math.sin(targetRotX) + z1 * Math.cos(targetRotX);

                // Eye Tracking Offset
                let finalX = x1;
                let finalY = y2;
                if (p.isEye) {
                    finalX += (smoothMouseX.get() / w - 0.5) * 60;
                    finalY += (smoothMouseY.get() / h - 0.5) * 60;
                }

                // Perspective Projection
                const fl = 1200; 
                const scale = fl / (fl - z2); 
                
                const projX = centerX + finalX * scale;
                const projY = centerY + finalY * scale;

                // Mutate DOM Nodes directly for 60fps performance
                if (circleRefs.current[i]) {
                    circleRefs.current[i]!.setAttribute('cx', projX.toString());
                    circleRefs.current[i]!.setAttribute('cy', projY.toString());
                    
                    // Force the overall mesh dot opacity to 50% max (fading to 10% in the back)
                    const normalizedZ = (z2 + radius) / (radius * 2);
                    const depthOpacity = Math.max(0.1, Math.min(1, normalizedZ));
                    const finalDotOpacity = depthOpacity * GLOBAL_MESH_DOT_OPACITY; // Max 0.5
                    
                    circleRefs.current[i]!.setAttribute('opacity', p.isEye ? '1' : finalDotOpacity.toString());
                }

                return { x: projX, y: projY, z: z2, isEye: p.isEye };
            });

            // Mutate Lines
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                const p1 = projectedPoints[edge.p1];
                const p2 = projectedPoints[edge.p2];
                
                if (lineRefs.current[i]) {
                    lineRefs.current[i]!.setAttribute('x1', p1.x.toString());
                    lineRefs.current[i]!.setAttribute('y1', p1.y.toString());
                    lineRefs.current[i]!.setAttribute('x2', p2.x.toString());
                    lineRefs.current[i]!.setAttribute('y2', p2.y.toString());
                    
                    // Force the general line opacity to 30% max (fading to 5% in the back)
                    const avgZ = (p1.z + p2.z) / 2;
                    const normalizedZ = (avgZ + radius) / (radius * 2);
                    const depthOpacity = Math.max(0.05, Math.min(1, normalizedZ));
                    const finalLineOpacity = depthOpacity * GLOBAL_MESH_BASE_OPACITY; // Max 0.3
                    
                    lineRefs.current[i]!.setAttribute('stroke-opacity', finalLineOpacity.toString());
                }
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [points3D, edges, mouseX, mouseY, smoothMouseX, smoothMouseY]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ta-offwhite border-b-2 border-ta-black z-0">
        
        {/* Layer 0: Centered 360 Sculpture Mesh (Strict 30% Max Visibility for Lines) */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-multiply opacity-80">
            <g>
                {edges.map((edge, i) => (
                    <line 
                        key={`edge-${i}`} 
                        ref={el => { lineRefs.current[i] = el; }} 
                        stroke="#0A0A0A" 
                        strokeWidth="1.2" 
                    />
                ))}
            </g>
            <g>
                {points3D.map((p, i) => (
                    <circle 
                        key={`node-${i}`} 
                        ref={el => { circleRefs.current[i] = el; }} 
                        r={p.isEye ? "6" : "2.5"} 
                        fill="#0A0A0A" 
                        className={p.isEye ? "animate-pulse" : ""}
                    />
                ))}
            </g>
        </svg>

        {/* Layer 1: Separated Grid for Text/Tiles (100% Readable) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pointer-events-none">
            
            {/* Left Column: GlassTiles (separated from text) */}
            <div className="hidden lg:flex flex-col justify-center items-start gap-16 pointer-events-auto z-30 h-full mt-[-10vh]">
                 <div>
                     <GlassTile label="Current Protocol" content="Phase 2 Validation" delay={0.4} mouseX={smoothMouseX} mouseY={smoothMouseY} />
                 </div>
                 <div>
                     <GlassTile label="Execution Speed" content="Relentless." delay={0.6} mouseX={smoothMouseX} mouseY={smoothMouseY} />
                 </div>
            </div>

            {/* Right Column: Main Hero Typography (Muhammad Junayd Asghar.) */}
            <div className="pointer-events-auto z-20 flex flex-col justify-center h-full mt-[10vh]">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                     <div className="inline-block border border-ta-black/20 px-3 py-1 mb-6 backdrop-blur-md bg-ta-offwhite/50">
                         <span className="font-quicksand font-bold text-ta-black/80 uppercase tracking-[0.2em] text-xs">Chief Architect & Creative Director</span>
                     </div>
                    <h1 className="font-montserrat font-extrabold text-5xl md:text-7xl tracking-tighter text-ta-black leading-[0.9] mb-8 drop-shadow-sm">
                        MUHAMMAD<br />JUNAYD<br /><span className="text-ta-grey-dark">ASGHAR.</span>
                    </h1>
                    <p className="font-quicksand text-ta-black font-bold text-lg md:text-xl max-w-md leading-relaxed border-l-4 border-ta-black pl-4 py-2">
                        Engineering elite corporate infrastructure, scalable SaaS architecture, and high-velocity creative execution.
                    </p>
                </motion.div>
            </div>
            
        </div>
    </section>
  );
};

const GlassTile = ({ label, content, delay, mouseX, mouseY }: any) => {
    const x = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [20, -20]);
    const y = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [20, -20]);

    return (
        <motion.div 
            className="p-5 pointer-events-auto glassmorphism-monochrome rounded-sm z-30 min-w-[220px] backdrop-blur-xl bg-ta-offwhite/80"
            initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8, delay: delay }} style={{ x, y }}
        >
            <h3 className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-dark mb-1">{label}</h3>
            <p className="font-montserrat font-black text-xl text-ta-black">{content}</p>
        </motion.div>
    )
}

export default HeroSection;
