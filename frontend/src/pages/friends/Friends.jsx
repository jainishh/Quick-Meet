import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Avatar, 
    IconButton, 
    InputAdornment, 
    CircularProgress,        
    Fade,
    Paper,
    Snackbar,
    Alert,
    Tooltip,
    Badge,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';
import axiosInstance from '../../utils/axiosInstance';
import TopHeader from '../dashboard/TopHeader';
import ChatDrawer from '../../components/chat/ChatDrawer';
import { useSocket } from '../../context/SocketContext';

const server = import.meta.env.VITE_API_URL;

export default function Friends() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const socket = useSocket();
    
    const [chatOpen, setChatOpen] = useState(false);
    const [activeChatFriend, setActiveChatFriend] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    const token = localStorage.getItem("token");
    const currentUsername = localStorage.getItem('username');

    useEffect(() => {
        fetchFriends();
        fetchUnreadCounts();
        
        const handleRefresh = () => {
            fetchFriends();
            fetchUnreadCounts();
        };
        window.addEventListener('refreshFriends', handleRefresh);
        return () => window.removeEventListener('refreshFriends', handleRefresh);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            if (data.receiver_username === currentUsername) {
                const isChatOpenForSender = activeChatFriend && activeChatFriend.username === data.sender_username && chatOpen;
                
                if (isChatOpenForSender) {
                    // Chat is currently open, mark as read immediately behind the scenes
                    axiosInstance.post(`/api/v1/chat/read/${data.sender_username}`)
                        .then(() => window.dispatchEvent(new Event('chat-read')))
                        .catch(err => console.error(err));
                } else {
                    // Chat is closed, increment the local badge
                    setUnreadCounts(prev => ({ ...prev, [data.sender_username]: (prev[data.sender_username] || 0) + 1 }));
                }
            }
        };

        socket.on('receive-chat-message', handleReceiveMessage);

        return () => {
            socket.off('receive-chat-message', handleReceiveMessage);
        };
    }, [socket, chatOpen, activeChatFriend, currentUsername]);

    const fetchUnreadCounts = async () => {
        try {
            const res = await axiosInstance.get('/api/v1/chat/unread');
            setUnreadCounts(res.data);
        } catch (error) {
            console.error("Error fetching unread counts:", error);
        }
    };

    const handleOpenChat = async (friend) => {
        setActiveChatFriend(friend); 
        setChatOpen(true);
        
        // Mark as read in local state immediately
        if (unreadCounts[friend.username]) {
            setUnreadCounts(prev => ({ ...prev, [friend.username]: 0 }));
            // Mark as read backend
            try {
                await axiosInstance.post(`/api/v1/chat/read/${friend.username}`);
                window.dispatchEvent(new Event('chat-read'));
            } catch (err) {
                console.error("Failed to mark messages as read");
            }
        }
    };

    const handleMeet = async (friendUsername) => {
        const meetingCode = Math.random().toString(36).substring(2, 10);
        setNotification({ open: true, message: "Sending invite...", severity: "info" });
        try {
            await axiosInstance.post(`/api/v1/friends/invite`, {
                friend_username: friendUsername,
                meeting_code: meetingCode
            });
            // Redirect to meeting with state
            navigate(`/video-meet?roomID=${meetingCode}`, { state: { inviteSent: true } });
        } catch (error) {
            console.error("Error sending invite:", error);
            // Even if notification fails, we still want to join the meeting
            navigate(`/video-meet?roomID=${meetingCode}`, { state: { inviteSent: false, error: "Failed to send notification" } });
        }
    };

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/friends/list`);
            setFriends(response.data.friends || []);
            setPendingRequests(response.data.pending || []);
            setSentRequests(response.data.sent || []);
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axiosInstance.get(`/api/v1/friends/search`, {
                params: { query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setSearching(false);
        }
    };

    const addFriend = async (friendUsername) => {
        try {
            const response = await axiosInstance.post(`/api/v1/friends/add`, {
                friend_username: friendUsername
            });
            setNotification({ open: true, message: "Friend request sent!", severity: "success" });
            fetchFriends();
            setSearchResults([]);
            setSearchQuery("");
        } catch (error) {
            setNotification({ 
                open: true, 
                message: error.response?.data?.detail || "Failed to send request", 
                severity: "error" 
            });
        }
    };

    const acceptFriend = async (friendUsername) => {
        try {
            const response = await axiosInstance.post(`/api/v1/friends/accept`, {
                friend_username: friendUsername
            });
            setNotification({ open: true, message: "Request accepted!", severity: "success" });
            fetchFriends();
        } catch (error) {
            setNotification({ 
                open: true, 
                message: "Failed to accept request", 
                severity: "error" 
            });
        }
    };

    const rejectFriend = async (friendUsername) => {
        try {
            await axiosInstance.post(`/api/v1/friends/reject`, {
                friend_username: friendUsername
            });
            setNotification({ open: true, message: "Request rejected", severity: "info" });
            fetchFriends();
        } catch (error) {
            setNotification({ 
                open: true, 
                message: "Failed to reject request", 
                severity: "error" 
            });
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-primary)', maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 0 } }}>
            <TopHeader />

            {/* Header Section */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Friends Network
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                    Connect with your teammates and start instant meetings.
                </Typography>
            </Box>

            {/* Search Section */}
            <Box sx={{ position: 'relative', zIndex: 10 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by username or name..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'var(--primary)' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            bgcolor: 'var(--overlay-light)',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)',
                            backdropFilter: 'blur(10px)',
                            '& fieldset': { border: 'none' },
                            '&:hover': { bgcolor: 'var(--overlay-strong)' },
                        }
                    }}
                />

                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && (
                    <Paper 
                        sx={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                            right: 0, 
                            mt: 1, 
                            bgcolor: 'var(--bg-card-alt)', 
                            border: '1px solid var(--border-main)',
                            borderRadius: '16px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            color: 'var(--text-primary)',
                            zIndex: 100,
                            p: 1
                        }}
                    >
                        {searching ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                            </Box>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <Box 
                                    key={user.username}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'var(--primary)' }}>{user.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>@{user.username}</Typography>
                                        </Box>
                                    </Box>
                                    <Button 
                                        variant="contained" 
                                        size="small"
                                        startIcon={sentRequests.some(r => r.username === user.username) ? null : (!isMobile && <PersonAddIcon />)}
                                        onClick={() => addFriend(user.username)}
                                        disabled={friends.some(f => f.username === user.username) || sentRequests.some(r => r.username === user.username) || pendingRequests.some(r => r.username === user.username)}
                                        sx={{ 
                                            borderRadius: '8px', 
                                            textTransform: 'none',
                                            bgcolor: 'var(--primary)',
                                            minWidth: isMobile ? '80px' : 'auto',
                                            '&:hover': { bgcolor: 'var(--primary-hover)' }
                                        }}
                                    >
                                        {friends.some(f => f.username === user.username) ? 'Friend' : 
                                         sentRequests.some(r => r.username === user.username) ? (isMobile ? 'Pend' : 'Pending') :
                                         pendingRequests.some(r => r.username === user.username) ? (isMobile ? 'Req' : 'Requested You') : 'Add'}
                                    </Button>
                                </Box>
                            ))
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No users found
                            </Box>
                        )}
                    </Paper>
                )}
            </Box>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        Pending Requests <Box sx={{ fontSize: '0.75rem', bgcolor: 'rgba(234, 179, 8, 0.2)', color: '#EAB308', px: 1.5, py: 0.5, borderRadius: '12px' }}>{pendingRequests.length}</Box>
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {pendingRequests.map((req, index) => (
                            <Fade in={true} key={req.username}>
                                <Paper sx={{ 
                                    bgcolor: 'var(--bg-card)', 
                                    border: '1px solid rgba(234, 179, 8, 0.2)',
                                    borderRadius: '16px',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    backdropFilter: 'blur(10px)',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#EAB308', fontWeight: 700 }}>{req.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{req.name}</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>@{req.username}</Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1.5, width: isMobile ? '100%' : 'auto' }}>
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            fullWidth={isMobile}
                                            onClick={() => acceptFriend(req.username)}
                                            sx={{ borderRadius: '10px', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', px: 3 }}
                                        >
                                            Accept
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            fullWidth={isMobile}
                                            onClick={() => rejectFriend(req.username)}
                                            sx={{ borderRadius: '10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)', '&:hover': { borderColor: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.05)' }, textTransform: 'none' }}
                                        >
                                            Ignore
                                        </Button>
                                    </Box>
                                </Paper>
                            </Fade>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Friends List Section */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    Your Friends <Box sx={{ fontSize: '0.75rem', bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', px: 1.5, py: 0.5, borderRadius: '12px' }}>{friends.length}</Box>
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress sx={{ color: 'var(--primary)' }} />
                    </Box>
                ) : friends.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {friends.map((friend, index) => (
                            <Fade in={true} timeout={300 + index * 50} key={friend.username}>
                                <Paper sx={{ 
                                    bgcolor: 'var(--bg-card)', 
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '16px',
                                    p: isMobile ? 1.5 : 2,
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    justifyContent: 'space-between',
                                    gap: isMobile ? 2 : 0,
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        bgcolor: 'var(--overlay-medium)',
                                        borderColor: 'rgba(99, 102, 241, 0.4)',
                                        boxShadow: '0 0 25px rgba(99, 102, 241, 0.15)',
                                        '& .friend-avatar': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                                        }
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                        <Avatar 
                                            className="friend-avatar"
                                            sx={{ 
                                                width: 48, 
                                                height: 48, 
                                                background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)`,
                                                fontSize: '1.2rem',
                                                fontWeight: 700,
                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                                transition: 'all 0.4s ease'
                                            }}
                                        >
                                            {friend.name[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.2 }}>{friend.name}</Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>@{friend.username}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', gap: 1.5 }}>
                                        <Button 
                                            variant="contained" 
                                            fullWidth={isMobile}
                                            startIcon={<VideocamIcon style={{ fontSize: 18 }} />}
                                            onClick={() => handleMeet(friend.username)}
                                            sx={{ 
                                                borderRadius: '10px', 
                                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                                color: '#818CF8',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                px: 2.5,
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                '&:hover': { 
                                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                                                    color: 'var(--text-primary)',
                                                    borderColor: 'transparent'
                                                }
                                            }}
                                        >
                                            Meet
                                        </Button>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton 
                                                onClick={() => handleOpenChat(friend)}
                                                sx={{ 
                                                    bgcolor: 'rgba(255,255,255,0.03)', 
                                                    borderRadius: '10px',
                                                    color: 'var(--text-secondary)',
                                                    '&:hover': { color: 'var(--text-primary)', bgcolor: 'rgba(99, 102, 241, 0.15)' }
                                                }}
                                            >
                                                <Badge badgeContent={unreadCounts[friend.username] || 0} color="error" max={99}>
                                                    <ChatBubbleOutlineIcon fontSize="small" />
                                                </Badge>
                                            </IconButton>
                                            <IconButton size="small" sx={{ color: 'var(--text-secondary)' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Fade>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 12, 
                        bgcolor: 'var(--bg-dark)', 
                        borderRadius: '24px',
                        border: '1px dashed var(--border-main)'
                    }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-secondary)', mb: 2 }}>You haven't added any friends yet</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 3 }}>Use the search bar above to find and connect with people.</Typography>
                    </Box>
                )}
            </Box>

            {/* Notification Snackbar */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, open: false })} 
                    severity={notification.severity}
                    sx={{ borderRadius: '12px', bgcolor: notification.severity === 'success' ? '#10B981' : '#EF4444', color: 'var(--text-primary)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Chat Drawer */}
            <ChatDrawer 
                open={chatOpen} 
                onClose={() => setChatOpen(false)} 
                friend={activeChatFriend} 
            />
        </Box>
    );
}
