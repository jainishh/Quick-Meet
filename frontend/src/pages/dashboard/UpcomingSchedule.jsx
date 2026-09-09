import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const UpcomingSchedule = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!token) return;
            try {
                const response = await axiosInstance.get(`/api/v1/meetings/`);
                const now = new Date();
                const email = localStorage.getItem('email');
                const data = Array.isArray(response.data) ? response.data : [];
                const filtered = data.filter(m => {
                    const isFuture = new Date(m.startTime) > now;
                    if (!isFuture) return false;
                    if (m.user_id === email) return true;
                    const myParticipant = Array.isArray(m.participants)
                        ? m.participants.find(p => (typeof p === 'object' ? p.username : p) === email)
                        : null;
                    return !myParticipant || myParticipant.status !== 'rejected';
                })
                    .map(m => {
                        const start = new Date(m.startTime);
                        const end = new Date(m.endTime);
                        const durationInMinutes = Math.round((end - start) / 60000);
                        return {
                            ...m,
                            id: m.meetingCode,
                            month: start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                            day: start.getDate(),
                            date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            time: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`,
                            duration: durationInMinutes > 60 ? `${(durationInMinutes / 60).toFixed(1)} hours` : `${durationInMinutes} mins`,
                            participants: Array.isArray(m.participants)
                                ? m.participants.map(p => typeof p === 'object' ? p : { name: p, username: p, status: 'pending' })
                                : (m.participants && typeof m.participants === 'string'
                                    ? m.participants.split(',').map(p => ({ name: p.trim(), username: p.trim(), status: 'pending' }))
                                    : []),
                            participantCount: Array.isArray(m.participants) ? m.participants.length : 0
                        };
                    })
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                setMeetings(filtered);
            } catch (error) {
                console.error('Error fetching upcoming schedule:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, [token]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100%', bgcolor: 'transparent' }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        color: 'var(--text-secondary)',
                        bgcolor: 'var(--border-light)',
                        '&:hover': { bgcolor: 'var(--border-main)', color: 'var(--text-primary)' }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        Upcoming Schedule
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Plan and manage your future collaborations
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="h6" color="var(--text-secondary)">Loading Schedule...</Typography>
                </Box>
            ) : meetings.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 8,
                        p: 4,
                        bgcolor: 'var(--overlay-light)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-light)'
                    }}
                >
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <CalendarMonthIcon sx={{ color: 'var(--primary)', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}>
                        No Upcoming Meetings
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
                        Your schedule is currently clear. When you or someone else schedules a meeting, it will appear here.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                    {meetings.map((meeting) => (
                        <Paper
                            key={meeting.id}
                            sx={{
                                p: 3,
                                bgcolor: 'var(--overlay-light)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '20px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: { xs: 2, md: 4 },
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'var(--overlay-medium)',
                                    transform: 'translateX(8px)',
                                    borderColor: 'rgba(99, 102, 241, 0.3)'
                                }
                            }}
                        >
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CalendarMonthIcon fontSize="large" />
                            </Box>

                            <Box sx={{ flexGrow: 1, minWidth: '200px' }}>
                                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 0.5 }}>
                                    {meeting.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span style={{ color: 'var(--primary)' }}>#{meeting.meetingCode}</span> • {meeting.description || "No description provided"}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--text-secondary)', mb: 0.5 }}>
                                        <CalendarMonthIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{meeting.date}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--text-secondary)' }}>
                                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption">{meeting.time} ({meeting.duration})</Typography>
                                    </Box>
                                </Box>

                                <Chip
                                    icon={<GroupIcon sx={{ fontSize: '1rem !important', color: 'var(--primary) !important' }} />}
                                    label={`${meeting.participantCount} Invited`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--primary)',
                                        fontWeight: 800,
                                        borderRadius: '8px',
                                        px: 1
                                    }}
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UpcomingSchedule;
