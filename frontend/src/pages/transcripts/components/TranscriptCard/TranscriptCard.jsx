import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

export default function TranscriptCard({ title, badge, badgeColor, date, duration, participants, snippet }) {
    return (
        <Box
            sx={{
                bgcolor: 'var(--overlay-light)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                p: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    bgcolor: 'var(--overlay-medium)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px var(--shadow-medium)',
                }
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'flex-start' }, 
                mb: 2,
                gap: 2
            }}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                            {title}
                        </Typography>
                        <Chip
                            label={badge}
                            size="small"
                            sx={{
                                bgcolor: `${badgeColor}20`,
                                color: badgeColor,
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                borderRadius: '6px',
                                border: `1px solid ${badgeColor}40`
                            }}
                        />
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        gap: { xs: 1, sm: 3 }, 
                        color: 'var(--text-secondary)' 
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                            <Typography variant="caption">{date}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                            <Typography variant="caption">{duration}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <PeopleOutlinedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                            <Typography variant="caption">{participants} Participants</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    width: { xs: '100%', md: 'auto' }, 
                    justifyContent: { xs: 'flex-end', md: 'flex-start' } 
                }}>
                    <IconButton
                        sx={{
                            bgcolor: 'var(--overlay-medium)',
                            color: 'var(--text-secondary)',
                            p: { xs: 0.8, md: 1 },
                            '&:hover': { color: 'var(--primary)', bgcolor: 'rgba(99, 102, 241, 0.1)' }
                        }}
                    >
                        <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        sx={{
                            bgcolor: 'var(--overlay-medium)',
                            color: 'var(--text-secondary)',
                            p: { xs: 0.8, md: 1 },
                            '&:hover': { color: 'var(--primary)', bgcolor: 'rgba(99, 102, 241, 0.1)' }
                        }}
                    >
                        <ShareOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Box
                sx={{
                    bgcolor: 'var(--overlay-light)',
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    fontStyle: 'italic',
                    color: 'var(--text-light)',
                    fontSize: '0.925rem',
                    lineHeight: 1.6
                }}
            >
                {snippet}
            </Box>
        </Box>
    );
}
