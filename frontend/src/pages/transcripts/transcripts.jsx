import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function Transcripts() {
    return (
        <Box sx={{ 
            width: '100%', 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3
        }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 8 },
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: 600,
                    width: '100%'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, var(--primary-main) 0%, transparent 50%)',
                        opacity: 0.1,
                        animation: 'spin 15s linear infinite',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        },
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                        variant="h2" 
                        fontWeight={800} 
                        gutterBottom 
                        sx={{
                            color: '#ffffff',
                            textShadow: '0 0 30px rgba(255,255,255,0.4)',
                            letterSpacing: '-1px',
                            mb: 2,
                            fontSize: { xs: '2.5rem', md: '3.5rem' }
                        }}
                    >
                        Coming Soon..
                    </Typography>
                    
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'var(--text-secondary)', 
                            fontWeight: 400,
                            lineHeight: 1.6,
                            maxWidth: '80%',
                            mx: 'auto'
                        }}
                    >
                        We're currently brewing something amazing for the Transcripts page. 
                        Stay tuned for our upcoming release!
                    </Typography>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {[0, 1, 2].map((i) => (
                            <Box 
                                key={i}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: 'var(--primary-main)',
                                    animation: `bounce 1.4s infinite ease-in-out both`,
                                    animationDelay: `${i * 0.16}s`,
                                    '@keyframes bounce': {
                                        '0%, 80%, 100%': { transform: 'scale(0)' },
                                        '40%': { transform: 'scale(1)' }
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
