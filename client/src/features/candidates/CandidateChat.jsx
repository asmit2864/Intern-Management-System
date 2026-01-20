import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../lib/api';

const CandidateChat = ({ isOpen, onClose, candidateId, candidateName, messages = [], setMessages }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare history for Gemini
            const history = (messages || []).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || '' }]
            }));

            const response = await api.post(`/candidates/${candidateId}/chat`, {
                message: userMessage.content,
                history
            });

            const aiText = response.data?.response || 'Sorry, I could not generate a response.';
            setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = error.response?.data?.error || 'Sorry, I encountered an error. Please try again later.';
            setMessages(prev => [...prev, {
                role: 'ai',
                content: errorMsg
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Hiring Assistant</h3>
                                    <p className="text-[11px] text-slate-500">Analyzing {candidateName}'s Profile</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
                        >
                            {(!messages || messages.length === 0) && !isLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare size={32} className="text-slate-300" />
                                    </div>
                                    <p className="font-medium text-slate-900 mb-1 text-sm">Ask me anything about this candidate</p>
                                    <p className="text-xs">I can help you evaluate skills, find experience details, or answer hiring doubts.</p>
                                </div>
                            )}

                            {(messages || []).map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[90%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold
                      ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}
                                        >
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div
                                            className={`p-3 rounded-2xl text-[13px] leading-relaxed
                        ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                                                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}
                                        >
                                            {msg.role === 'user' ? (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            ) : (
                                                <div className="markdown-container prose prose-sm max-w-none prose-slate">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-bold border-b border-indigo-100 pb-0.5 mb-1 inline-block" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        }}
                                                    >
                                                        {msg.content || ''}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                            <Bot size={16} />
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 rounded-tl-none flex items-center gap-2 border border-slate-200">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs font-medium">Assistant is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t bg-slate-50"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="mt-2 text-[10px] text-center text-slate-400 uppercase tracking-wider font-semibold">
                                AI-Powered Assistant
                            </p>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CandidateChat;
