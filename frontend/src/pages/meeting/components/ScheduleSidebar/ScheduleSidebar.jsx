import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Avatar, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function ScheduleSidebar({ meetings = [], onEdit }) {
    const currentUserEmail = localStorage.getItem('email');
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    // Find all upcoming meetings
    const getUpcomingMeetings = () => {
        if (!meetings || meetings.length === 0) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Sort all meetings by date and time
        const allMeetings = [...meetings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
        });

        // Find meetings that are today or in future
        const upcoming = allMeetings.filter(m => {
            const mDate = new Date(m.date);
            mDate.setHours(0, 0, 0, 0);
            return mDate >= today;
        });

        if (upcoming.length === 0) return [];

        // Get the date of the very next meeting
        const nextMeetingDate = upcoming[0].date;

        // Filter to only include meetings on that SAME date
        return upcoming.filter(m => m.date === nextMeetingDate).map(m => ({
            ...m,
            isToday: new Date(m.date).toDateString() === new Date().toDateString(),
        }));
    };

    const upcomingMeetings = getUpcomingMeetings();
    const nextMeeting = upcomingMeetings[currentIndex];

    // Functions for pagination
    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (currentIndex < upcomingMeetings.length - 1) setCurrentIndex(currentIndex + 1);
    };

    // Parse participants for display
    const participantList = nextMeeting?.participants ? (
        typeof nextMeeting.participants === 'string'
            ? nextMeeting.participants.split(',').map(p => p.trim())
            : nextMeeting.participants
    ).map((p, i) => {
        // Handle both object format from backend and string format (fallback/manual)
        const name = typeof p === 'object' ? p.name : (p.includes('(') ? p.split('(')[0].trim() : (p.includes('@') ? p.split('@')[0] : p));
        const email = typeof p === 'object' ? p.username : (p.includes('(') ? p.split('(')[1].replace(')', '').trim() : (p.includes('@') ? p : ''));
        const status = typeof p === 'object' ? (p.status || 'pending') : 'pending';

        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        // Map status to UI properties
        let statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        let statusColor = 'default';
        if (status === 'confirmed') statusColor = 'success';
        else if (status === 'rejected') {
            statusColor = 'error';
            statusLabel = 'Rejected';
        } else {
            statusColor = 'warning';
            statusLabel = 'Pending';
        }

        const isHost = email === nextMeeting.user_id;
        return { id: initials, name, email, role: isHost ? 'Host' : 'Participant', isHost, status: statusLabel, color: statusColor };
    }) : [];

    if (!nextMeeting) {
        return (
            <Box sx={{
                height: '100%',
                bgcolor: 'var(--bg-card)',
                borderRadius: '24px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-light)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Visual Glow */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <EventIcon sx={{ color: 'var(--primary)', fontSize: 32 }} />
                </Box>

                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    All Clear for Now
                </Typography>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, maxWidth: '200px', position: 'relative', zIndex: 1 }}>
                    You don't have any upcoming meetings scheduled.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: '100%',
                bgcolor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '24px',
                p: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                    label="NEXT UP"
                    size="small"
                    sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        letterSpacing: 1,
                        borderRadius: '6px'
                    }}
                />
            </Box>

            <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.5px', mb: 1 }}>
                {nextMeeting.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6, mb: 3 }}>
                {nextMeeting.description}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {nextMeeting.isToday ? 'Today' : nextMeeting.date}, {nextMeeting.startTime} - {nextMeeting.endTime}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinkIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'var(--primary)',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            '&:hover': { color: 'var(--primary-light)' }
                        }}
                    >
                        {`${window.location.origin}/video-meet?roomID=${nextMeeting.meetingCode}`}
                    </Typography>
                </Box>
            </Box>

            {/* Participants */}
            <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 800, letterSpacing: 1.5, mb: 1.5, display: 'block' }}>
                PARTICIPANTS ({participantList.length})
            </Typography>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                flexGrow: 1,
                overflowY: 'auto',
                minHeight: 0,
                pr: 0.5,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'var(--border-main)', borderRadius: '4px' },
            }}>
                {participantList.map((p, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'var(--border-main)', color: 'var(--text-secondary)', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
                            {p.id}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                                {p.name} {p.isHost && <span style={{ color: 'var(--primary)', fontSize: '0.65rem', marginLeft: '4px' }}>(Host)</span>}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                @{p.email}
                            </Typography>
                        </Box>
                        <Chip
                            label={p.status}
                            size="small"
                            color={p.color}
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: p.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.15)' :
                                    p.status === 'Pending' ? 'rgba(234, 179, 8, 0.15)' :
                                        'rgba(239, 68, 68, 0.15)',
                                color: p.status === 'Confirmed' ? '#22C55E' :
                                    p.status === 'Pending' ? '#EAB308' :
                                        '#EF4444',
                                '& .MuiChip-label': { px: 1 }
                            }}
                        />
                    </Box>
                ))}
            </Box>

            {/* Pagination Controls */}
            {upcomingMeetings.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
                    <IconButton size="small" onClick={handlePrev} disabled={currentIndex === 0} sx={{ color: 'var(--text-secondary)', '&.Mui-disabled': { color: 'var(--border-main)' } }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {currentIndex + 1} of {upcomingMeetings.length}
                    </Typography>
                    <IconButton size="small" onClick={handleNext} disabled={currentIndex === upcomingMeetings.length - 1} sx={{ color: 'var(--text-secondary)', '&.Mui-disabled': { color: 'var(--border-main)' } }}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {nextMeeting.isToday && (() => {
                    const hostEmail = nextMeeting.user_id;
                    const isHost = hostEmail === currentUserEmail;

                    // Check if there are any pending participants (excluding the host)
                    const hasPendingParticipants = nextMeeting.participants?.some(p => {
                        const pEmail = typeof p === 'object' ? p.username : p;
                        const pStatus = typeof p === 'object' ? p.status : 'pending';
                        return pEmail !== hostEmail && pStatus === 'pending';
                    });

                    // Check if current user is confirmed (for participants)
                    const isConfirmedParticipant = nextMeeting.participants?.some(p => {
                        const pEmail = typeof p === 'object' ? p.username : p;
                        const pStatus = typeof p === 'object' ? p.status : 'pending';
                        return pEmail === currentUserEmail && pStatus === 'confirmed';
                    });

                    // Check if at least one participant has confirmed
                    const atLeastOneConfirmed = nextMeeting.participants?.some(p => {
                        const pEmail = typeof p === 'object' ? p.username : p;
                        const pStatus = typeof p === 'object' ? p.status : 'pending';
                        return pEmail !== hostEmail && pStatus === 'confirmed';
                    });

                    if (isHost) {
                        // Host sees button ONLY if at least one person confirmed AND no one is pending
                        return atLeastOneConfirmed && !hasPendingParticipants;
                    } else {
                        // Participant sees button ONLY if they have confirmed
                        return isConfirmedParticipant;
                    }
                })() && (
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/${nextMeeting.meetingCode || nextMeeting.id}`)}
                            sx={{
                                bgcolor: 'var(--primary)',
                                color: 'var(--text-primary)',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                py: 1.5,
                                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'var(--primary-hover)',
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            Join Meeting
                        </Button>
                    )}

                {nextMeeting.isHost && (
                    <Button
                        variant="outlined"
                        onClick={() => onEdit && onEdit(nextMeeting)}
                        sx={{
                            borderColor: 'var(--border-main)',
                            color: 'var(--text-secondary)',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            py: 1.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'var(--border-strong)',
                                bgcolor: 'var(--border-light)',
                            }
                        }}
                    >
                        Edit Details
                    </Button>
                )}
            </Box>
        </Box>
    );
}
