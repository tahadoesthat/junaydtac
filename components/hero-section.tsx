'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// --- Global Aesthetic Configuration ---
const GLOBAL_EARTH_OPACITY = 0.3; // Max opacity for the Earth wireframe
const GLOBAL_DNA_OPACITY = 0.08;  // Very low opacity for the background DNA structure

// --- 3D Architecture Engine: Earth & DNA ---
const generateArchitecturalMeshes = (radius: number) => {
    const points = [];
    const edges = [];

    // 1. GENERATE NETWORK EARTH (Fibonacci Sphere)
    const numEarthPoints = 250;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    
    for (let i = 0; i < numEarthPoints; i++) {
        const y = 1 - (i / (numEarthPoints - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y); // radius at y
        const theta = phi * i;
        
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        
        points.push({ x: x * radius, y: y * radius, z: z * radius, type: 'earth' });
    }

    // Connect Earth points based on proximity to create the wireframe
    const earthConnectionDist = radius * 0.35; 
    for (let i = 0; i < numEarthPoints; i++) {
        for (let j = i + 1; j < numEarthPoints; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dz = points[i].z - points[j].z;
            if (Math.sqrt(dx*dx + dy*dy + dz*dz) < earthConnectionDist) {
                edges.push({ p1: i, p2: j, type: 'earth' });
            }
        }
    }

    // 2. GENERATE BACKGROUND DNA HELIX
    const dnaPtsStartIdx = points.length;
    const numBasePairs = 80;
    const dnaHeight = radius * 6; // Spans far beyond the screen height
    const dnaRadius = radius * 0.9; // Wider than the earth
    
    for (let i = 0; i < numBasePairs; i++) {
        const y = -dnaHeight/2 + (i / (numBasePairs - 1)) * dnaHeight;
        const theta = i * 0.3; // Twist density

        // Strand 1
        const x1 = Math.cos(theta) * dnaRadius;
        const z1 = Math.sin(theta) * dnaRadius;
        // Strand 2 (opposite side)
        const x2 = Math.cos(theta + Math.PI) * dnaRadius;
        const z2 = Math.sin(theta + Math.PI) * dnaRadius;

        const idx1 = dnaPtsStartIdx + i * 2;
        const idx2 = dnaPtsStartIdx + i * 2 + 1;

        points.push({ x: x1, y: y, z: z1, type: 'dna' });
        points.push({ x: x2, y: y, z: z2, type: 'dna' });

        // Connect the base pair horizontally
        edges.push({ p1: idx1, p2: idx2, type: 'dna' });

        // Connect the vertical backbone
        if (i > 0) {
            edges.push({ p1: idx1, p2: idx1 - 2, type: 'dna' });
            edges.push({ p1: idx2, p2: idx2 - 2, type: 'dna' });
        }
    }

    return { points3D: points, edges: edges };
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
        
        return generateArchitecturalMeshes(radius);
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        let time = 0;
        
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const renderLoop = () => {
            if (!containerRef.current) return;
            time += 0.003; // Global time step for auto-rotation

            const w = window.innerWidth;
            const h = window.innerHeight;
            const centerX = w / 2;
            const centerY = h / 2;
            const radius = Math.min(w, h) * 0.35;

            // Earth Rotation Logic: Mouse Tracking + Continuous Auto-Rotation
            const earthTargetRotY = (smoothMouseX.get() / w - 0.5) * Math.PI + time; 
            const earthTargetRotX = (smoothMouseY.get() / h - 0.5) * Math.PI * 0.5; 

            // DNA Rotation Logic: Continuous slow rotation + slight architectural tilt
            const dnaRotY = -time * 1.2; // Rotates in opposite direction
            const dnaTiltX = Math.PI * 0.15; // Tilted slightly on the Z-axis

            const projectedPoints = points3D.map((p, i) => {
                let rx, ry, rz;

                if (p.type === 'earth') {
                    // Apply Earth Yaw and Pitch
                    const x1 = p.x * Math.cos(earthTargetRotY) - p.z * Math.sin(earthTargetRotY);
                    const z1 = p.x * Math.sin(earthTargetRotY) + p.z * Math.cos(earthTargetRotY);

                    rx = x1;
                    ry = p.y * Math.cos(earthTargetRotX) - z1 * Math.sin(earthTargetRotX);
                    rz = p.y * Math.sin(earthTargetRotX) + z1 * Math.cos(earthTargetRotX);
                } else {
                    // Apply DNA Yaw and Tilt
                    const x1 = p.x * Math.cos(dnaRotY) - p.z * Math.sin(dnaRotY);
                    const z1 = p.x * Math.sin(dnaRotY) + p.z * Math.cos(dnaRotY);

                    rx = x1;
                    ry = p.y * Math.cos(dnaTiltX) - z1 * Math.sin(dnaTiltX);
                    rz = p.y * Math.sin(dnaTiltX) + z1 * Math.cos(dnaTiltX);
                }

                // Perspective Projection
                const fl = 1200; 
                const scale = fl / (fl - rz); 
                
                const projX = centerX + rx * scale;
                const projY = centerY + ry * scale;

                // Mutate DOM Nodes (Circles)
                if (circleRefs.current[i]) {
                    circleRefs.current[i]!.setAttribute('cx', projX.toString());
                    circleRefs.current[i]!.setAttribute('cy', projY.toString());
                    
                    const normalizedZ = (rz + radius) / (radius * 2);
                    const depthOpacity = Math.max(0.05, Math.min(1, normalizedZ));
                    
                    const maxOpacity = p.type === 'earth' ? GLOBAL_EARTH_OPACITY : GLOBAL_DNA_OPACITY;
                    circleRefs.current[i]!.setAttribute('opacity', (depthOpacity * maxOpacity).toString());
                }

                return { x: projX, y: projY, z: rz, type: p.type };
            });

            // Mutate Lines (Edges)
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                const p1 = projectedPoints[edge.p1];
                const p2 = projectedPoints[edge.p2];
                
                if (lineRefs.current[i]) {
                    lineRefs.current[i]!.setAttribute('x1', p1.x.toString());
                    lineRefs.current[i]!.setAttribute('y1', p1.y.toString());
                    lineRefs.current[i]!.setAttribute('x2', p2.x.toString());
                    lineRefs.current[i]!.setAttribute('y2', p2.y.toString());
                    
                    // Opacity based on depth and type
                    const avgZ = (p1.z + p2.z) / 2;
                    const normalizedZ = (avgZ + radius) / (radius * 2);
                    const depthOpacity = Math.max(0.05, Math.min(1, normalizedZ));
                    
                    const maxOpacity = edge.type === 'earth' ? GLOBAL_EARTH_OPACITY : GLOBAL_DNA_OPACITY;
                    lineRefs.current[i]!.setAttribute('stroke-opacity', (depthOpacity * maxOpacity).toString());
                }
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [points3D, edges, mouseX, mouseY, smoothMouseX, smoothMouseY]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ta-offwhite border-b-2 border-ta-black z-0">
        
        {/* Layer 0: Centered 360 Architecture (Earth + DNA) */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-multiply">
            <g>
                {edges.map((edge, i) => (
                    <line 
                        key={`edge-${i}`} 
                        ref={el => { lineRefs.current[i] = el; }} 
                        stroke="#0A0A0A" 
                        strokeWidth={edge.type === 'earth' ? "1.2" : "1.5"} 
                    />
                ))}
            </g>
            <g>
                {points3D.map((p, i) => (
                    <circle 
                        key={`node-${i}`} 
                        ref={el => { circleRefs.current[i] = el; }} 
                        r={p.type === 'earth' ? "2" : "3"} 
                        fill="#0A0A0A" 
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
