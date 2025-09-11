// src/types/modal.ts
export type ModalSize = 'small' | 'medium' | 'large';

export interface ModalAction {
  label: string;
  action: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface ModalActions {
  confirm?: ModalAction;
  cancel?: ModalAction;
}