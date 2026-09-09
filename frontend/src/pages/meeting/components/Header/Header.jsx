import React, { useState, useEffect } from 'react';
import { Box, InputBase, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import Badge from '@mui/material/Badge';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import NotificationPopover from './NotificationPopover';
import axiosInstance from '../../../../utils/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ onSchedule, onUpdate, onDelete, onRefresh, editingMeeting, isEditModalOpen, onCloseEdit, autoOpenCreate }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            setLoadingNotifications(true);
            const response = await axiosInstance.get(`/api/v1/notifications`);
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (autoOpenCreate) {
            setIsCreateModalOpen(true);
        }
    }, [autoOpenCreate]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    const handleOpenNotifications = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleCloseNotifications = () => {
        setNotificationAnchor(null);
    };

    const handleSchedule = async (meetingData) => {
        if (onSchedule) onSchedule(meetingData);
    };

    const handleUpdate = async (meetingData) => {
        if (onUpdate) onUpdate(meetingData);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, justifyContent: 'space-between', mb: { xs: 3, md: 4 } }}>
            {/* Search Bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'var(--overlay-light)',
                    borderRadius: '12px',
                    px: 2,
                    py: 1,
                    width: { xs: '100%', md: '400px' },
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.3s ease',
                    flexGrow: { xs: 1, md: 0 },
                    '&:focus-within': {
                        bgcolor: 'var(--overlay-strong)',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                    }
                }}
            >
                <SearchIcon sx={{ color: 'var(--text-secondary)', mr: 1, fontSize: 20 }} />
                <InputBase
                    placeholder="Search meetings, participants..."
                    sx={{ color: 'var(--text-secondary)', width: '100%', fontSize: '0.95rem' }}
                />
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleOpenNotifications}
                    sx={{
                        bgcolor: 'var(--overlay-medium)',
                        color: notifications.length > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-light)',
                        '&:hover': {
                            bgcolor: 'var(--overlay-dark)',
                            color: 'var(--text-secondary)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <Badge 
                        badgeContent={notifications.length} 
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                bgcolor: '#EF4444',
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                minWidth: '16px',
                                height: '16px',
                                padding: '0 4px'
                            }
                        }}
                    >
                        {notifications.length > 0 ? <NotificationsIcon fontSize="small" /> : <NotificationsNoneIcon fontSize="small" />}
                    </Badge>
                </IconButton>

                <NotificationPopover 
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleCloseNotifications}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    loading={loadingNotifications}
                    refreshMeetings={onRefresh}
                />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                    sx={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: { xs: 2.5, sm: 3 },
                        py: 1,
                        flexGrow: { xs: 1, sm: 0 },
                        boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                            transform: 'translateY(-2px)',
                        }
                    }}
                >
                    Schedule New Meeting
                </Button>
            </Box>

            {/* Create Meeting Modal */}
            <ScheduleMeetingModal 
                open={isCreateModalOpen} 
                onClose={handleCloseCreateModal} 
                onSchedule={handleSchedule} 
            />

            {/* Edit Meeting Modal */}
            <ScheduleMeetingModal 
                open={isEditModalOpen} 
                onClose={onCloseEdit} 
                onSchedule={handleUpdate}
                onDelete={onDelete}
                initialData={editingMeeting}
            />
        </Box>
    );
}
