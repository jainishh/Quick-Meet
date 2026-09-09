import React from 'react';
import { Box, InputBase, Chip, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function FilterBar() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Search Input */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'var(--overlay-light)',
                    borderRadius: '16px',
                    px: { xs: 2, md: 3 },
                    py: { xs: 1.2, md: 1.5 },
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.3s ease',
                    '&:focus-within': {
                        bgcolor: 'var(--overlay-strong)',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
                    }
                }}
            >
                <SearchIcon sx={{ color: 'var(--primary)', mr: { xs: 1.5, md: 2 }, fontSize: { xs: 20, md: 22 } }} />
                <InputBase
                    placeholder="Search through meeting content..."
                    sx={{ color: 'var(--text-secondary)', width: '100%', fontSize: { xs: '0.9rem', md: '1rem' } }}
                />
            </Box>

            {/* Filter Chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                    icon={<CalendarTodayOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                    label="All Dates"
                    onDelete={() => { }}
                    deleteIcon={<KeyboardArrowDownIcon />}
                    sx={chipStyle}
                />
                <Chip
                    icon={<AccessTimeOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                    label="Duration"
                    onDelete={() => { }}
                    deleteIcon={<KeyboardArrowDownIcon />}
                    sx={chipStyle}
                />
                <Chip
                    icon={<PeopleOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                    label="Participants"
                    onDelete={() => { }}
                    deleteIcon={<KeyboardArrowDownIcon />}
                    sx={chipStyle}
                />
                <Chip
                    icon={<TagOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                    label="Keywords"
                    onDelete={() => { }}
                    deleteIcon={<KeyboardArrowDownIcon />}
                    sx={chipStyle}
                />

                <Box sx={{ height: { xs: '0px', sm: '24px' }, width: { xs: '0px', sm: '1px' }, bgcolor: 'var(--border-main)', mx: 1 }} />

                <Button
                    sx={{
                        color: 'var(--primary)',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
                        ml: { xs: 'auto', sm: 0 }
                    }}
                >
                    Clear Filters
                </Button>
            </Box>
        </Box>
    );
}

const chipStyle = {
    bgcolor: 'var(--overlay-medium)',
    color: 'var(--text-secondary)',
    borderRadius: '12px',
    height: '40px',
    border: '1px solid var(--border-light)',
    px: 1,
    '& .MuiChip-icon': { color: 'var(--primary)' },
    '& .MuiChip-deleteIcon': { color: 'var(--text-secondary)', fontSize: '18px' },
    '&:hover': { bgcolor: 'var(--overlay-dark)', borderColor: 'var(--border-main)' }
};
