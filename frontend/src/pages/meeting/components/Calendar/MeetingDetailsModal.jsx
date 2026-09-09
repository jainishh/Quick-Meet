import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    Fade,
    Backdrop,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import ActionConfirmModal from './ActionConfirmModal';

const MeetingDetailsModal = ({ open, onClose, meeting, onEdit, onAccept, onReject }) => {
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const currentUserEmail = localStorage.getItem('email');

    if (!meeting) return null;

    // Find current user's status
    const myParticipant = Array.isArray(meeting.participants) 
        ? meeting.participants.find(p => p.username === currentUserEmail)
        : null;
    
    const isPending = myParticipant?.status === 'pending';
    const isConfirmed = myParticipant?.status === 'confirmed';

    const handleRejectClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmReject = () => {
        if (onReject) onReject(meeting.meetingCode);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            TransitionComponent={Fade}
            transitionDuration={400}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                }
            }}
            PaperProps={{
                sx: {
                    bgcolor: 'var(--bg-card)',
                    backgroundImage: 'none',
                    borderRadius: '24px',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 25px 50px -12px var(--shadow-strong)',
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight="700" color="var(--text-primary)">
                    Meeting Details
                </Typography>
                <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)', bgcolor: 'var(--border-light)' } }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                    {/* Title */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TitleIcon sx={{ color: 'var(--primary)', mt: 0.3 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>Title</Typography>
                            <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>{meeting.title}</Typography>
                        </Box>
                    </Box>

                    {/* Date & Time */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <EventIcon sx={{ color: 'var(--primary)', mt: 0.3 }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>Date & Time</Typography>
                            <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {meeting.date} • {meeting.startTime} - {meeting.endTime}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Agenda */}
                    {meeting.description && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <DescriptionIcon sx={{ color: 'var(--primary)', mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>Agenda</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
                                    {meeting.description}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Participants */}
                    {meeting.participants && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <GroupIcon sx={{ color: 'var(--primary)', mt: 0.3 }} />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 1 }}>Participants</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {Array.isArray(meeting.participants) ? meeting.participants.map((p, i) => (
                                        <Chip 
                                            key={i} 
                                            label={typeof p === 'object' ? `${p.name} (${p.status})` : p.trim()} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                                color: 'var(--primary-light)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                fontWeight: 500,
                                                fontSize: '0.75rem'
                                            }} 
                                        />
                                    )) : meeting.participants.split(',').map((p, i) => (
                                        <Chip 
                                            key={i} 
                                            label={p.trim()} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: 'rgba(99, 102, 241, 0.1)', 
                                                color: 'var(--primary-light)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                fontWeight: 500,
                                                fontSize: '0.75rem'
                                            }} 
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {meeting.isHost ? (
                    <Button
                        fullWidth
                        onClick={() => {
                            if (onEdit) onEdit(meeting);
                            onClose();
                        }}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.2,
                            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                            }
                        }}
                    >
                        Edit Meeting
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                        {isPending && (
                            <Button
                                fullWidth
                                onClick={() => {
                                    if (onAccept) onAccept(meeting.meetingCode);
                                    onClose();
                                }}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.2,
                                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                                    }
                                }}
                            >
                                Accept Meeting
                            </Button>
                        )}
                        <Button
                            fullWidth
                            onClick={handleRejectClick}
                            variant="outlined"
                            sx={{
                                borderColor: '#EF4444',
                                color: '#EF4444',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.2,
                                '&:hover': {
                                    borderColor: '#DC2626',
                                    bgcolor: 'rgba(239, 68, 68, 0.05)'
                                }
                            }}
                        >
                            Reject Meeting
                        </Button>
                    </Box>
                )}
            </DialogActions>

            <ActionConfirmModal
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmReject}
                title="Reject Meeting Invitation"
                message={`Are you sure you want to reject the invitation for "${meeting.title}"? This meeting will be removed from your calendar.`}
                confirmText="Reject Meeting"
                severity="error"
            />
        </Dialog>
    );
};

export default MeetingDetailsModal;
