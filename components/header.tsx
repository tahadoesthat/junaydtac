'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-ta-black/10"
        >
            {/* Liquid Morphism Background mapped precisely to the header dimensions */}
            <div className="absolute inset-0 bg-ta-offwhite/60 backdrop-blur-xl pointer-events-none z-0 shadow-sm"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto flex justify-between items-center w-full">
                {/* Brand / Logo */}
                <div className="font-montserrat font-black text-ta-black tracking-widest uppercase text-xs md:text-sm">
                    TAHA ACTS <span className="opacity-40 ml-2 font-quicksand">// ARCHITECTURE</span>
                </div>

                {/* Social Vectors */}
                <div className="flex gap-6 items-center">
                    <a href="https://linkedin.com/in/mjunaydw" target="_blank" rel="noreferrer" className="font-quicksand font-bold text-[10px] md:text-xs tracking-widest uppercase hover:text-ta-grey-dark transition-colors">
                        LN //
                    </a>
                    <a href="https://x.com/mjunaydw" target="_blank" rel="noreferrer" className="font-quicksand font-bold text-[10px] md:text-xs tracking-widest uppercase hover:text-ta-grey-dark transition-colors">
                        X //
                    </a>
                    <a href="https://instagram.com/junaid.tac" target="_blank" rel="noreferrer" className="font-quicksand font-bold text-[10px] md:text-xs tracking-widest uppercase hover:text-ta-grey-dark transition-colors">
                        IG //
                    </a>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
