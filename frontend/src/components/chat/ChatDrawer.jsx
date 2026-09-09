import React, { useState, useEffect, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Avatar,
    TextField,
    CircularProgress,
    Fade,
    useTheme,
    useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axiosInstance from '../../utils/axiosInstance';
import { useSocket } from '../../context/SocketContext';

export default function ChatDrawer({ open, onClose, friend }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = useSocket();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Get current username directly from local storage
    const currentUsername = localStorage.getItem('username');

    useEffect(() => {
        if (open && friend) {
            fetchChatHistory();
        }
    }, [open, friend]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            // Only add if it's relevant to the current active chat
            if (!friend) return;
            
            const isRelevant = 
                (data.sender_username === friend.username && data.receiver_username === currentUsername) ||
                (data.sender_username === currentUsername && data.receiver_username === friend.username);
                
            if (isRelevant) {
                setMessages(prev => [...prev, data]);
                scrollToBottom();
            }
        };

        socket.on('receive-chat-message', handleReceiveMessage);

        return () => {
            socket.off('receive-chat-message', handleReceiveMessage);
        };
    }, [socket, friend, currentUsername]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChatHistory = async () => {
        if (!friend) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/chat/list/${friend.username}`);
            setMessages(response.data);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching chat history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await axiosInstance.delete(`/api/v1/chat/clear/${friend.username}`);
            setMessages([]);
        } catch (err) {
            console.error("Failed to clear chat:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !friend) return;

        try {
            const messageText = newMessage.trim();
            setNewMessage(""); 
            
            await axiosInstance.post('/api/v1/chat/send', {
                receiver_username: friend.username,
                content: messageText
            });

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: isMobile ? '100%' : 400,
                    bgcolor: 'var(--bg-drawer)',
                    borderLeft: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'var(--text-primary)'
                }
            }}
        >
            {friend && (
                <>
                    {/* Header */}
                    <Box sx={{ 
                        p: 2.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-light)',
                        bgcolor: 'var(--overlay-light)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                                bgcolor: 'var(--primary)',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }}>
                                {friend.name ? friend.name[0] : friend.username[0].toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    {friend.name || friend.username}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <IconButton 
                                onClick={handleClearChat}
                                title="Clear Chat History"
                                sx={{ 
                                    color: 'var(--text-secondary)', 
                                    mr: 1,
                                    '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } 
                                }}
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                            <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)', bgcolor: 'var(--border-light)' } }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Chat Area */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto', 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5,
                        bgcolor: 'var(--bg-root)'
                    }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress sx={{ color: 'var(--primary)' }} size={30} />
                            </Box>
                        ) : messages.length === 0 ? (
                            <Box sx={{ textAlign: 'center', mt: 10, color: 'var(--text-secondary)' }}>
                                <Typography variant="body2">No messages yet. Say hi!</Typography>
                            </Box>
                        ) : (
                            messages.map((msg, index) => {
                                // Deduplicate logic relies on index key or timestamp
                                const isMe = msg.sender_username === currentUsername;
                                return (
                                    <Fade in={true} key={msg._id || index}>
                                        <Box sx={{ 
                                            maxWidth: '75%', 
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            bgcolor: isMe ? 'var(--primary)' : 'var(--overlay-strong)',
                                            color: 'var(--text-primary)',
                                            p: 1.5,
                                            px: 2,
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                                {msg.content}
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                                display: 'block', 
                                                textAlign: isMe ? 'right' : 'left', 
                                                mt: 0.5, 
                                                color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                                                fontSize: '0.65rem'
                                            }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    </Fade>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area */}
                    <Box component="form" onSubmit={handleSendMessage} sx={{ 
                        p: 2, 
                        bgcolor: 'var(--bg-drawer)',
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'center'
                    }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'var(--overlay-medium)',
                                    borderRadius: '24px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: '1px solid rgba(99, 102, 241, 0.5)' }
                                },
                                '& .MuiOutlinedInput-input': {
                                    padding: '12px 20px'
                                }
                            }}
                        />
                        <IconButton 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            sx={{ 
                                bgcolor: newMessage.trim() ? 'var(--primary)' : 'var(--border-light)', 
                                color: 'var(--text-primary)',
                                borderRadius: '50%',
                                p: 1.2,
                                '&:hover': { bgcolor: newMessage.trim() ? 'var(--primary-hover)' : 'var(--border-main)' },
                                '&.Mui-disabled': { color: 'var(--border-extra)' }
                            }}
                        >
                            <SendIcon fontSize="small" sx={{ ml: 0.3 }} />
                        </IconButton>
                    </Box>
                </>
            )}
        </Drawer>
    );
}
