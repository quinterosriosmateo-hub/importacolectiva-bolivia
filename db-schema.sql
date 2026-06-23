-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.usuario (
  id uuid NOT NULL,
  nombre character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  telefono character varying,
  rol character varying NOT NULL DEFAULT 'Cliente'::character varying,
  estado character varying NOT NULL DEFAULT 'Activo'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  reputacion integer DEFAULT 100,
  biografia text DEFAULT 'Miembro de Importacolectiva.'::text,
  ubicacion character varying DEFAULT 'Bolivia'::character varying,
  avatar_url character varying,
  CONSTRAINT usuario_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.suscripcion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  plan character varying NOT NULL DEFAULT 'Gratuito'::character varying,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  estado character varying NOT NULL DEFAULT 'Activo'::character varying,
  CONSTRAINT suscripcion_pkey PRIMARY KEY (id),
  CONSTRAINT suscripcion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);
CREATE TABLE public.proveedor (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  pais character varying NOT NULL,
  estado_verificacion character varying NOT NULL DEFAULT 'No verificado'::character varying,
  contacto character varying,
  email character varying,
  telefono character varying,
  website character varying,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proveedor_pkey PRIMARY KEY (id)
);
CREATE TABLE public.producto (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  proveedor_id bigint,
  nombre character varying NOT NULL,
  descripcion text,
  precio numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  estado character varying NOT NULL DEFAULT 'Activo'::character varying,
  image character varying,
  cbm numeric,
  peso_kg numeric,
  moq integer,
  CONSTRAINT producto_pkey PRIMARY KEY (id),
  CONSTRAINT producto_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id)
);
CREATE TABLE public.categoria (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT categoria_pkey PRIMARY KEY (id)
);
CREATE TABLE public.producto_categoria (
  producto_id bigint NOT NULL,
  categoria_id bigint NOT NULL,
  CONSTRAINT producto_categoria_pkey PRIMARY KEY (producto_id, categoria_id),
  CONSTRAINT producto_categoria_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id),
  CONSTRAINT producto_categoria_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id)
);
CREATE TABLE public.compra_grupal (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo character varying NOT NULL,
  estado character varying NOT NULL DEFAULT 'Abierta'::character varying,
  cupo_maximo integer NOT NULL,
  costo_total numeric NOT NULL,
  producto_id bigint,
  meta_minima integer DEFAULT 0,
  fecha_cierre timestamp with time zone,
  imagen_url text,
  participantes_count integer DEFAULT 0,
  tipo_capacidad character varying DEFAULT 'CBM'::character varying,
  proveedor_id bigint,
  descripcion text,
  precio_congelado numeric,
  created_by uuid,
  costo_logistico numeric DEFAULT 0,
  costo_aduana numeric DEFAULT 0,
  CONSTRAINT compra_grupal_pkey PRIMARY KEY (id),
  CONSTRAINT fk_compra_grupal_producto FOREIGN KEY (producto_id) REFERENCES public.producto(id),
  CONSTRAINT fk_compra_grupal_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id),
  CONSTRAINT compra_grupal_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuario(id)
);
CREATE TABLE public.participante_compra (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  compra_grupal_id bigint NOT NULL,
  monto numeric NOT NULL,
  estado_pago character varying NOT NULL DEFAULT 'Pendiente'::character varying,
  hito_actual integer DEFAULT 1,
  estado_aduanas character varying DEFAULT 'Pendiente'::character varying,
  pago_id bigint,
  es_premium boolean DEFAULT false,
  fecha_ingreso timestamp with time zone DEFAULT now(),
  monto_ajuste numeric DEFAULT 0,
  monto_final numeric,
  cantidad integer DEFAULT 1,
  CONSTRAINT participante_compra_pkey PRIMARY KEY (id),
  CONSTRAINT participante_compra_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT participante_compra_compra_grupal_id_fkey FOREIGN KEY (compra_grupal_id) REFERENCES public.compra_grupal(id),
  CONSTRAINT participante_compra_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.pago(id)
);
CREATE TABLE public.importacion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  compra_grupal_id bigint NOT NULL UNIQUE,
  estado character varying NOT NULL DEFAULT 'En proceso'::character varying,
  tracking character varying,
  costo_total numeric NOT NULL,
  documento_bl character varying,
  naviera character varying,
  fecha_eta date,
  CONSTRAINT importacion_pkey PRIMARY KEY (id),
  CONSTRAINT importacion_compra_grupal_id_fkey FOREIGN KEY (compra_grupal_id) REFERENCES public.compra_grupal(id)
);
CREATE TABLE public.pago (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  monto numeric NOT NULL,
  metodo character varying NOT NULL,
  estado character varying NOT NULL DEFAULT 'Pendiente'::character varying,
  fecha timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  compra_grupal_id bigint,
  estado_retencion character varying DEFAULT 'libre'::character varying,
  referencia_externa character varying,
  comprobante_url text,
  CONSTRAINT pago_pkey PRIMARY KEY (id),
  CONSTRAINT pago_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT pago_compra_grupal_id_fkey FOREIGN KEY (compra_grupal_id) REFERENCES public.compra_grupal(id)
);
CREATE TABLE public.pedido (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  estado character varying NOT NULL DEFAULT 'Pendiente'::character varying,
  total numeric NOT NULL,
  CONSTRAINT pedido_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);
