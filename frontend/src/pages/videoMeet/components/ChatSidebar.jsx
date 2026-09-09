import React from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';

const ChatSidebar = ({ showModal, setModal, messages, message, setMessage, sendMessage }) => {
    
    return (
        <div className={`fixed inset-y-0 right-0 md:top-4 md:bottom-23 md:right-4 bg-[var(--bg-card)] flex flex-col border-l md:border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100] md:shadow-2xl md:rounded-3xl overflow-hidden ${
            showModal ? 'w-full md:w-[360px] translate-x-0 opacity-100' : 'w-full md:w-[360px] translate-x-full md:translate-x-[calc(100%+32px)] opacity-0'
        }`}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
                <h1 className="text-lg font-semibold text-white m-0">In-call messages</h1>
                <IconButton 
                    size="small" 
                    onClick={() => setModal(false)} 
                    sx={{ 
                        color: 'var(--text-secondary)',
                        '&:hover': { backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/10 m-4 p-4 rounded-xl text-xs text-blue-300 border border-blue-500/20 leading-relaxed">
                Messages can only be seen by people in the call and are deleted when the call ends.
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-2 hide-scrollbar">
                {messages.length !== 0 ? (
                    messages.map((item, index) => (
                        <div key={index} className={`mb-5 flex flex-col ${item.isLocal ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex items-baseline gap-2 mb-1 ${item.isLocal ? 'flex-row-reverse' : ''}`}>
                                <p className={`font-bold text-sm ${item.isLocal ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    {item.isLocal ? 'You' : item.sender}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <p className={`text-[13.5px] leading-relaxed text-gray-200 px-3 py-2.5 rounded-2xl border border-white/5 inline-block max-w-[85%] break-words ${
                                item.isLocal 
                                ? 'bg-indigo-600/20 rounded-tr-none' 
                                : 'bg-white/5 rounded-tl-none'
                            }`}>
                                {item.data}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 px-10 text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <ChatIcon sx={{ opacity: 0.3 }} />
                        </div>
                        <p className="text-sm">No messages yet. Send a message to everyone in the call.</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2 items-center focus-within:border-indigo-500/50 transition-all duration-200">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Send a message"
                        onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) sendMessage(); }}
                        className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
                    />
                    <IconButton 
                        onClick={sendMessage} 
                        disabled={!message.trim()}
                        sx={{ 
                            backgroundColor: message.trim() ? '#818CF8' : 'transparent',
                            color: message.trim() ? 'var(--text-primary)' : '#4B5563',
                            width: '36px',
                            height: '36px',
                            Transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { 
                                backgroundColor: message.trim() ? 'var(--primary)' : 'var(--border-light)',
                                transform: message.trim() ? 'scale(1.05)' : 'none'
                             },
                            '&:disabled': { color: '#374151' }
                        }}
                    >
                        <SendIcon sx={{ fontSize: '18px' }} />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;
