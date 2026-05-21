'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// --- 3D Projection Engine ---
const generate3DHead = (radius: number) => {
    const pts = [];
    const numPoints = 250;
    
    // Generate a structural sphere (The Dome)
    for(let i = 0; i < numPoints; i++) {
        const phi = Math.acos( -1 + ( 2 * i ) / numPoints );
        const theta = Math.sqrt( numPoints * Math.PI ) * phi;
        
        let x = radius * Math.cos(theta) * Math.sin(phi);
        let y = radius * Math.cos(phi); // +y is down in screen coords
        let z = radius * Math.sin(theta) * Math.sin(phi);

        // Morph sphere into an architectural head profile
        y *= 1.2; // Elongate vertically
        
        if (y > 0) { 
            // Bottom half: Taper jaw and pull beard forward/down
            x *= (1 - 0.25 * (y/radius)); 
            if (z > 0) {
                y *= 1.3; // Beard extends down
                z *= 1.1; // Beard extends forward
            } else {
                z *= 0.8; // Flatten back of neck
            }
        } else {
            // Top half: flatten slightly at the temples
            x *= 0.95;
        }

        pts.push({ x, y, z, isEye: false });
    }

    // Inject explicit tracking nodes (The Eyes)
    pts.push({ x: -radius * 0.35, y: -radius * 0.1, z: radius * 0.95, isEye: true });
    pts.push({ x: radius * 0.35, y: -radius * 0.1, z: radius * 0.95, isEye: true });

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
        const radius = Math.min(w, h) * 0.35; // Scale mesh to screen
        
        const pts = generate3DHead(radius);
        const edgesList = [];
        
        // Connect nodes to form the architectural mesh
        const connectionDist = radius * 0.45; 
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

            // Calculate rotation angles based on mouse position
            // Maps mouse position to a rotation range
            const targetRotY = (smoothMouseX.get() / w - 0.5) * Math.PI * 1.5; // Left/Right (Yaw)
            const targetRotX = (smoothMouseY.get() / h - 0.5) * Math.PI * 0.5; // Up/Down (Pitch)

            const projectedPoints = points3D.map((p, i) => {
                // 1. Rotate Y (Yaw)
                const x1 = p.x * Math.cos(targetRotY) - p.z * Math.sin(targetRotY);
                const z1 = p.x * Math.sin(targetRotY) + p.z * Math.cos(targetRotY);

                // 2. Rotate X (Pitch)
                const y2 = p.y * Math.cos(targetRotX) - z1 * Math.sin(targetRotX);
                const z2 = p.y * Math.sin(targetRotX) + z1 * Math.cos(targetRotX);

                // 3. Eye Tracking Offset (Eyes move slightly further toward cursor)
                let finalX = x1;
                let finalY = y2;
                if (p.isEye) {
                    finalX += (smoothMouseX.get() / w - 0.5) * 40;
                    finalY += (smoothMouseY.get() / h - 0.5) * 40;
                }

                // 4. Perspective Projection
                const fl = 1000; // Focal length
                const scale = fl / (fl - z2); 
                
                const projX = centerX + finalX * scale;
                const projY = centerY + finalY * scale;

                // Mutate DOM Nodes directly for 60fps performance
                if (circleRefs.current[i]) {
                    circleRefs.current[i]!.setAttribute('cx', projX.toString());
                    circleRefs.current[i]!.setAttribute('cy', projY.toString());
                    
                    // Fade points in the back of the head
                    const opacity = Math.max(0.1, Math.min(1, (z2 + 300) / 600));
                    circleRefs.current[i]!.setAttribute('opacity', p.isEye ? '1' : opacity.toString());
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
                    
                    // Line opacity based on average Z depth
                    const avgZ = (p1.z + p2.z) / 2;
                    const opacity = Math.max(0.05, Math.min(0.5, (avgZ + 300) / 600));
                    lineRefs.current[i]!.setAttribute('stroke-opacity', opacity.toString());
                }
            }

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [points3D, edges, mouseX, mouseY, smoothMouseX, smoothMouseY]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ta-offwhite border-b-2 border-ta-black">
        
        {/* The 360 Centered Rotational Mesh */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <g>
                {edges.map((edge, i) => (
                    <line 
                        key={`edge-${i}`} 
                        ref={el => { lineRefs.current[i] = el; }} 
                        stroke="#0A0A0A" 
                        strokeWidth="1.5" 
                    />
                ))}
            </g>
            <g>
                {points3D.map((p, i) => (
                    <circle 
                        key={`node-${i}`} 
                        ref={el => { circleRefs.current[i] = el; }} 
                        r={p.isEye ? "6" : "2.5"} 
                        fill={p.isEye ? "#0A0A0A" : "#0A0A0A"} 
                        className={p.isEye ? "animate-pulse" : ""}
                    />
                ))}
            </g>
        </svg>

        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pointer-events-none">
            
            {/* Kept text on the right side so it overlays nicely beside the centered mesh */}
            <div className="col-start-1 lg:col-start-2 pointer-events-auto z-20">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                     <div className="inline-block border border-ta-black/20 px-3 py-1 mb-6 backdrop-blur-md bg-ta-offwhite/50">
                         <span className="font-quicksand font-bold text-ta-black/80 uppercase tracking-[0.2em] text-xs">Chief Architect & Creative Director</span>
                     </div>
                    <h1 className="font-montserrat font-extrabold text-6xl md:text-8xl tracking-tighter text-ta-black leading-[0.9] mb-8 drop-shadow-sm">
                        JUNAID<br /><span className="text-ta-grey-dark">ACTS.</span>
                    </h1>
                    <p className="font-quicksand text-ta-black font-semibold text-lg md:text-xl max-w-md leading-relaxed border-l-4 border-ta-black pl-4 backdrop-blur-sm bg-ta-offwhite/30 py-2">
                        Engineering elite corporate infrastructure, scalable SaaS architecture, and high-velocity creative execution.
                    </p>
                </motion.div>
            </div>
            
            {/* Stats placed dynamically around the centered mesh */}
            <div className="absolute top-1/4 left-12 hidden lg:block">
                 <GlassTile label="Current Protocol" content="Phase 2 Validation" delay={0.4} mouseX={smoothMouseX} mouseY={smoothMouseY} />
            </div>
            <div className="absolute bottom-1/4 left-1/4 hidden lg:block">
                 <GlassTile label="Execution Speed" content="Relentless." delay={0.6} mouseX={smoothMouseX} mouseY={smoothMouseY} />
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
            className="p-5 pointer-events-auto glassmorphism-monochrome rounded-sm z-30 min-w-[200px] backdrop-blur-xl bg-ta-offwhite/70"
            initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8, delay: delay }} style={{ x, y }}
        >
            <h3 className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-dark mb-1">{label}</h3>
            <p className="font-montserrat font-bold text-lg text-ta-black">{content}</p>
        </motion.div>
    )
}

export default HeroSection;