CREATE TABLE public.detalle_pedido (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pedido_id bigint NOT NULL,
  producto_id bigint NOT NULL,
  cantidad integer NOT NULL,
  subtotal numeric NOT NULL,
  CONSTRAINT detalle_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedido(id),
  CONSTRAINT detalle_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id)
);
CREATE TABLE public.curso (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo character varying NOT NULL UNIQUE,
  descripcion text,
  imagen_url text,
  categoria text DEFAULT 'General'::text,
  nivel text DEFAULT 'Básico'::text,
  es_premium boolean DEFAULT false,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT curso_pkey PRIMARY KEY (id)
);
CREATE TABLE public.leccion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  curso_id bigint NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  video_url text,
  duracion_min integer DEFAULT 0,
  orden integer DEFAULT 0,
  tipo text DEFAULT 'video'::text,
  recurso_descargable_url text,
  CONSTRAINT leccion_pkey PRIMARY KEY (id),
  CONSTRAINT leccion_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.curso(id)
);
CREATE TABLE public.progreso_curso (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  curso_id bigint NOT NULL,
  progreso integer NOT NULL DEFAULT 0,
  leccion_id bigint,
  completada boolean DEFAULT false,
  fecha_completada timestamp with time zone,
  xp_ganado integer DEFAULT 0,
  CONSTRAINT progreso_curso_pkey PRIMARY KEY (id),
  CONSTRAINT progreso_curso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT progreso_curso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.curso(id),
  CONSTRAINT progreso_curso_leccion_id_fkey FOREIGN KEY (leccion_id) REFERENCES public.leccion(id)
);
CREATE TABLE public.asesoria (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  asesor_id uuid,
  fecha timestamp with time zone NOT NULL,
  estado character varying NOT NULL DEFAULT 'Programada'::character varying,
  CONSTRAINT asesoria_pkey PRIMARY KEY (id),
  CONSTRAINT asesoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT asesoria_asesor_id_fkey FOREIGN KEY (asesor_id) REFERENCES public.usuario(id)
);
CREATE TABLE public.review (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id uuid NOT NULL,
  producto_id bigint NOT NULL,
  puntuacion integer NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario text,
  CONSTRAINT review_pkey PRIMARY KEY (id),
  CONSTRAINT review_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT review_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id)
);
CREATE TABLE public.reventa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto_id bigint NOT NULL,
  precio numeric NOT NULL,
  motivo character varying,
  estado character varying NOT NULL DEFAULT 'Disponible'::character varying,
  CONSTRAINT reventa_pkey PRIMARY KEY (id),
  CONSTRAINT reventa_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id)
);
CREATE TABLE public.inventario (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto_id bigint NOT NULL,
  cantidad integer NOT NULL DEFAULT 0,
  ubicacion character varying,
  CONSTRAINT inventario_pkey PRIMARY KEY (id),
  CONSTRAINT inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id)
);
CREATE TABLE public.envio (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pedido_id bigint NOT NULL UNIQUE,
  tracking character varying,
  estado character varying NOT NULL DEFAULT 'En almacén'::character varying,
  CONSTRAINT envio_pkey PRIMARY KEY (id),
  CONSTRAINT envio_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedido(id)
);
CREATE TABLE public.publicidad (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo character varying NOT NULL,
  costo numeric NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  CONSTRAINT publicidad_pkey PRIMARY KEY (id)
);
CREATE TABLE public.favorito_curso (
  id integer NOT NULL DEFAULT nextval('favorito_curso_id_seq'::regclass),
  usuario_id uuid NOT NULL,
  curso_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorito_curso_pkey PRIMARY KEY (id),
  CONSTRAINT favorito_curso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.curso(id)
);
CREATE TABLE public.comentario_curso (
  id integer NOT NULL DEFAULT nextval('comentario_curso_id_seq'::regclass),
  usuario_id uuid NOT NULL,
  leccion_id bigint,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comentario_curso_pkey PRIMARY KEY (id),
  CONSTRAINT comentario_curso_leccion_id_fkey FOREIGN KEY (leccion_id) REFERENCES public.leccion(id)
);
CREATE TABLE public.mensaje_grupal (
  id bigint NOT NULL DEFAULT nextval('mensaje_grupal_id_seq'::regclass),
  compra_grupal_id bigint NOT NULL,
  usuario_id uuid NOT NULL,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mensaje_grupal_pkey PRIMARY KEY (id),
  CONSTRAINT mensaje_grupal_compra_grupal_id_fkey FOREIGN KEY (compra_grupal_id) REFERENCES public.compra_grupal(id),
  CONSTRAINT mensaje_grupal_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id)
);
CREATE TABLE public.abandono_participante (
  id bigint NOT NULL DEFAULT nextval('abandono_participante_id_seq'::regclass),
  participante_compra_id bigint,
  usuario_id uuid,
  compra_grupal_id bigint,
  producto_id bigint,
  fecha_limite_reclamo timestamp with time zone NOT NULL,
  fecha_abandono timestamp with time zone,
  estado character varying DEFAULT 'pendiente'::character varying,
  reventa_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT abandono_participante_pkey PRIMARY KEY (id),
  CONSTRAINT abandono_participante_participante_compra_id_fkey FOREIGN KEY (participante_compra_id) REFERENCES public.participante_compra(id),
  CONSTRAINT abandono_participante_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id),
  CONSTRAINT abandono_participante_compra_grupal_id_fkey FOREIGN KEY (compra_grupal_id) REFERENCES public.compra_grupal(id),
  CONSTRAINT abandono_participante_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id),
  CONSTRAINT abandono_participante_reventa_id_fkey FOREIGN KEY (reventa_id) REFERENCES public.reventa(id)
);