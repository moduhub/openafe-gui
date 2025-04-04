import React from 'react';
import { Typography, Box } from '@mui/material';

import { TabDataset, TabDatasetAdavanced } from '../../shared/components'

export const DataProcessing = () => {
  return (
    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="row" justifyContent="space-between" alignItems="center"
    >
      <TabDatasetAdavanced/>
    </Box>
  );
};