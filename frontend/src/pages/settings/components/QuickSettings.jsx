import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useSettings } from '../../../context/SettingsContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

export default function QuickSettings() {
    const { fontSize, setFontSize, appearance, setAppearance } = useSettings();

    const fontSizeOptions = ['Small', 'Medium', 'Large'];
    const appearanceOptions = [
        { label: 'Light', value: 'Light', icon: <LightModeIcon sx={{ fontSize: '16px' }} /> },
        { label: 'Dark', value: 'Dark', icon: <DarkModeIcon sx={{ fontSize: '16px' }} /> },
        { label: 'System', value: 'System', icon: <SettingsBrightnessIcon sx={{ fontSize: '16px' }} /> }
    ];

    return (
        <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', mb: 4 }}>
                Quick Settings
            </Typography>

            <Stack spacing={3}>
                {/* Font Size Setting */}
                <Box sx={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', mb: 0.5, textTransform: 'uppercase' }}>
                            Font Size
                        </Typography>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Customise your font size as per readability
                        </Typography>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        bgcolor: 'var(--shadow-light)', 
                        p: 0.5, 
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)'
                    }}>
                        {fontSizeOptions.map((size) => (
                            <Button
                                key={size}
                                onClick={() => setFontSize(size)}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    color: fontSize === size ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    bgcolor: fontSize === size ? 'var(--primary)' : 'transparent',
                                    boxShadow: fontSize === size ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                    '&:hover': {
                                        bgcolor: fontSize === size ? 'var(--primary-hover)' : 'var(--border-light)',
                                        color: 'var(--text-primary)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {size}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Appearance Setting */}
                <Box sx={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', mb: 0.5, textTransform: 'uppercase' }}>
                            Appearance
                        </Typography>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Choose your theme to look the best for your eyes
                        </Typography>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        bgcolor: 'var(--shadow-light)', 
                        p: 0.5, 
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)'
                    }}>
                        {appearanceOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                onClick={() => setAppearance(opt.value)}
                                startIcon={opt.icon}
                                sx={{
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    color: appearance === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    bgcolor: appearance === opt.value ? 'var(--primary)' : 'transparent',
                                    boxShadow: appearance === opt.value ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                    '&:hover': {
                                        bgcolor: appearance === opt.value ? 'var(--primary-hover)' : 'var(--border-light)',
                                        color: 'var(--text-primary)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    gap: 1
                                }}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}
