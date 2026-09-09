import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const UpcomingMeetings = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

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
                    const normalizedParticipants = Array.isArray(m.participants)
                        ? m.participants.map(p => typeof p === 'object' ? p.username : p)
                        : [];
                    return {
                        ...m,
                        month: start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
                        day: start.getDate(),
                        time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        participants: normalizedParticipants,
                        participantCount: normalizedParticipants.length,
                    };
                })
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setMeetings(filtered);
        } catch (error) {
            console.error('Error fetching upcoming meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();

        // Listen for real-time refresh event
        const handleRefresh = () => {
            console.log('UpcomingMeetings: Refreshing meetings due to real-time update');
            fetchMeetings();
        };

        window.addEventListener('refreshMeetings', handleRefresh);
        return () => window.removeEventListener('refreshMeetings', handleRefresh);
    }, [token]);

    const displayMeetings = meetings.slice(0, 2);

    if (loading) return null;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" sx={{ fontSize: { xs: '16px', md: '18px' }, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
                    <CalendarMonthIcon sx={{ color: 'var(--primary)', fontSize: '20px' }} />
                    Upcoming Meetings
                </Typography>
                <Button
                    onClick={() => navigate('/upcoming')}
                    sx={{ color: 'var(--primary-light)', fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'none', p: 0, minWidth: 'auto', '&:hover': { background: 'none', textDecoration: 'underline' } }}
                >
                    View Schedule
                </Button>
            </Box>

            {/* Meeting Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {displayMeetings.length > 0 ? (
                    displayMeetings.map((meeting, idx) => (
                        <Box key={idx} sx={{
                            display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', flexDirection: { xs: 'column', sm: 'row' },
                            border: '1px solid var(--border-light)', borderRadius: '14px', p: { xs: 2, md: 2 }
                        }}>
                            {/* Top/Left Section: Date + Info */}
                            <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, flexGrow: 1, alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                                {/* Date Badge */}
                                <Box sx={{
                                    width: { xs: '48px', md: '56px' }, height: { xs: '48px', md: '56px' }, borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', mr: 2, flexShrink: 0
                                }}>
                                    <Typography sx={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{meeting.month}</Typography>
                                    <Typography sx={{ fontSize: { xs: '18px', md: '22px' }, color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1 }}>{meeting.day}</Typography>
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ color: 'var(--text-primary)', fontSize: { xs: '13px', md: '14px' }, fontWeight: 600, m: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meeting.title}</Typography>
                                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <AccessTimeIcon sx={{ fontSize: '14px' }} />
                                        {meeting.time}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Avatars */}
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, pl: { xs: '64px', sm: 0 } }}>
                                {[...Array(Math.min(meeting.participantCount || 0, 3))].map((_, i) => (
                                    <Box
                                        component="img"
                                        key={i}
                                        src={`https://ui-avatars.com/api/?name=U${i + 1}&background=${['8B5CF6', '6366F1', '4F46E5'][i]}&color=fff&size=28&bold=true`}
                                        alt=""
                                        sx={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            border: '2px solid var(--bg-card)', ml: i > 0 ? '-8px' : '0'
                                        }}
                                    />
                                ))}
                                {(meeting.participantCount || 0) > 3 && (
                                    <Box component="span" sx={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        backgroundColor: 'var(--border-main)', border: '2px solid var(--bg-card)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '10px', color: '#D1D5DB', fontWeight: 600, ml: '-8px'
                                    }}>
                                        +{(meeting.participantCount || 0) - 3}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Box sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'var(--bg-card)',
                        borderRadius: '14px',
                        border: '1px solid var(--border-light)'
                    }}>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            No upcoming meetings scheduled.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default UpcomingMeetings;
