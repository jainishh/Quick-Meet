import React from 'react';
import {
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../../../utils/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL;

export default function NotificationPopover({
    anchorEl,
    open,
    onClose,
    notifications,
    setNotifications,
    loading,
    refreshMeetings
}) {
    const handleRespond = async (notificationId, action) => {
        try {
            await axiosInstance.post(`/api/v1/notifications/${notificationId}/respond`, null, {
                params: { action }
            });

            // Remove the notification from the list
            setNotifications(prev => prev.filter(n => (n._id || n.id) !== notificationId));

            // Refresh meetings to show updated status
            if (refreshMeetings) refreshMeetings();

        } catch (error) {
            console.error(`Error ${action}ing invite:`, error);
        }
    };

    const handleClearAll = async () => {
        try {
            await axiosInstance.put(`/api/v1/notifications/read-all`);
            setNotifications([]);
            onClose();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axiosInstance.put(`/api/v1/notifications/${notificationId}/read`);
            setNotifications(prev => prev.filter(n => (n._id || n.id) !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };
    
    const timeAgo = (ts) => {
        if (!ts) return 'Just now';
        const now = new Date();
        const past = new Date(ts.includes('Z') || ts.includes('+') ? ts : ts + 'Z');
        const diffInSeconds = Math.floor((now - past) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return past.toLocaleDateString();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                sx: {
                    width: { xs: 'calc(100vw - 32px)', sm: 360 },
                    maxWidth: 360,
                    bgcolor: 'var(--bg-card-alt)',
                    border: '1px solid var(--border-main)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px var(--shadow-strong)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                    Notifications
                </Typography>
                {notifications.length > 0 && (
                    <Button
                        size="small"
                        onClick={handleClearAll}
                        sx={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 600 }}
                    >
                        Clear All
                    </Button>
                )}
            </Box>

            {/* List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'rgba(148, 163, 184, 0.2)', mb: 2 }} />
                        <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>All caught up!</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>No new notifications to show</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                                {notifications.map((n, i) => {
                                    const isMeetingInvite = n.type === 'meeting_invite';
                                    const id = n._id || n.id;

                                    if (isMeetingInvite) {
                                        // IMAGE 1 STYLE
                                        return (
                                            <React.Fragment key={id}>
                                                <ListItem 
                                                    sx={{ 
                                                        flexDirection: 'column', 
                                                        alignItems: 'stretch', 
                                                        p: 2,
                                                        position: 'relative',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                                                    }}
                                                >
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => markAsRead(id)} 
                                                        sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--text-secondary)', p: 0.5 }}
                                                    >
                                                        <CloseIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>

                                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                        <Avatar sx={{ 
                                                            width: 50, 
                                                            height: 50, 
                                                            bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                                            color: 'var(--primary)',
                                                            borderRadius: '14px' 
                                                        }}>
                                                            <EventIcon sx={{ fontSize: 24 }} />
                                                        </Avatar>
                                                        <Box sx={{ flexGrow: 1, pr: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                                                                {n.title}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                                {n.body}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                        <Button 
                                                            variant="contained" 
                                                            fullWidth
                                                            onClick={() => handleRespond(id, 'accept')}
                                                            sx={{ 
                                                                bgcolor: 'var(--primary)', 
                                                                color: 'var(--text-primary)', 
                                                                textTransform: 'none', 
                                                                fontWeight: 700,
                                                                borderRadius: '10px',
                                                                py: 1,
                                                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                                                '&:hover': { bgcolor: 'var(--primary-hover)' }
                                                            }}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button 
                                                            variant="outlined" 
                                                            fullWidth
                                                            onClick={() => handleRespond(id, 'reject')}
                                                            sx={{ 
                                                                borderColor: 'var(--border-main)', 
                                                                color: 'var(--text-secondary)', 
                                                                textTransform: 'none', 
                                                                fontWeight: 600,
                                                                borderRadius: '10px',
                                                                py: 1,
                                                                '&:hover': { borderColor: 'var(--border-extra)', bgcolor: 'rgba(255,255,255,0.02)' }
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                </ListItem>
                                                {i < notifications.length - 1 && <Divider sx={{ borderColor: 'var(--border-light)' }} />}
                                            </React.Fragment>
                                        );
                                    } else {
                                        // IMAGE 2 STYLE (Compact)
                                        return (
                                            <React.Fragment key={id}>
                                                <Box
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
                                                            window.location.href = `/video-meet?roomID=${n.data.meeting_code}`;
                                                            markAsRead(id);
                                                        }
                                                    }}
                                                >
                                                    {/* Purple dot icon */}
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
                                                            {timeAgo(n.timestamp)}
                                                        </Typography>
                                                    </Box>

                                                    {/* Right Side Icons */}
                                                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                                        <Box sx={{ 
                                                            width: 40, height: 40, borderRadius: '50%', 
                                                            bgcolor: 'rgba(139,92,246,0.1)', color: 'var(--primary-light)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                        }}>
                                                            {n.type === 'friend_request' ? <Box sx={{ fontSize: 18 }}>✓</Box> : <Box sx={{ fontSize: 18 }}>🎥</Box>}
                                                        </Box>
                                                        <IconButton 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(id);
                                                            }} 
                                                            size="small" 
                                                            sx={{ 
                                                                position: 'absolute', bottom: -5, right: -5,
                                                                bgcolor: 'var(--bg-darker)', border: '1px solid var(--border-main)',
                                                                p: 0.2, color: '#4B5563', '&:hover': { color: 'var(--primary-light)', bgcolor: 'var(--bg-card)' } 
                                                            }}
                                                        >
                                                            <Box sx={{ fontSize: 10 }}>✓</Box>
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                {i < notifications.length - 1 && <Divider sx={{ borderColor: 'var(--border-light)' }} />}
                                            </React.Fragment>
                                        );
                                    }
                                })}
                    </List>
                )}
            </Box>
        </Popover>
    );
}
