'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const REPULSION_RADIUS = 150;
const REPULSION_STRENGTH = 0.8;
const SPRING_FACTOR = 0.1;
const FRICTION = 0.8;

const generateFacePoints = (width: number, height: number) => {
    const pts = [];
    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const scale = Math.min(width, height) * 0.4;

    for (let a = Math.PI; a <= 2 * Math.PI; a += 0.15) {
        pts.push({ baseX: centerX + Math.cos(a) * scale * 0.7, baseY: centerY + Math.sin(a) * scale * 0.8 });
    }

    for (let a = 0; a <= Math.PI; a += 0.1) {
        const beardStretch = a > 0.5 && a < 2.6 ? 1.4 : 1.0;
        const x = centerX + Math.cos(a) * scale * 0.75;
        const y = centerY + Math.sin(a) * scale * 0.9 * beardStretch;
        pts.push({ baseX: x, baseY: y });
        if (beardStretch > 1.1) {
            pts.push({ baseX: x * 0.98 + centerX*0.02, baseY: y * 0.95 + centerY*0.05 });
            pts.push({ baseX: x * 0.95 + centerX*0.05, baseY: y * 0.90 + centerY*0.1 });
        }
    }

    const leftEyeX = centerX - scale * 0.25;
    const rightEyeX = centerX + scale * 0.25;
    const eyeY = centerY - scale * 0.1;
    
    for(let i = -0.15; i <= 0.15; i+=0.05) {
        pts.push({ baseX: leftEyeX + i * scale, baseY: eyeY - scale * 0.1 });
        pts.push({ baseX: rightEyeX + i * scale, baseY: eyeY - scale * 0.1 });
    }

    for(let i = 0; i < 60; i++) {
        const r = scale * 0.6 * Math.random();
        const theta = Math.random() * 2 * Math.PI;
        if (Math.sin(theta) > -0.2) {
             pts.push({ baseX: centerX + r * Math.cos(theta), baseY: centerY + r * Math.sin(theta) });
        }
    }

    return pts.map((p, i) => ({
        id: i, x: p.baseX, y: p.baseY, baseX: p.baseX, baseY: p.baseY, vx: 0, vy: 0
    }));
};

const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
    const lineRefs = useRef<(SVGLineElement | null)[]>([]);

    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);
    const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    const { points, edges } = useMemo(() => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const pts = generateFacePoints(w, h);
        const edgesList = [];
        const CONNECTION_DISTANCE = w * 0.12; 
        
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].baseX - pts[j].baseX;
                const dy = pts[i].baseY - pts[j].baseY;
                if (Math.sqrt(dx*dx + dy*dy) < CONNECTION_DISTANCE) {
                    edgesList.push({ p1: i, p2: j });
                }
            }
        }
        return { points: pts, edges: edgesList };
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        let currentMouseX = -1000;
        let currentMouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
            currentMouseX = e.clientX;
            currentMouseY = e.clientY;
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const renderLoop = () => {
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const dx = p.x - currentMouseX;
                const dy = p.y - currentMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < REPULSION_RADIUS) {
                    const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
                    p.vx += (dx / dist) * force * REPULSION_STRENGTH;
                    p.vy += (dy / dist) * force * REPULSION_STRENGTH;
                }
                p.vx += (p.baseX - p.x) * SPRING_FACTOR;
                p.vy += (p.baseY - p.y) * SPRING_FACTOR;
                p.vx *= FRICTION;
                p.vy *= FRICTION;
                p.x += p.vx;
                p.y += p.vy;

                if (circleRefs.current[i]) {
                    circleRefs.current[i]!.setAttribute('cx', p.x.toString());
                    circleRefs.current[i]!.setAttribute('cy', p.y.toString());
                }
            }
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                if (lineRefs.current[i]) {
                    lineRefs.current[i]!.setAttribute('x1', points[edge.p1].x.toString());
                    lineRefs.current[i]!.setAttribute('y1', points[edge.p1].y.toString());
                    lineRefs.current[i]!.setAttribute('x2', points[edge.p2].x.toString());
                    lineRefs.current[i]!.setAttribute('y2', points[edge.p2].y.toString());
                }
            }
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [points, edges, mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-ta-offwhite border-b-2 border-ta-black">
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-difference">
            <g opacity="0.15">
                {edges.map((edge, i) => (
                    <line key={`edge-${i}`} ref={el => { lineRefs.current[i] = el; }} stroke="#0A0A0A" strokeWidth="1" />
                ))}
            </g>
            <g opacity="0.8">
                {points.map((p, i) => (
                    <circle key={`node-${i}`} ref={el => { circleRefs.current[i] = el; }} r="2.5" fill="#0A0A0A" />
                ))}
            </g>
        </svg>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pointer-events-none">
            <div className="col-start-2 pointer-events-auto z-20">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                     <div className="inline-block border border-ta-black/20 px-3 py-1 mb-6">
                         <span className="font-quicksand font-bold text-ta-black/60 uppercase tracking-[0.2em] text-xs">Chief Architect & Creative Director</span>
                     </div>
                    <h1 className="font-montserrat font-extrabold text-6xl md:text-8xl tracking-tighter text-ta-black leading-[0.9] mb-8">
                        JUNAID<br /><span className="text-ta-grey-mid">ACTS.</span>
                    </h1>
                    <p className="font-quicksand text-ta-black/80 text-lg md:text-xl max-w-md leading-relaxed border-l-4 border-ta-black pl-4">
                        Engineering elite corporate infrastructure, scalable SaaS architecture, and high-velocity creative execution.
                    </p>
                </motion.div>
            </div>
            
            <div className="absolute top-1/4 left-12 hidden lg:block">
                 <GlassTile label="Current Protocol" content="Phase 2 Validation" delay={0.4} mouseX={smoothMouseX} mouseY={smoothMouseY} />
            </div>
            <div className="absolute bottom-1/4 right-24 hidden lg:block">
                 <GlassTile label="Execution Speed" content="Relentless." delay={0.6} mouseX={smoothMouseX} mouseY={smoothMouseY} />
            </div>
        </div>
    </section>
  );
};

const GlassTile = ({ label, content, delay, mouseX, mouseY }: any) => {
    const x = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [15, -15]);
    const y = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [15, -15]);

    return (
        <motion.div 
            className="p-5 pointer-events-auto glassmorphism-monochrome rounded-sm z-30 min-w-[200px] backdrop-blur-xl"
            initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8, delay: delay }} style={{ x, y }}
        >
            <h3 className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-dark mb-1">{label}</h3>
            <p className="font-montserrat font-bold text-lg text-ta-black">{content}</p>
        </motion.div>
    )
}

export default HeroSection;
