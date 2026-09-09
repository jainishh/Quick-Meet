import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AllRoutes from './pages/allRoutes/AllRoutes';
import { onMessageListener } from './firebase';
import { Snackbar, Alert, Button, Typography, Box, IconButton } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '', data: {} });

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body,
        data: payload.data || {}
      });
      setShowNotification(true);
      console.log('Foreground notification received:', payload);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleJoin = () => {
    if (notification.data?.meeting_code) {
      window.location.href = `/video-meet?roomID=${notification.data.meeting_code}`;
    } else if (notification.data?.meeting_link) {
      window.location.href = notification.data.meeting_link;
    }
    setShowNotification(false);
  };

  return (
    <div className="App">
      <Router>
        <AllRoutes />
      </Router>

      <Snackbar
        open={showNotification}
        autoHideDuration={8000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 2 }}
      >
        <Box sx={{
          background: 'var(--bg-card-alt)',
          border: '1px solid var(--border-main)',
          borderRadius: '16px',
          p: 2.5,
          boxShadow: '0 20px 50px var(--shadow-strong)',
          minWidth: '340px',
          position: 'relative'
        }}>
          <IconButton
            size="small"
            onClick={() => setShowNotification(false)}
            sx={{ position: 'absolute', top: 12, right: 12, color: 'var(--text-secondary)' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <Box sx={{
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '12px',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {notification.data?.type === 'direct_meet' ? (
                <VideocamIcon sx={{ color: 'var(--primary)', fontSize: '24px' }} />
              ) : (
                <EventIcon sx={{ color: 'var(--primary)', fontSize: '24px' }} />
              )}
            </Box>
            <Box sx={{ pr: 2 }}>
              <Typography sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', mb: 0.5 }}>
                {notification.title}
              </Typography>
              <Typography sx={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5 }}>
                {notification.body}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleJoin}
              sx={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '10px',
                py: 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-dark) 100%)',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)'
                }
              }}
            >
              {notification.data?.type === 'direct_meet' ? 'Join Now' : 'Accept'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowNotification(false)}
              sx={{
                borderColor: 'var(--border-main)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '10px',
                '&:hover': {
                  borderColor: 'var(--border-extra)',
                  bgcolor: 'var(--border-light)'
                }
              }}
            >
              Reject
            </Button>
          </Box>
        </Box>
      </Snackbar>
    </div>
  );
}

export default App;
