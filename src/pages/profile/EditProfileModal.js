import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Stack, 
  CircularProgress, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { StandardModal, PrimaryButton, SecondaryButton } from '@/components/ui';

export default function EditProfileModal({ open, onClose, user, onSave, updateLoading }) {
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editBiografia, setEditBiografia] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');

  // Sincronizar formulario local cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (user && open) {
      setEditNombre(user.displayName || '');
      setEditTelefono(user.phone || '');
      setEditBiografia(user.biografia || 'Miembro de Importacolectiva.');
      setEditUbicacion(user.ubicacion || 'Bolivia');
    }
  }, [user, open]);

  const handleSave = () => {
    onSave({
      nombre: editNombre,
      telefono: editTelefono,
      biografia: editBiografia,
      ubicacion: editUbicacion
    });
  };

  return (
    <StandardModal 
      open={open} 
      onClose={onClose}
      title="Editar Información Personal"
      actions={
        <>
          <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={updateLoading}>
            {updateLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambios'}
          </PrimaryButton>
        </>
      }
    >
      <Stack spacing={3} sx={{ py: 1 }}>
        <TextField 
          fullWidth 
          label="Nombre Completo" 
          variant="outlined" 
          value={editNombre} 
          onChange={(e) => setEditNombre(e.target.value)}
        />
        <TextField 
          fullWidth 
          label="Teléfono / WhatsApp" 
          variant="outlined" 
          value={editTelefono} 
          onChange={(e) => setEditTelefono(e.target.value)}
        />
        <TextField 
          fullWidth 
          label="Ubicación" 
          variant="outlined" 
          value={editUbicacion} 
          onChange={(e) => setEditUbicacion(e.target.value)}
        />

        <TextField 
          fullWidth 
          label="Biografía" 
          variant="outlined" 
          multiline 
          rows={3} 
          value={editBiografia} 
          onChange={(e) => setEditBiografia(e.target.value)}
        />
      </Stack>
    </StandardModal>
  );
}
