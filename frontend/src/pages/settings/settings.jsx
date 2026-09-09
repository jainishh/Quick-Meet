import React, { useState } from 'react';
import UserProfileView from './components/UserProfileView';
import QuickSettings from './components/QuickSettings';
import SupportLegal from './components/SupportLegal';
import EditIcon from '@mui/icons-material/Edit';
import { Avatar, Box, Typography } from '@mui/material';

export default function Settings() {
    const [showFullProfile, setShowFullProfile] = useState(false);
    
    const name = localStorage.getItem('name') || 'User';
    const email = localStorage.getItem('email') || '';
    const profilePic = localStorage.getItem('profile_picture') || null;

    if (showFullProfile) {
        return <UserProfileView onBack={() => setShowFullProfile(false)} />;
    }

    return (
        <div style={{ color: 'var(--text-primary)', maxWidth: '900px', width: '100%', paddingBottom: '40px' }}>
            {/* Header */}
            <h1 style={{ 
                fontSize: window.innerWidth < 600 ? '28px' : '36px', 
                fontWeight: 800, 
                margin: '0 0 8px 0', 
                letterSpacing: '-0.5px' 
            }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 32px 0' }}>Manage your account, preferences, and meeting experience.</p>


            {/* Content blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* Compact Profile Header */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <Avatar 
                        src={profilePic || undefined}
                        sx={{ 
                            width: 64, 
                            height: 64, 
                            bgcolor: 'var(--primary-light)',
                            fontSize: '24px',
                            fontWeight: 700,
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        {!profilePic && name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', mb: 0.5 }}>
                            {name}
                        </Typography>
                        <Typography 
                            onClick={() => setShowFullProfile(true)}
                            sx={{ 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                color: 'var(--primary)', 
                                cursor: 'pointer',
                                letterSpacing: '0.5px',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            VIEW PROFILE
                        </Typography>
                    </Box>
                </div>

                {/* Quick Settings Section */}
                <QuickSettings />

                {/* Support & Legal Section */}
                <SupportLegal />

            </div>
        </div>
    );
}
