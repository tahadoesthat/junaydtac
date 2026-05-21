'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ProjectPipeline = () => {
    return (
        <section id="pipeline" className="min-h-screen bg-ta-offwhite relative py-32 overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem] z-0"></div>
            <div className="z-10 w-full max-w-6xl mx-auto px-6 relative">
                <div className="mb-24 text-center">
                    <h2 className="font-montserrat font-black text-5xl md:text-7xl tracking-tighter text-ta-black uppercase">The Pipeline</h2>
                    <p className="font-quicksand font-bold tracking-widest text-ta-grey-dark uppercase text-sm mt-4">Current Infrastructure & Deployment Nodes</p>
                </div>
                <div className="relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ta-black/10 -translate-x-1/2"></div>
                    <ProjectNode title="Solar Structure App" status="Testing Phase" alignment="left" specs={["Dynamic load calculation engine.", "Engineered logic for landscape-oriented 10-panel arrays.", "Structural brick pillar mounting algorithms."]} />
                    <ProjectNode title="Rihla AI" status="Testing Phase" alignment="right" specs={["AI-driven semantic itinerary generation network.", "Edge-computed node mappings for reduced latency.", "Scalable LLM routing architecture."]} />
                </div>
            </div>
        </section>
    );
};

const ProjectNode = ({ title, status, specs, alignment }: { title: string, status: string, specs: string[], alignment: 'left' | 'right' }) => {
    const isLeft = alignment === 'left';
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" }} className={`relative flex w-full my-24 ${isLeft ? 'justify-start' : 'justify-end'}`}>
            <div className={`absolute top-1/2 w-1/2 h-0.5 bg-ta-black/20 ${isLeft ? 'right-0' : 'left-0'}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-ta-black rounded-full ${isLeft ? '-right-2' : '-left-2'}`}>
                    <div className="absolute inset-0 bg-ta-black animate-ping rounded-full opacity-30"></div>
                </div>
            </div>
            <div className="w-[90%] md:w-[45%] bg-ta-offwhite border-2 border-ta-black p-8 relative z-20 hover:bg-ta-black transition-colors duration-500 group">
                <div className="inline-block border border-ta-black group-hover:border-ta-offwhite px-2 py-1 mb-6 transition-colors duration-500">
                    <span className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-black group-hover:text-ta-offwhite">{status} // STATUS_CODE: 202</span>
                </div>
                <h3 className="font-montserrat font-bold text-3xl text-ta-black group-hover:text-ta-offwhite mb-4 transition-colors duration-500">{title}</h3>
                <ul className="space-y-3">
                    {specs.map((spec, idx) => (
                        <li key={idx} className="font-quicksand text-ta-grey-dark group-hover:text-ta-grey-light text-sm flex items-start transition-colors duration-500">
                            <span className="mr-2 text-ta-black group-hover:text-ta-offwhite mt-0.5">▹</span>{spec}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    )
}

export default ProjectPipeline;
