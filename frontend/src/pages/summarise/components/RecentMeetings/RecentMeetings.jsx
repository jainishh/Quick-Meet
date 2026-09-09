import React from 'react';
import { Box, Typography, Card, CardContent, IconButton, Avatar, AvatarGroup, Chip } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';

export default function RecentMeetings() {
    const meetings = [
        {
            id: 1,
            category: 'ENGINEERING',
            catColor: '#3B82F6',
            title: 'Sprint Retrospective - Wave 2',
            date: 'Oct 23, 2023 • 32 mins',
            desc: 'Discussed the velocity improvements in the last sprint. The team noted that the new documentation workflow saved ~4 hours per developer.',
            starred: false
        },
        {
            id: 2,
            category: 'DESIGN',
            catColor: '#10B981',
            title: 'Design System Audit',
            date: 'Oct 21, 2023 • 58 mins',
            desc: 'Reviewed the typography and color accessibility across the dashboard. Decided to transition to the new Inter-based theme globally by next month.',
            starred: true
        },
        {
            id: 3,
            category: 'MARKETING',
            catColor: 'var(--primary-light)',
            title: 'Monthly GTM Sync',
            date: 'Oct 20, 2023 • 41 mins',
            desc: "Marketing campaign for 'MeetNext 2.0' launch. Key dates set for social media teaser rollout and early bird webinar sessions.",
            starred: false
        }
    ];

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 2,
                gap: { xs: 1, sm: 2 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DashboardCustomizeOutlinedIcon sx={{ color: 'var(--text-secondary)', fontSize: 18 }} />
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Recent Meetings
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                        Showing 24 meetings
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { color: 'var(--primary)' } }}>
                        Sort by: Date <span style={{ marginLeft: 4 }}>↓</span>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3
            }}>
                {meetings.map((meet) => (
                    <Card key={meet.id} sx={{
                        bgcolor: 'var(--overlay-light)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'none',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px var(--shadow-light)',
                            borderColor: 'rgba(99, 102, 241, 0.3)'
                        }
                    }}>
                        <CardContent sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Chip
                                    label={meet.category}
                                    size="small"
                                    sx={{
                                        color: meet.catColor,
                                        bgcolor: `${meet.catColor}15`,
                                        fontWeight: 800,
                                        fontSize: '0.65rem',
                                        letterSpacing: 0.5,
                                        borderRadius: '4px',
                                        height: '22px'
                                    }}
                                />
                                <IconButton size="small" sx={{ color: meet.starred ? '#FCD34D' : 'var(--text-secondary)' }}>
                                    {meet.starred ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                            </Box>

                            <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.3, mb: 0.5 }}>
                                {meet.title}
                            </Typography>

                            <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 500, mb: 2, display: 'block' }}>
                                {meet.date}
                            </Typography>

                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.6, mb: 3, flexGrow: 1 }}>
                                {meet.desc}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', borderColor: 'var(--bg-card-alt)', bgcolor: 'var(--text-secondary)' } }}>
                                    <Avatar src="" />
                                    <Avatar src="" />
                                </AvatarGroup>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small" sx={{ bgcolor: 'var(--border-light)', color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--border-main)' } }}>
                                        <ArticleOutlinedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ bgcolor: 'var(--border-light)', color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--border-main)' } }}>
                                        <PlayCircleOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}
