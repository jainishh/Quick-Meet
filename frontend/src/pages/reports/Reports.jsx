import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Reports() {
    return (
        <Box sx={{ color: 'var(--text-primary)' }}>
            <Typography variant="h4" gutterBottom>Reports</Typography>
            <Typography variant="body1">View analytics and usage reports.</Typography>
        </Box>
    );
}
