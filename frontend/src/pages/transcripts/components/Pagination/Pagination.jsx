import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function Pagination() {
    const pages = [1, 2, 3];
    const activePage = 1;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
                size="small"
                sx={{
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--overlay-medium)',
                    '&:hover': { bgcolor: 'var(--overlay-dark)', color: 'var(--text-primary)' }
                }}
            >
                <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1 }}>
                {pages.map((page) => (
                    <Box
                        key={page}
                        sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            transition: 'all 0.2s',
                            bgcolor: activePage === page ? 'var(--primary)' : 'transparent',
                            color: activePage === page ? 'var(--text-primary)' : 'var(--text-secondary)',
                            '&:hover': {
                                bgcolor: activePage === page ? 'var(--primary-hover)' : 'var(--border-light)',
                                color: activePage === page ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }
                        }}
                    >
                        {page}
                    </Box>
                ))}
            </Box>

            <IconButton
                size="small"
                sx={{
                    color: 'var(--text-secondary)',
                    bgcolor: 'var(--overlay-medium)',
                    '&:hover': { bgcolor: 'var(--overlay-dark)', color: 'var(--text-primary)' }
                }}
            >
                <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}
