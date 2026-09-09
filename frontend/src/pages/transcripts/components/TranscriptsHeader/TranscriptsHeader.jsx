import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

export default function TranscriptsHeader() {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'flex-start' },
            gap: { xs: 3, md: 0 }
        }}>
            <Box>
                <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                    Meeting Transcripts
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    Review and analyze your previous 24 conversations.
                </Typography>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3, 
                alignItems: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', md: 'auto' }
            }}>
                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Paper
                        sx={{
                            bgcolor: 'var(--overlay-light)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '16px',
                            p: { xs: '10px 16px', md: '12px 20px' },
                            minWidth: { xs: '100px', md: '120px' },
                            flex: { xs: 1, sm: 'none' }
                        }}
                    >
                        <Typography sx={{ color: 'var(--primary)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', mb: 0.5 }}>
                            TOTAL HOURS
                        </Typography>
                        <Typography sx={{ color: 'var(--text-primary)', fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 800 }}>
                            42.5h
                        </Typography>
                    </Paper>

                    <Paper
                        sx={{
                            bgcolor: 'var(--overlay-light)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '16px',
                            p: { xs: '10px 16px', md: '12px 20px' },
                            minWidth: { xs: '100px', md: '120px' },
                            flex: { xs: 1, sm: 'none' }
                        }}
                    >
                        <Typography sx={{ color: 'var(--primary)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', mb: 0.5 }}>
                            KEYWORDS IDENTIFIED
                        </Typography>
                        <Typography sx={{ color: 'var(--text-primary)', fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 800 }}>
                            1.2k
                        </Typography>
                    </Paper>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<FileUploadOutlinedIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        color: 'var(--text-primary)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                            background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        }
                    }}
                >
                    Import Audio
                </Button>
            </Box>
        </Box>
    );
}
