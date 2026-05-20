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
  const [editRol, setEditRol] = useState('');

  // Sincronizar formulario local cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (user && open) {
      setEditNombre(user.displayName || '');
      setEditTelefono(user.phone || '');
      setEditBiografia(user.biografia || 'Miembro de Importacolectiva.');
      setEditUbicacion(user.ubicacion || 'Bolivia');
      setEditRol(user.role || 'Cliente');
    }
  }, [user, open]);

  const handleSave = () => {
    onSave({
      nombre: editNombre,
      telefono: editTelefono,
      biografia: editBiografia,
      ubicacion: editUbicacion,
      rol: editRol
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
        
        <FormControl fullWidth>
          <InputLabel id="edit-rol-label">Rol de Usuario (Pruebas)</InputLabel>
          <Select
            labelId="edit-rol-label"
            id="edit-rol"
            value={editRol}
            label="Rol de Usuario (Pruebas)"
            onChange={(e) => setEditRol(e.target.value)}
          >
            <MenuItem value="Cliente">Cliente Estándar</MenuItem>
            <MenuItem value="Premium">Miembro Premium</MenuItem>
            <MenuItem value="Administrador">Administrador</MenuItem>
            <MenuItem value="Asesor">Asesor Técnico</MenuItem>
            <MenuItem value="Proveedor/Agente">Proveedor / Agente</MenuItem>
          </Select>
        </FormControl>

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
