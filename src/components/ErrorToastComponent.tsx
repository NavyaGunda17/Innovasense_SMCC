// components/ErrorComponent.js
import React, { useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ErrorContext } from '../context/ErrorToastContext'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';

const ErrorToastComponent = () => {
  const { showErrorToast,clearError,errorMessage } = useContext(ErrorContext);

  return (
    <Snackbar
      open={!!errorMessage}
      autoHideDuration={6000}
      onClose={clearError}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={clearError}  variant="filled"
          icon={<DoNotDisturbIcon fontSize="medium" sx={{ color: '#A23B3E', marginRight: 1 }} />}

      sx={{
    backgroundColor: '#ECC8C4',      // custom background
    color: '#A23B3E',                 // border
    fontWeight: 500,
    borderRadius: 2,
    width:"100%",
    padding:"10px 15px",
    border:"1px solid #A23B3E"
  }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default ErrorToastComponent;


