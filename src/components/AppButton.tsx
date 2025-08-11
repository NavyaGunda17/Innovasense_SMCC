import React from 'react';
import { Button, ButtonProps } from '@mui/material';

type VariantType = 'primary' | 'secondary';

interface AppButtonProps extends ButtonProps {
  variantType?: VariantType;
}

const AppButton: React.FC<AppButtonProps> = ({
  children,
  variantType = 'primary',
  sx,
  ...rest
}) => {
 const getStyles = () => {
  switch (variantType) {
    case 'primary':
      return {
        background: 'linear-gradient(90deg, #6366f1e6 0%, #8b5cf6e6 100%)',
        color: '#fff',
        '&:hover': {
          background: 'linear-gradient(240deg, #6366f1e6 0%, #8b5cf6e6 100%)',
        },
        '&.Mui-disabled': {
          background: '#ccc',
          color: '#888',
          cursor: 'not-allowed',
        },
      };
    case 'secondary':
      return {
        background: 'transparent',
        color: '#6B73FF',
        border: '2px solid #6B73FF',
        '&:hover': {
          background: '#f1f3ff',
        },
        '&.Mui-disabled': {
          color: '#aaa',
          borderColor: '#716d6d',
            background: '#716d6d',
          cursor: 'not-allowed',
        },
      };
    default:
      return {};
  }
};


  return (
    <Button
      variant="contained"
      sx={{
        py: 1,
        px: 2,
        fontWeight: 700,
        fontSize: 16,
        borderRadius: 2,
        letterSpacing: 1,
        textTransform: 'none',
        boxShadow: 2,
        ...getStyles(),
        ...sx, // Allow custom overrides
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default AppButton;
