// src/components/modals/BaseModal.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';
import type { ModalSize } from '../../../types/modal';


export interface BaseModalProps extends Omit<DialogProps, 'title'> {
  onClose: () => void;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  size?: ModalSize;
}

// src/components/modals/BaseModal.tsx
const sizeMap = {
  small: { width: 400, maxWidth: '95vw' },
  medium: { width: 600, maxWidth: '95vw' },
  large: { width: 900, maxWidth: '95vw' }
};

export const BaseModal: React.FC<BaseModalProps> = ({
  size = 'medium',
  title,
  children,
  actions,
  onClose,
  ...props
}) => {
  return (
    <Dialog
      onClose={onClose}
      fullWidth={false} // Önemli!
      maxWidth={false} // Önemli!
      PaperProps={{
        sx: {
          ...sizeMap[size], // Boyut stilini burada uygula
          background: 'transparent', // Arka planı şeffaf yap)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          mx: 'auto' // Ortalamak için
        }
      }}
      {...props}
    >
      {title && <DialogTitle sx={{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 300,
        letterSpacing: 0.5,
        color: 'white',
        pb: 1
      }}>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};