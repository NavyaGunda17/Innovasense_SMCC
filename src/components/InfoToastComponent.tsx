// components/ErrorComponent.js
import React, { useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { InfoContext } from '../context/InfoToastContext'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';

const InfoToastComponent = () => {
  const { showInfoToast, clearInfo, infoMessage } = useContext(InfoContext);

  return (
    <Snackbar
      open={!!infoMessage}
      autoHideDuration={6000}
      onClose={clearInfo}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={clearInfo}  variant="filled" 
        icon={<InfoOutlineIcon fontSize="medium" sx={{ color: '#4C7B99', marginRight: 1 }} />}
      sx={{
    backgroundColor: '#CCE8F5',      // custom background
    color: '#4C7B99',                 // border
    fontWeight: 500,
    borderRadius: 2,
    width:"100%",
     padding:"10px 15px",
    border:"1px solid #4C7B99"
  }}>
        {infoMessage}
      </Alert>
    </Snackbar>
  );
};

export default InfoToastComponent;


