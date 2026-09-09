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
    Fade,
    Backdrop
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ActionConfirmModal = ({ open, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", severity = "info" }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    borderRadius: '20px',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 25px 50px -12px var(--shadow-strong)',
                    maxWidth: '400px',
                    width: '100%',
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', pb: 0 }}>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)', bgcolor: 'var(--border-light)' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
                <Box sx={{ 
                    display: 'inline-flex', 
                    p: 2, 
                    borderRadius: '16px', 
                    bgcolor: severity === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    color: severity === 'error' ? '#EF4444' : 'var(--primary)',
                    mb: 2
                }}>
                    <WarningAmberIcon fontSize="large" />
                </Box>
                <Typography variant="h6" fontWeight="700" color="var(--text-primary)" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', px: 2, lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 4, gap: 2 }}>
                <Button
                    fullWidth
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: 'var(--border-main)',
                        color: 'var(--text-secondary)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        '&:hover': {
                            borderColor: 'var(--border-strong)',
                            bgcolor: 'var(--border-light)'
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    fullWidth
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    variant="contained"
                    sx={{
                        background: severity === 'error' ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.2,
                        boxShadow: severity === 'error' ? '0 4px 14px 0 rgba(239, 68, 68, 0.3)' : '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                            background: severity === 'error' ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                            boxShadow: severity === 'error' ? '0 6px 20px rgba(239, 68, 68, 0.5)' : '0 6px 20px rgba(99, 102, 241, 0.5)',
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActionConfirmModal;
