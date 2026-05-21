'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InboundTerminal = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Frontend validation
        if (!formData.name || !formData.contact || !formData.message) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('submitting');

        try {
            // Routing securely through Next.js API
            const response = await fetch('/api/contact', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(formData),
            });
            if (response.ok) { setStatus('success'); setFormData({ name: '', contact: '', message: '' }); } 
            else { setStatus('error'); }
        } catch (error) { setStatus('error'); }
        if (status !== 'success') setTimeout(() => setStatus('idle'), 4000);
    };

    return (
        <section id="terminal" className="min-h-screen bg-ta-black relative py-32 flex items-center justify-center overflow-hidden">
            
            {/* Subtle Grid overlay inverted for the black background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_right,#F8F8F6_1px,transparent_1px),linear-gradient(to_bottom,#F8F8F6_1px,transparent_1px)] bg-[size:4rem_4rem] z-0"></div>

            <div className="z-10 w-full max-w-3xl mx-auto px-6 relative">
                
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="font-montserrat font-black text-5xl md:text-7xl tracking-tighter text-ta-offwhite uppercase">
                        Initialize
                    </h2>
                    <p className="font-quicksand font-bold tracking-widest text-ta-grey-mid uppercase text-sm mt-4">
                        Secure Transmission // Direct Line
                    </p>
                </div>

                {/* The Form / Wireframe Terminal */}
                <div className="border border-ta-offwhite/10 p-8 md:p-12 relative backdrop-blur-sm bg-ta-black/40">
                    {/* Architectural corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-ta-offwhite"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-ta-offwhite"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-ta-offwhite"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-ta-offwhite"></div>

                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="h-full flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-16 h-16 border-4 border-ta-offwhite rounded-full flex items-center justify-center mb-6">
                                    <div className="w-8 h-8 bg-ta-offwhite rounded-full"></div>
                                </div>
                                <h3 className="font-montserrat font-bold text-3xl text-ta-offwhite uppercase tracking-tighter mb-2">Transmission Secured</h3>
                                <p className="font-quicksand text-ta-grey-mid font-bold">The architecture team has received your payload.</p>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 border-b-2 border-ta-offwhite pb-1 font-quicksand font-bold uppercase tracking-widest text-xs hover:text-ta-grey-mid text-ta-offwhite transition-colors"
                                >
                                    Initialize New Sequence
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit} 
                                className="space-y-8 relative"
                            >
                                {/* Form Error Overlay */}
                                {status === 'error' && (
                                    <div className="absolute -top-12 left-0 font-quicksand font-bold text-red-500 text-xs uppercase tracking-widest">
                                        Error: Incomplete or failed transmission. Check network / inputs.
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="name" className="block font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-mid mb-2">Entity Name</label>
                                    <input 
                                        type="text" 
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-transparent border border-ta-offwhite/20 focus:border-ta-offwhite p-4 font-montserrat font-bold text-xl text-ta-offwhite outline-none transition-colors rounded-none placeholder:text-ta-offwhite/20"
                                        placeholder="JOHN DOE"
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contact" className="block font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-mid mb-2">Contact Vector (Email / Phone)</label>
                                    <input 
                                        type="text" 
                                        id="contact"
                                        required
                                        value={formData.contact}
                                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                        className="w-full bg-transparent border border-ta-offwhite/20 focus:border-ta-offwhite p-4 font-montserrat font-bold text-xl text-ta-offwhite outline-none transition-colors rounded-none placeholder:text-ta-offwhite/20"
                                        placeholder="J.DOE@DOMAIN.COM"
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block font-quicksand font-bold text-[10px] uppercase tracking-widest text-ta-grey-mid mb-2">Payload / Inquiry</label>
                                    <textarea 
                                        id="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-transparent border border-ta-offwhite/20 focus:border-ta-offwhite p-4 font-quicksand font-semibold text-lg text-ta-offwhite outline-none transition-colors rounded-none resize-none placeholder:text-ta-offwhite/20 mt-2"
                                        placeholder="Describe the architectural requirements..."
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status === 'submitting'}
                                    className="w-full bg-transparent text-ta-offwhite font-montserrat font-bold uppercase tracking-[0.2em] py-5 border border-ta-offwhite hover:bg-ta-offwhite hover:text-ta-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'submitting' ? 'Executing...' : 'Transmit Payload'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default InboundTerminal;
