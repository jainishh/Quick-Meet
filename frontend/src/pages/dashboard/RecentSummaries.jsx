import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const RecentSummaries = () => {
    const summaries = [
        { title: 'Product Backlog Grooming', time: '2h ago', badge: 'AI GENERATED' },
        { title: 'User Interview #12 - David K.', time: 'Yesterday', badge: 'AI GENERATED' },
    ];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" sx={{ fontSize: { xs: '16px', md: '18px' }, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
                    <AutoFixHighIcon sx={{ color: 'var(--primary-light)', fontSize: '20px' }} />
                    Recent Summaries
                </Typography>
                <Button sx={{ color: 'var(--text-secondary)', fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'none', p: 0, minWidth: 'auto', '&:hover': { background: 'none', textDecoration: 'underline' } }}>
                    Archive
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                {summaries.map((summary, idx) => (
                    <Box key={idx} sx={{
                        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)',
                        borderRadius: '14px', p: 2, display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Top Row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{
                                    backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary-light)',
                                    fontSize: '9px', fontWeight: 700, px: 1, py: 0.25, borderRadius: '4px', letterSpacing: '0.5px'
                                }}>
                                    {summary.badge}
                                </Box>
                                <Typography component="span" sx={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{summary.time}</Typography>
                            </Box>
                            <IconButton sx={{ color: 'var(--text-secondary)', p: 0.5 }}>
                                <ContentCopyIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                        </Box>

                        {/* Preview area */}
                        <Box sx={{
                            height: '80px', backgroundColor: 'var(--bg-darker)',
                            borderRadius: '10px', mb: 1.5,
                            border: '1px solid var(--border-light)', width: '100%'
                        }} />

                        {/* Title */}
                        <Typography sx={{ color: 'var(--text-primary)', fontSize: { xs: '13px', md: '14px' }, fontWeight: 600, m: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {summary.title}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default RecentSummaries;
