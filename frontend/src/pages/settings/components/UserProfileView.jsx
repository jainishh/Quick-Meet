import React, { useState, useRef } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import axiosInstance from '../../../utils/axiosInstance';

const server = import.meta.env.VITE_API_URL;

export default function UserProfileView({ onBack }) {
    const name = localStorage.getItem('name') || 'User';
    const email = localStorage.getItem('email') || '';
    const token = localStorage.getItem('token') || '';

    const [profilePic, setProfilePic] = useState(localStorage.getItem('profile_picture') || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setUploading(true);
            try {
                await axiosInstance.put(`/api/v1/users/update_profile_picture`, {
                    profile_picture: base64
                });
                setProfilePic(base64);
                localStorage.setItem('profile_picture', base64);
                window.dispatchEvent(new Event('profileUpdate'));
            } catch (err) {
                console.error('Failed to upload profile picture:', err);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePicture = async (e) => {
        e.stopPropagation();
        setUploading(true);
        try {
            await axiosInstance.delete(`/api/v1/users/remove_profile_picture`);
            setProfilePic(null);
            localStorage.removeItem('profile_picture');
            window.dispatchEvent(new Event('profileUpdate'));
        } catch (err) {
            console.error('Failed to remove profile picture:', err);
        } finally {
            setUploading(false);
        }
    };

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <Box sx={{ color: 'var(--text-primary)' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, gap: 2 }}>
                <IconButton onClick={onBack} sx={{ color: 'var(--text-primary)', p: 0 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>User Profile</Typography>
            </Box>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Profile Avatar & Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                    {/* Avatar */}
                    <Box
                        onClick={handleAvatarClick}
                        sx={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            bgcolor: 'var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255, 255, 255, 0.08)',
                            position: 'relative',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 0.85 },
                            opacity: uploading ? 0.6 : 1
                        }}
                    >
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Typography sx={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>
                                {initials}
                            </Typography>
                        )}
                    </Box>

                    {/* Remove button - shown only when image exists */}
                    {profilePic && (
                        <Box
                            onClick={handleRemovePicture}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bgcolor: 'rgba(30, 30, 40, 0.85)',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid var(--border-main)',
                                cursor: 'pointer',
                                zIndex: 2,
                                transition: 'background 0.2s',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.5)' }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: '14px', color: 'var(--text-primary)' }} />
                        </Box>
                    )}

                    {/* Camera button always visible */}
                    <Box
                        onClick={handleAvatarClick}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'var(--primary)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid var(--bg-root)',
                            cursor: 'pointer',
                            zIndex: 2,
                            '&:hover': { bgcolor: 'var(--primary-hover)' }
                        }}
                    >
                        <PhotoCameraIcon sx={{ fontSize: '16px', color: 'var(--text-primary)' }} />
                    </Box>
                </Box>

                <Typography sx={{ fontSize: '24px', fontWeight: 700, mb: 0.5 }}>{name}</Typography>
                <Typography sx={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{email}</Typography>
            </Box>

            {/* Info Cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px', mx: 'auto' }}>
                <Paper sx={{
                    bgcolor: 'var(--bg-darker)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        borderColor: 'var(--primary)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
                    }
                }}>
                    <Box sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <PersonIcon sx={{ color: 'var(--primary)' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', mb: 0.5, letterSpacing: '0.5px' }}>FULL NAME</Typography>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{
                    bgcolor: 'var(--bg-darker)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        borderColor: 'var(--primary)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
                    }
                }}>
                    <Box sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <EmailIcon sx={{ color: 'var(--primary)' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', mb: 0.5, letterSpacing: '0.5px' }}>EMAIL ADDRESS</Typography>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{email}</Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
