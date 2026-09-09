import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

export default function PastMeetings({ meetings = [] }) {
    const navigate = useNavigate();

    // Filter for meetings that have already ended
    const now = new Date();
    const pastMeetings = meetings.filter(m => {
        const endTime = new Date(`${m.date}T${m.endTime}`);
        return endTime < now;
    }).sort((a, b) => {
        // Sort by date/time descending to get most recent first
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateB - dateA;
    });

    // Take only the last 2
    const displayMeetings = pastMeetings.slice(0, 2);

    return (
        <Box sx={{ mt: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    Past Meetings
                </Typography>
                <Box
                    onClick={() => navigate('/meetings/history')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        '&:hover': { color: 'var(--primary-light)', '& .arrow': { transform: 'translateX(4px)' } }
                    }}
                >
                    View All History
                    <ArrowForwardIcon className="arrow" fontSize="small" sx={{ transition: 'transform 0.2s' }} />
                </Box>
            </Box>

            {pastMeetings.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        bgcolor: 'var(--overlay-light)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-light)',
                        textAlign: 'center'
                    }}
                >
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}>
                        <HistoryIcon sx={{ color: 'var(--primary)', opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 1 }}>
                        You haven't attended any meetings yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.6 }}>
                        Completed meetings will appear here for your records. Keep collaborating!
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                    {displayMeetings.map((meeting) => (
                        <Box
                            key={meeting.id}
                            onClick={() => navigate('/meetings/history')}
                            sx={{
                                flex: 1,
                                bgcolor: 'var(--overlay-light)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '16px',
                                p: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2.5,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'var(--overlay-strong)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    borderColor: 'rgba(99, 102, 241, 0.3)',
                                    '& .icon-box': {
                                        bgcolor: 'var(--primary)',
                                        color: 'var(--text-primary)'
                                    }
                                }
                            }}
                        >
                            <Box
                                className="icon-box"
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <HistoryIcon />
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                                    {meeting.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {meeting.startTime} - {meeting.endTime}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
