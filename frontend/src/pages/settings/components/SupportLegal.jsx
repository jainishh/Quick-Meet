import React, { useState } from 'react';
import { Box, Typography, Stack, Modal, IconButton, Paper, Divider, Button } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArticleIcon from '@mui/icons-material/Article';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function SupportLegal() {
    const [activeModal, setActiveModal] = useState(null);

    const handleOpen = (type) => setActiveModal(type);
    const handleClose = () => setActiveModal(null);

    const menuItems = [
        { id: 'help', label: 'Help & Support', icon: <HelpOutlineIcon />, color: 'var(--primary)' },
        { id: 'ticket', label: 'Raise a Ticket', icon: <ConfirmationNumberIcon />, color: '#10B981' },
        { id: 'terms', label: 'Terms & Conditions', icon: <ArticleIcon />, color: '#F59E0B' },
        { id: 'privacy', label: 'Privacy Policy', icon: <ShieldIcon />, color: 'var(--primary-light)' }
    ];

    const renderModalContent = () => {
        switch (activeModal) {
            case 'help':
                return (
                    <Box sx={{ p: 4 }}>
                        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: '18px', color: 'var(--primary)' }} /> Contact Channels
                        </Typography>
                        
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            <Box sx={{ 
                                bgcolor: 'var(--bg-darker)', 
                                p: 2, 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ bgcolor: 'var(--border-light)', p: 1, borderRadius: '8px' }}>
                                        <EmailIcon sx={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>Email Support</Typography>
                                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px' }}>support@quickmeet.com</Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small" sx={{ color: 'var(--text-secondary)' }}><OpenInNewIcon sx={{ fontSize: '18px' }} /></IconButton>
                            </Box>

                            <Box sx={{ 
                                bgcolor: 'var(--bg-darker)', 
                                p: 2, 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ bgcolor: 'var(--border-light)', p: 1, borderRadius: '8px' }}>
                                        <PhoneIcon sx={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>Priority Call</Typography>
                                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Available 9 AM - 6 PM</Typography>
                                    </Box>
                                </Box>
                                <Button size="small" sx={{ color: 'var(--primary)', fontWeight: 700, fontSize: '12px' }}>CALL</Button>
                            </Box>
                        </Stack>

                        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', mb: 2 }}>
                            Frequently Asked Questions
                        </Typography>
                        <Stack spacing={0.5}>
                            {['How to start a meeting?', 'Sharing screen with others', 'Recording your meetings', 'Security & Encryption'].map((q, i) => (
                                <Box key={i} sx={{ 
                                    py: 1.5, 
                                    borderBottom: '1px solid var(--border-light)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                                }}>
                                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{q}</Typography>
                                    <OpenInNewIcon sx={{ fontSize: '16px', color: '#4B5563' }} />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                );
            case 'ticket':
                return (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <ConfirmationNumberIcon sx={{ fontSize: '64px', color: '#10B981', mb: 2, opacity: 0.5 }} />
                        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '20px', mb: 1 }}>Submit a Ticket</Typography>
                        <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px', mb: 4 }}>Our team usually responds within 2-4 hours.</Typography>
                        <Button fullWidth variant="contained" sx={{ 
                            bgcolor: '#10B981', 
                            '&:hover': { bgcolor: '#059669' },
                            fontWeight: 700,
                            borderRadius: '12px',
                            py: 1.5
                        }}>
                            CREATE NEW TICKET
                        </Button>
                    </Box>
                );
            case 'terms':
            case 'privacy':
                return (
                    <Box sx={{ p: 4 }}>
                        <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px', mb: 2 }}>
                            {activeModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                        </Typography>
                        <Box sx={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto', 
                            pr: 2,
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'var(--border-main)', borderRadius: '10px' }
                        }}>
                            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, mb: 2 }}>
                                {activeModal === 'terms' 
                                    ? "By using QuickMeet, you agree to comply with our terms of service. We provide a platform for video conferencing and communication."
                                    : "We value your privacy. QuickMeet collects minimal data required to provide a seamless meeting experience. We do not sell your personal information."
                                }
                            </Typography>
                            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ mt: 6 }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', mb: 4 }}>
                Support & Legal
            </Typography>

            <Paper sx={{ 
                bgcolor: 'var(--bg-card)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid var(--border-light)'
            }}>
                <Stack divider={<Divider sx={{ borderColor: 'var(--border-light)' }} />}>
                    {menuItems.map((item) => (
                        <Box
                            key={item.id}
                            onClick={() => handleOpen(item.id)}
                            sx={{
                                p: '20px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                                    '& .chevron': { transform: 'translateX(4px)', color: 'var(--text-primary)' }
                                }
                            }}
                        >
                            <Box sx={{ 
                                bgcolor: 'rgba(255, 255, 255, 0.03)', 
                                p: 1, 
                                borderRadius: '10px', 
                                display: 'flex', 
                                mr: 2.5,
                                color: item.color,
                                border: '1px solid var(--border-light)'
                            }}>
                                {React.cloneElement(item.icon, { sx: { fontSize: '20px' } })}
                            </Box>
                            <Typography sx={{ flex: 1, color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>
                                {item.label}
                            </Typography>
                            <ChevronRightIcon className="chevron" sx={{ color: '#4B5563', transition: 'all 0.2s' }} />
                        </Box>
                    ))}
                </Stack>
            </Paper>

            {/* Blurred Backdrop Modal */}
            <Modal
                open={activeModal !== null}
                onClose={handleClose}
                closeAfterTransition
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }}
            >
                <Paper sx={{
                    width: '100%',
                    maxWidth: '480px',
                    minHeight: '520px',
                    bgcolor: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-main)',
                    boxShadow: '0 24px 48px var(--shadow-strong)',
                    overflow: 'hidden',
                    position: 'relative',
                    mx: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Modal Header */}
                    <Box sx={{ 
                        p: '24px 32px 16px 32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-light)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                bgcolor: 'rgba(255,255,255,0.03)', 
                                p: 1, 
                                borderRadius: '10px', 
                                display: 'flex', 
                                color: menuItems.find(m => m.id === activeModal)?.color || 'var(--text-primary)'
                            }}>
                                {activeModal && menuItems.find(m => m.id === activeModal)?.icon}
                            </Box>
                            <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '18px' }}>
                                {menuItems.find(m => m.id === activeModal)?.label}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleClose} sx={{ color: '#4B5563', '&:hover': { color: 'var(--text-primary)' } }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Modal Body */}
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {renderModalContent()}
                    </Box>
                </Paper>
            </Modal>
        </Box>
    );
}
