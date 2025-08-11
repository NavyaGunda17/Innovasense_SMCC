import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

type CustomModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;
  onConfirm: (...args: any[]) => void;
  confirmText?: string;
  showCancel?:boolean;
  cancelText?: string;
  customcolor?:{};
  titleColor?:string
};

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  body,
  onConfirm,
  confirmText = 'Save',
  cancelText = 'Cancel',
  titleColor ="white",
  customcolor,
  showCancel=true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      hideBackdrop
      PaperProps={{ sx: { borderRadius: 3, 
        p: 0,
        background:"rgba(255, 255, 255, 0.05)",border:"1px solid rgba(255, 255, 255, 0.2)",backdropFilter:"blur(15px)",
        boxShadow:"0 8px 32px rgba(0, 0, 0, 0.2)",color:"white",...customcolor
       } }}
    >
      <DialogTitle>
        <Typography  fontWeight="bold" sx={{fontSize:"22px",color:titleColor}}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent >
        <Box mt={1}>{body}</Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
       {showCancel &&<Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>} 
        <Button onClick={onConfirm} variant="contained" color="primary" sx={{
          background:"linear-gradient(90deg, #6366f1e6 0%, #8b5cf6e6 100%)",
          // border:"1px solid #6B73FF",
          color:"#fff"
        }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;
