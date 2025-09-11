import { BaseModal } from './BaseModal';
import type { BaseModalProps } from './BaseModal';

const modalPresets = {
  small: {
    maxWidth: 'xs' as const, // 'as const' ile literal type sabitlemesi
    fullWidth: true,
    PaperProps: { sx: { width: '400px' } }
  },
  medium: {
    maxWidth: 'sm' as const,
    fullWidth: true
  },
  large: {
    maxWidth: 'md' as const,
    fullWidth: true
  }
};

export type ModalPreset = keyof typeof modalPresets;

export const createModal = (preset: ModalPreset) => {
  function ModalComponent(props: BaseModalProps) {
    return <BaseModal {...modalPresets[preset]} {...props} />;
  }
  return ModalComponent;
};

export const SmallModal = createModal('small');
export const MediumModal = createModal('medium');
export const LargeModal = createModal('large');