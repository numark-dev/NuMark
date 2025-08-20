import { useState } from 'react';

export const useModal = () => {
  const [modals, setModals] = useState({});

  const openModal = (modalId, data = {}) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { isOpen: true, ...data }
    }));
  };

  const closeModal = (modalId) => {
    setModals(prev => ({
      ...prev,
      [modalId]: { ...prev[modalId], isOpen: false }
    }));
  };

  const isModalOpen = (modalId) => {
    return modals[modalId]?.isOpen || false;
  };

  const getModalData = (modalId) => {
    return modals[modalId] || {};
  };

  return {
    openModal,
    closeModal,
    isModalOpen,
    getModalData
  };
};
