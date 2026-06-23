-- Migración para añadir confirmación de entrega bidireccional

ALTER TABLE public.participante_compra 
ADD COLUMN confirmacion_entrega_admin boolean DEFAULT false,
ADD COLUMN confirmacion_entrega_cliente boolean DEFAULT false,
ADD COLUMN fecha_confirmacion_admin timestamp with time zone,
ADD COLUMN fecha_confirmacion_cliente timestamp with time zone;

-- Comentarios descriptivos
COMMENT ON COLUMN public.participante_compra.confirmacion_entrega_admin IS 'Indica si el administrador confirmó la entrega del producto a este participante.';
COMMENT ON COLUMN public.participante_compra.confirmacion_entrega_cliente IS 'Indica si el cliente confirmó la recepción del producto.';
