import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const InsightsSidebar = () => {
    const activeContacts = [
        { name: 'Sarah Jenkins', status: 'online' },
        { name: 'Marcus Thorne', status: 'online' },
    ];

    return (
        <Box sx={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: '16px', p: { xs: 2.5, md: 3 },
            display: 'flex', flexDirection: 'column', gap: 2.5,
            width: '100%'
        }}>
            {/* Title */}
            <Typography component="h3" sx={{ color: 'var(--text-primary)', fontSize: { xs: '16px', md: '18px' }, fontWeight: 700, m: 0 }}>
                Attendance & Insights
            </Typography>

            {/* Total Meeting Hours */}
            <Box sx={{
                backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-light)',
                borderRadius: '14px', p: 2.5
            }}>
                <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, m: '0 0 4px 0' }}>Total Meeting Hours</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Typography component="span" sx={{ color: 'var(--text-primary)', fontSize: { xs: '32px', md: '36px' }, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                        18.5
                    </Typography>
                    <Typography component="span" sx={{ color: 'var(--primary-light)', fontSize: '14px', fontWeight: 700, pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        +12%
                    </Typography>
                </Box>
                <Typography sx={{ color: 'var(--text-secondary)', fontSize: '11px', m: '4px 0 0 0' }}>v.s. 16.2 hours last week</Typography>
            </Box>

            {/* Average Attendance */}
            <Box sx={{
                backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-light)',
                borderRadius: '14px', p: 2.5
            }}>
                <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, m: '0 0 4px 0' }}>Average Attendance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography component="span" sx={{ color: 'var(--text-primary)', fontSize: { xs: '32px', md: '36px' }, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                        94%
                    </Typography>
                    <Typography component="span" sx={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, pb: 0.5 }}>Stable</Typography>
                </Box>
                {/* Progress Bar */}
                <Box sx={{ height: '6px', width: '100%', backgroundColor: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
                    <Box sx={{
                        height: '100%', width: '94%', borderRadius: '999px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)'
                    }} />
                </Box>
            </Box>

            {/* Active Contacts */}
            <Box>
                <Typography component="h4" sx={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', m: '0 0 16px 0' }}>
                    ACTIVE CONTACTS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {activeContacts.map((contact, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box component="span" sx={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    backgroundColor: contact.status === 'online' ? '#34D399' : 'var(--text-secondary)'
                                }} />
                                <Typography component="span" sx={{ color: '#D1D5DB', fontSize: '14px' }}>{contact.name}</Typography>
                            </Box>
                            <IconButton sx={{ color: 'var(--text-secondary)', p: 0.5 }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default InsightsSidebar;
