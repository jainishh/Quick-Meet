import React from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function SummariseHeader() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 1.5 }}>
            {/* Search Bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'var(--overlay-light)',
                    borderRadius: '12px',
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 1, md: 1.5 },
                    flexGrow: 1,
                    maxWidth: { xs: 'calc(100% - 100px)', md: '500px' },
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.3s ease',
                    '&:focus-within': {
                        bgcolor: 'var(--overlay-strong)',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                    }
                }}
            >
                <SearchIcon sx={{ color: 'var(--text-secondary)', mr: 1, fontSize: 18 }} />
                <InputBase
                    placeholder="Search..."
                    sx={{ color: 'var(--text-secondary)', width: '100%', fontSize: '0.85rem' }}
                />
            </Box>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                <IconButton
                    sx={{
                        bgcolor: 'var(--overlay-medium)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-light)',
                        p: { xs: 0.8, md: 1 },
                        '&:hover': {
                            bgcolor: 'var(--overlay-dark)',
                            color: 'var(--text-secondary)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <NotificationsNoneIcon fontSize="small" />
                </IconButton>

                <IconButton
                    sx={{
                        bgcolor: 'var(--overlay-medium)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-light)',
                        p: { xs: 0.8, md: 1 },
                        '&:hover': {
                            bgcolor: 'var(--overlay-dark)',
                            color: 'var(--text-secondary)',
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}
