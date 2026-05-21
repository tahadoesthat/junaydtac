'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const timelineData = [
    {
        id: "role-1", title: "CEO & Chief Architect", organization: "Taha Acts", period: "2022 — Present",
        metrics: ["Orchestrating high-level system architecture and scalable deployment pipelines.", "Leading elite creative direction, merging corporate infrastructure with high-velocity modern aesthetics.", "Engineering automated workflows and executing cutting-edge SaaS developments like Rihla AI."],
        stack: ["System Architecture", "Next.js", "Team Leadership", "AI Integration"]
    }
];

const ArchitecturalTimeline = () => {
    return (
        <section id="resume" className="min-h-screen bg-ta-offwhite relative py-32 overflow-hidden border-t-2 border-ta-black/10">
            <div className="z-10 w-full max-w-4xl mx-auto px-6 relative">
                <div className="mb-20">
                    <h2 className="font-montserrat font-black text-5xl md:text-7xl tracking-tighter text-ta-black uppercase">The Blueprint</h2>
                    <p className="font-quicksand font-bold tracking-widest text-ta-grey-dark uppercase text-sm mt-4">Operational History & Execution Logic</p>
                </div>
                <div className="relative border-l-2 border-ta-black/20 pl-8 md:pl-12 ml-4 md:ml-0">
                    {timelineData.map((node, index) => <TimelineNode key={node.id} data={node} isFirst={index === 0} />)}
                </div>
            </div>
        </section>
    );
};

const TimelineNode = ({ data, isFirst }: any) => {
    const [isOpen, setIsOpen] = useState(isFirst);
    return (
        <div className="relative mb-12 last:mb-0 group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="absolute -left-[37px] md:-left-[53px] top-2 w-4 h-4 bg-ta-offwhite border-2 border-ta-black rounded-full group-hover:bg-ta-black transition-colors duration-300 z-10 flex items-center justify-center">
                 <div className={`w-1.5 h-1.5 bg-ta-offwhite rounded-full transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 pointer-events-none">
                <div>
                    <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-ta-black group-hover:tracking-wide transition-all duration-500 ease-out">{data.title}</h3>
                    <h4 className="font-quicksand font-semibold text-lg text-ta-grey-dark uppercase tracking-widest mt-1">{data.organization}</h4>
                </div>
                <div className="font-quicksand font-bold text-sm text-ta-black/40 uppercase tracking-widest mt-2 md:mt-0">{data.period}</div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0, overflow: 'hidden' }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.4, delay: 0.1 } }}>
                        <div className="pt-4 pb-8 border-t border-ta-black/10 cursor-default" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-6">
                                <span className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-black/50 mb-3 block">Execution Metrics //</span>
                                <ul className="space-y-3">
                                    {data.metrics.map((metric: string, idx: number) => (
                                        <li key={idx} className="font-quicksand text-ta-black text-base flex items-start leading-relaxed">
                                            <span className="mr-3 text-ta-black font-bold mt-0.5">+</span>{metric}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <span className="font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-black/50 mb-3 block">Core Competencies //</span>
                                <div className="flex flex-wrap gap-2">
                                    {data.stack.map((tech: string, idx: number) => (
                                        <div key={idx} className="border border-ta-black px-3 py-1 text-xs font-quicksand font-bold text-ta-black uppercase tracking-wider hover:bg-ta-black hover:text-ta-offwhite transition-colors duration-300">{tech}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {!isOpen && <div className="w-full h-px bg-ta-black/10 mt-4 group-hover:bg-ta-black/30 transition-colors"></div>}
        </div>
    );
};

export default ArchitecturalTimeline;
