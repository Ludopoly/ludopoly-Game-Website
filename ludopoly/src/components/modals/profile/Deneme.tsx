import { PopupModal } from '../../../theme/components/modals';
import React from 'react'

export interface DenemeProps {
  open: boolean;
  onClose: () => void;
}

export const Deneme: React.FC<DenemeProps> = ({ open, onClose }) => {
  const actions = {
    cancel: {
      label: 'İptal',
      action: onClose,
      disabled: false,
    },
    confirm: {
      label: 'Kaydet',
      action: () => console.log('Kaydedildi'),
      loading: false,
      disabled: false,
    },
  };

  return (
    <PopupModal
      open={open}
      onClose={onClose}
      title="Örnek Başlık"
      actions={actions}
      size="large"
    >
      <div>Modal içeriği buraya</div>
    </PopupModal>
  );
};