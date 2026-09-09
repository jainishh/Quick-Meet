import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function Pagination() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 4, pb: 4 }}>
            <IconButton size="small" sx={{ bgcolor: 'var(--overlay-medium)', color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--overlay-dark)', color: 'var(--text-secondary)' } }}>
                <ChevronLeftIcon fontSize="small" />
            </IconButton>

            <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'var(--primary)',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem'
            }}>
                1
            </Box>

            <Typography sx={{
                width: 32,
                height: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '50%',
                '&:hover': { bgcolor: 'var(--border-light)', color: 'var(--text-secondary)' }
            }}>
                2
            </Typography>

            <Typography sx={{
                width: 32,
                height: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '50%',
                '&:hover': { bgcolor: 'var(--border-light)', color: 'var(--text-secondary)' }
            }}>
                3
            </Typography>

            <IconButton size="small" sx={{ bgcolor: 'var(--overlay-medium)', color: 'var(--text-secondary)', '&:hover': { bgcolor: 'var(--overlay-dark)', color: 'var(--text-secondary)' } }}>
                <ChevronRightIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}
