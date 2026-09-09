import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    Fade,
    Backdrop,
    Autocomplete,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import axiosInstance from '../../../../utils/axiosInstance';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ScheduleMeetingModal = ({ open, onClose, onSchedule, onDelete, initialData }) => {
    const [meetingData, setMeetingData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        participants: []
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [friends, setFriends] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchFriends = async () => {
            const token = localStorage.getItem('token');
            if (open && token) {
                try {
                    const response = await axiosInstance.get(`/api/v1/friends/list`);
                    const data = response.data.friends || [];
                    setFriends(data.map(f => ({ name: f.name, email: f.username })));
                } catch (error) {
                    console.error('Error fetching friends:', error);
                }
            }
        };
        fetchFriends();
    }, [open]);

    useEffect(() => {
        if (open) {
            setShowDeleteConfirm(false);
            if (initialData) {
                setMeetingData({
                    id: initialData.id,
                    title: initialData.title || '',
                    description: initialData.description || '',
                    date: initialData.date || '',
                    startTime: initialData.startTime || '',
                    endTime: initialData.endTime || '',
                    participants: initialData.participants
                        ? (Array.isArray(initialData.participants)
                            ? initialData.participants.map(p => {
                                if (typeof p === 'object') return p.username;
                                return p.includes('(') ? p.split('(')[1].replace(')', '').trim() : p;
                            })
                            : initialData.participants.split(',').map(p => {
                                const trimmed = p.trim();
                                return trimmed.includes('(') ? trimmed.split('(')[1].replace(')', '').trim() : trimmed;
                            }).filter(Boolean))
                        : []
                });
            } else {
                setMeetingData({
                    title: '',
                    description: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    participants: []
                });
            }
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMeetingData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!meetingData.title.trim()) newErrors.title = 'Meeting title is required';
        if (!meetingData.date) newErrors.date = 'Date is required';
        if (!meetingData.startTime) newErrors.startTime = 'Start time is required';
        if (!meetingData.endTime) newErrors.endTime = 'End time is required';
        if (!meetingData.description.trim()) newErrors.description = 'Agenda / Description is required';
        if (meetingData.participants.length === 0) newErrors.participants = 'At least one participant is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const payload = {
            ...meetingData,
            participants: Array.isArray(meetingData.participants)
                ? meetingData.participants
                : meetingData.participants.split(',').map(p => p.trim()).filter(Boolean)
        };
        onSchedule(payload);
        onClose();
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete && meetingData.id) {
            onDelete(meetingData.id);
            setShowDeleteConfirm(false);
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                fullScreen={isMobile}
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
                        borderRadius: isMobile ? 0 : '24px',
                        border: isMobile ? 'none' : '1px solid var(--border-light)',
                        boxShadow: '0 25px 50px -12px var(--shadow-strong)',
                        p: isMobile ? 1 : 2
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h5" fontWeight="700" color="var(--text-primary)">
                        {initialData ? 'Edit Meeting' : 'Schedule New Meeting'}
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)', bgcolor: 'var(--border-light)' } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            fullWidth
                            required
                            label="Meeting Title"
                            name="title"
                            value={meetingData.title}
                            onChange={handleChange}
                            variant="outlined"
                            placeholder="e.g. Project Sync"
                            error={!!errors.title}
                            helperText={errors.title}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TitleIcon sx={{ color: errors.title ? '#EF4444' : 'var(--primary)' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={textFieldStyle}
                        />

                        <TextField
                            fullWidth
                            required
                            label="Date"
                            name="date"
                            type="date"
                            value={meetingData.date}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.date}
                            helperText={errors.date}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EventIcon sx={{ color: errors.date ? '#EF4444' : 'var(--primary)' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={textFieldStyle}
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                            <TextField
                                fullWidth
                                required
                                label="Start Time"
                                name="startTime"
                                type="time"
                                value={meetingData.startTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.startTime}
                                helperText={errors.startTime}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeIcon sx={{ color: errors.startTime ? '#EF4444' : 'var(--primary)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />
                            <TextField
                                fullWidth
                                required
                                label="End Time"
                                name="endTime"
                                type="time"
                                value={meetingData.endTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.endTime}
                                helperText={errors.endTime}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeIcon sx={{ color: errors.endTime ? '#EF4444' : 'var(--primary)' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={textFieldStyle}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            required
                            label="Agenda / Description"
                            name="description"
                            value={meetingData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="What is this meeting about?"
                            error={!!errors.description}
                            helperText={errors.description}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                        <DescriptionIcon sx={{ color: errors.description ? '#EF4444' : 'var(--primary)' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={textFieldStyle}
                        />

                        <Autocomplete
                            disablePortal
                            multiple
                            freeSolo
                            options={friends}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                if (option.inputValue) return option.inputValue;
                                return option.name || option.email;
                            }}
                            filterOptions={(options, params) => {
                                const { inputValue } = params;
                                const searchStr = inputValue.toLowerCase();
                                const filtered = options.filter(option => {
                                    const matchName = option.name && option.name.toLowerCase().includes(searchStr);
                                    const matchEmail = option.email && option.email.toLowerCase().includes(searchStr);
                                    return matchName || matchEmail;
                                });
                                const isExisting = options.some(o => inputValue.toLowerCase() === o.email.toLowerCase());
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({ inputValue, name: `Add "${inputValue}"`, email: inputValue });
                                }
                                return filtered;
                            }}
                            value={meetingData.participants.map(email => {
                                const friend = friends.find(f => f.email === email);
                                return friend ? friend : email;
                            })}
                            onChange={(event, newValue) => {
                                const emails = newValue.map(item => {
                                    if (typeof item === 'string') return item;
                                    if (item.inputValue) return item.inputValue;
                                    return item.email;
                                });
                                setMeetingData(prev => ({ ...prev, participants: emails }));
                                if (errors.participants) setErrors(prev => ({ ...prev, participants: '' }));
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{
                                    display: 'flex !important',
                                    justifyContent: 'space-between !important',
                                    alignItems: 'center !important',
                                    px: '16px !important',
                                    py: '10px !important',
                                    bgcolor: 'transparent !important'
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{option.name}</Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{option.email}</Typography>
                                    </Box>
                                    <AddIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </Box>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => {
                                    const tagLabel = typeof option === 'string' ? option : option.email;
                                    return (
                                        <Chip
                                            key={index}
                                            variant="outlined"
                                            label={tagLabel}
                                            {...getTagProps({ index })}
                                            sx={{ borderColor: 'var(--primary-light)', color: 'var(--text-secondary)', bgcolor: 'rgba(139, 92, 246, 0.1)' }}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    variant="outlined"
                                    label="Participants (Emails)"
                                    placeholder={meetingData.participants.length === 0 ? 'Search friends by name or email' : ''}
                                    error={!!errors.participants}
                                    helperText={errors.participants}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start" sx={{ pl: 1 }}>
                                                    <GroupIcon sx={{ color: errors.participants ? '#EF4444' : 'var(--primary)' }} />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={textFieldStyle}
                                />
                            )}
                            PaperProps={{
                                style: {
                                    background: 'var(--bg-card-alt)',
                                    backgroundColor: 'var(--bg-card-alt)',
                                    backgroundImage: 'none',
                                    border: '1px solid var(--border-main)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px var(--shadow-strong)',
                                    marginTop: '4px',
                                    color: 'var(--text-secondary)',
                                }
                            }}
                            componentsProps={{
                                paper: {
                                    style: {
                                        background: 'var(--bg-card-alt)',
                                        backgroundColor: 'var(--bg-card-alt)',
                                        color: 'var(--text-secondary)',
                                    }
                                }
                            }}
                            ListboxProps={{
                                style: {
                                    background: 'var(--bg-card-alt)',
                                    backgroundColor: 'var(--bg-card-alt)',
                                    padding: '8px',
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ 
                    px: isMobile ? 2 : 3, 
                    pb: isMobile ? 3 : 3, 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column-reverse' : 'row',
                    justifyContent: 'space-between',
                    gap: isMobile ? 1.5 : 0
                }}>
                    <Box>
                        {initialData && (
                            <Button
                                onClick={handleDelete}
                                startIcon={<DeleteOutlineIcon />}
                                sx={{
                                    color: '#EF4444',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                }}
                            >
                                Delete Meeting
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, width: isMobile ? '100%' : 'auto' }}>
                        <Button
                            onClick={onClose}
                            sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 600, flex: isMobile ? 1 : 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            fullWidth={isMobile}
                            sx={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1.2,
                                flex: isMobile ? 2 : 'none',
                                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                                }
                            }}
                        >
                            {initialData ? 'Update Meeting' : 'Schedule Meeting'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-main)',
                        p: 1,
                        maxWidth: '400px'
                    }
                }}
            >
                <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'var(--text-secondary)' }}>
                        Are you sure you want to delete this meeting? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        sx={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            bgcolor: '#EF4444',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#DC2626' }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        color: 'var(--text-secondary)',
        borderRadius: '12px',
        bgcolor: 'var(--bg-dark)',
        '& fieldset': { borderColor: 'var(--border-main)' },
        '&:hover fieldset': { borderColor: 'var(--border-strong)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
        '& input[type="date"], & input[type="time"]': {
            colorScheme: 'var(--color-scheme)', // Dynamic Native pickers
            cursor: 'pointer',
        },
        '& input::-webkit-calendar-picker-indicator': {
            filter: 'invert(0.6) sepia(1) saturate(5) hue-rotate(175deg)', // Makes the native icon match our purple/indigo theme
            cursor: 'pointer',
            opacity: 0.8,
            '&:hover': {
                opacity: 1,
            }
        }
    },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary)' },
    '& .MuiOutlinedInput-input::placeholder': { color: 'var(--text-secondary)', opacity: 1 },
};

export default ScheduleMeetingModal;
