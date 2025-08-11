// components/ErrorComponent.js
import React, { useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { SuccessContext } from '../context/SuccessToastContext'
import DoneIcon from '@mui/icons-material/Done';
const SuccessToastComponent = () => {
  const { showSuccessToast, cleatSuccess, successMessage } = useContext(SuccessContext);

  return (
    <Snackbar
      open={!!successMessage}
      autoHideDuration={6000}
      onClose={cleatSuccess}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={cleatSuccess}  variant="filled" 
                icon={<DoneIcon fontSize="medium" sx={{ color: '#607557', marginRight: 1 }} />}

      sx={{
    backgroundColor: '#DEF3D6',      // custom background
    color: '#607557',                 // border
    fontWeight: 500,
    borderRadius: 2,
    width:"100%",
     padding:"10px 15px",
    border:"1px solid #607557"
  }}>
        {successMessage}
      </Alert>
    </Snackbar>
  );
};

export default SuccessToastComponent;


