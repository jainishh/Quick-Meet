import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
const server = import.meta.env.VITE_API_URL;

const TopHeader = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [tick, setTick] = useState(0); // Numeric tick for guaranteed re-renders
    const ref = useRef(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name') || 'User';
    const username = localStorage.getItem('username') || '';

    const [profilePic, setProfilePic] = useState(localStorage.getItem('profile_picture') || null);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axiosInstance.get(`/api/v1/notifications/`);
            const sorted = (res.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(sorted);
        } catch (e) {
            // silently ignore
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for profile updates
        const handleProfileUpdate = () => {
            setProfilePic(localStorage.getItem('profile_picture') || null);
        };
        window.addEventListener('profileUpdate', handleProfileUpdate);

        // Listen for real-time refresh event
        const handleRefresh = () => {
            console.log('TopHeader: Refreshing notifications due to real-time update');
            fetchNotifications();
        };

        window.addEventListener('refreshMeetings', handleRefresh);


        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshMeetings', handleRefresh);
            window.removeEventListener('profileUpdate', handleProfileUpdate);
        };
    }, []);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id) => {
        try {
            await axiosInstance.put(`/api/v1/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
        } catch (e) {/* ignore */ }
    };

    const markAllRead = async () => {
        try {
            await axiosInstance.put(`/api/v1/notifications/read-all`);
            setNotifications([]);
        } catch (e) {/* ignore */ }
    };

    const respondToFriendRequest = async (id, requesterUsername, action) => {
        try {
            await axiosInstance.post(`/api/v1/friends/${action}`, {
                friend_username: requesterUsername
            });
            markRead(id);
            // If we are on the friends page, refresh it
            if (window.location.pathname === '/friends') {
                window.dispatchEvent(new CustomEvent('refreshFriends'));
            }
        } catch (e) {
            console.error(`Error ${action}ing friend request:`, e);
        }
    };

    const handleRespondMeeting = async (notificationId, action) => {
        try {
            await axiosInstance.post(`/api/v1/notifications/${notificationId}/respond`, null, {
                params: { action }
            });
            setNotifications(prev => prev.filter(n => (n._id || n.id) !== notificationId));
            window.dispatchEvent(new CustomEvent('refreshMeetings'));
        } catch (e) {
            console.error(`Error ${action}ing invite:`, e);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeAgo = (ts, currentTick) => {
        if (!ts) return '';
        const now = new Date();
        // Force UTC if no timezone is present to prevent local time mismatch
        const past = new Date(ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z');
        const diffInSeconds = Math.floor((now - past) / 1000);

        // If clock skew makes it negative, or it's very fresh
        if (diffInSeconds <= 5) return 'Just now';
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 1 }}>
            {/* Left - Date */}
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: { xs: '12px', md: '14px' }, fontWeight: 500, whiteSpace: 'nowrap' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Typography>

            {/* Right - Bell + User */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2.5 } }}>

                {/* Notification Bell */}
                <Box ref={ref} sx={{ position: 'relative' }}>
                    <IconButton onClick={() => setOpen(o => !o)} sx={{ position: 'relative', color: 'var(--text-secondary)', p: { xs: 0.5, sm: 1 } }}>
                        <NotificationsNoneOutlinedIcon fontSize="small" />
                        {unreadCount > 0 && (
                            <Box component="span" sx={{
                                position: 'absolute', top: { xs: '4px', sm: '6px' }, right: { xs: '4px', sm: '6px' },
                                width: '8px', height: '8px', backgroundColor: 'var(--primary-light)',
                                borderRadius: '50%'
                            }} />
                        )}
                    </IconButton>

                    {/* Dropdown */}
                    {open && (
                        <Box sx={{
                            position: 'absolute', top: '48px', 
                            right: { xs: '-130px', sm: 0 }, // Offset on mobile to prevent left clipping
                            zIndex: 9999,
                            width: { xs: 'calc(100vw - 40px)', sm: '360px' },
                            maxWidth: '360px',
                            background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-darker) 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            overflow: 'hidden',
                        }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px' }}>
                                    Notifications {unreadCount > 0 && <Box component="span" sx={{ ml: 1, px: '6px', py: '2px', bgcolor: 'var(--primary-light)20', color: 'var(--primary-light)', borderRadius: '10px', fontSize: '11px' }}>{unreadCount}</Box>}
                                </Typography>
                                {notifications.length > 0 && (
                                    <IconButton onClick={markAllRead} size="small" title="Clear all" sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--primary-light)' } }}>
                                        <DoneAllIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>

                            {/* List */}
                            <Box sx={{ maxHeight: '360px', overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'var(--border-main)', borderRadius: '4px' } }}>
                                {notifications.length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, gap: 1 }}>
                                        <NotificationsNoneOutlinedIcon sx={{ color: '#374151', fontSize: 36 }} />
                                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No notifications</Typography>
                                    </Box>
                                ) : (
                                    notifications.map((n) => {
                                        const id = n.id || n._id;
                                        const isMeetingInvite = n.type === 'meeting_invite';

                                        if (isMeetingInvite) {
                                            // IMAGE 1 STYLE
                                            return (
                                                <Box
                                                    key={id}
                                                    sx={{
                                                        display: 'flex', flexDirection: 'column',
                                                        px: 2.5, py: 2,
                                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                                        bgcolor: n.read ? 'transparent' : 'rgba(99,102,241,0.03)',
                                                        position: 'relative',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => markRead(id)}
                                                        sx={{ position: 'absolute', top: 12, right: 12, color: '#4B5563', p: 0.5 }}
                                                    >
                                                        <CloseIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>

                                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                        <Box sx={{
                                                            width: 48, height: 48, borderRadius: '12px',
                                                            bgcolor: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <EventIcon sx={{ fontSize: 24 }} />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1, pr: 2 }}>
                                                            <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', mb: 0.5 }}>
                                                                {n.title}
                                                            </Typography>
                                                            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>
                                                                {n.body}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            fullWidth
                                                            onClick={() => handleRespondMeeting(id, 'accept')}
                                                            sx={{
                                                                bgcolor: 'var(--primary)',
                                                                color: 'var(--text-primary)',
                                                                textTransform: 'none',
                                                                fontWeight: 700,
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                                                '&:hover': { bgcolor: 'var(--primary-hover)' }
                                                            }}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            fullWidth
                                                            onClick={() => handleRespondMeeting(id, 'reject')}
                                                            sx={{
                                                                borderColor: 'var(--border-main)',
                                                                color: 'var(--text-secondary)',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                                '&:hover': { borderColor: 'var(--border-extra)', bgcolor: 'rgba(255,255,255,0.02)' }
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            );
                                        } else {
                                            // IMAGE 2 STYLE
                                            return (
                                                <Box
                                                    key={id}
                                                    sx={{
                                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                                        px: 2.5, py: 1.5,
                                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                        bgcolor: n.read ? 'transparent' : 'rgba(139,92,246,0.05)',
                                                        transition: 'background 0.2s',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                                        cursor: n.type === 'direct_meet' ? 'pointer' : 'default'
                                                    }}
                                                    onClick={() => {
                                                        if (n.type === 'direct_meet' && n.data?.meeting_code) {
                                                            navigate(`/video-meet?roomID=${n.data.meeting_code}`);
                                                            markRead(id);
                                                        }
                                                    }}
                                                >
                                                    {/* Purple dot */}
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.read ? '#374151' : 'var(--primary-light)', flexShrink: 0 }} />

                                                    {/* Content */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography sx={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: n.read ? 400 : 700, lineHeight: 1.4 }}>
                                                            {n.title}
                                                        </Typography>
                                                        <Typography noWrap sx={{ color: 'var(--text-secondary)', fontSize: '12px', mt: '2px', lineHeight: 1.4 }}>
                                                            {n.body}
                                                        </Typography>
                                                        <Typography sx={{ color: '#4B5563', fontSize: '11px', mt: '4px' }}>
                                                            {timeAgo(n.timestamp, tick)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Right Side Icons */}
                                                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                                        <Box sx={{
                                                            width: 40, height: 40, borderRadius: '50%',
                                                            bgcolor: 'rgba(139,92,246,0.1)', color: 'var(--primary-light)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {n.type === 'friend_request' ? <CheckCircleOutlineIcon fontSize="small" /> : <VideocamOutlinedIcon fontSize="small" />}
                                                        </Box>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markRead(id);
                                                            }}
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute', bottom: -5, right: -5,
                                                                bgcolor: 'var(--bg-darker)', border: '1px solid var(--border-main)',
                                                                p: 0.2, color: '#4B5563', '&:hover': { color: 'var(--primary-light)', bgcolor: 'var(--bg-card)' }
                                                            }}
                                                        >
                                                            <CheckCircleOutlineIcon sx={{ fontSize: 12 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            );
                                        }
                                    })
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* User */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, borderLeft: '1px solid var(--border-extra)', pl: { xs: 1.5, sm: 2.5 }, cursor: 'pointer' }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: 'var(--text-primary)', fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, lineHeight: 1.2, margin: 0 }}>{name}</Typography>
                        <Typography sx={{ color: 'var(--primary-light)', fontSize: { xs: '9px', md: '10px' }, fontWeight: 700, letterSpacing: '1px', margin: 0 }}>PREMIUM PLAN</Typography>
                    </Box>
                    <Box
                        component="img"
                        // src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=FFFFFF&bold=true&size=36`}

                        // src={profilePic || https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=FFFFFF&bold=true&size=36}
                        src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=FFFFFF&bold=true&size=36`}

                        alt={name}
                        sx={{ width: { xs: '32px', sm: '36px' }, height: { xs: '32px', sm: '36px' }, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(139, 92, 246, 0.3)' }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default TopHeader;
