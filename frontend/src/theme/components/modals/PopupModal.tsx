// src/components/modals/PopupModal.tsx
import React from 'react';
import { BaseModal } from './BaseModal';
import { ActionButton } from '../ActionButton';
import type { ModalActions } from '../../../types/modal';

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: ModalActions;
  size?: 'small' | 'medium' | 'large';
}

// src/components/modals/PopupModal.tsx
export const PopupModal: React.FC<PopupModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'large', // Varsayılan değer burada
  ...props // Diğer tüm props'ları yakala
}) => {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      size={size} // size prop'unu doğrudan aktar
      {...props} // Diğer tüm props'ları BaseModal'a aktar
      actions={
        <>
          {actions?.cancel && (
            <ActionButton
              variant="secondary"
              onClick={actions.cancel.action}
              disabled={actions.cancel.disabled}
            >
              {actions.cancel.label}
            </ActionButton>
          )}
          {actions?.confirm && (
            <ActionButton
              variant="primary"
              onClick={actions.confirm.action}
              loading={actions.confirm.loading}
              disabled={actions.confirm.disabled}
            >
              {actions.confirm.label}
            </ActionButton>
          )}
        </>
      }
    >
      {children}
    </BaseModal>
  );
};