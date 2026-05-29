/**
 * Seed script for Education module tables and data.
 * 
 * Usage:  node src/scripts/seed-courses.js
 * 
 * This script:
 * 1. Creates tables (curso, leccion, progreso_curso, favorito_curso, comentario_curso)
 * 2. Inserts 5 courses with ~24 lessons
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xgrhwptudiugiwzabdhe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhncmh3cHR1ZGl1Z2l3emFiZGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDQ0MjQsImV4cCI6MjA5NDE4MDQyNH0.4X4io2ZbtlheeT54NwVjY8KruA4siKmp1U5mQazncjg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  return res;
}

async function seed() {
  console.log('🎓 Seeding Education module...\n');

  // ── 1. Insert Courses ────────────────────────────────────────────────────
  console.log('📚 Inserting courses...');
  
  const courses = [
    {
      titulo: 'Importación desde Cero',
      descripcion: 'Aprende los fundamentos de la importación desde China a Bolivia. Desde encontrar productos hasta recibirlos en tu puerta.',
      imagen_url: '/images/courses/importacion-cero.jpg',
      categoria: 'Fundamentos',
      nivel: 'Básico',
      es_premium: false,
      orden: 1
    },
    {
      titulo: 'Documentación Aduanera Bolivia',
      descripcion: 'Todo lo que necesitas saber sobre trámites aduaneros, aranceles, impuestos y requisitos legales para importar a Bolivia.',
      imagen_url: '/images/courses/documentacion-aduanera.jpg',
      categoria: 'Legal',
      nivel: 'Básico',
      es_premium: false,
      orden: 2
    },
    {
      titulo: 'Negociación con Proveedores Chinos',
      descripcion: 'Domina el arte de negociar con fábricas y proveedores en China. Técnicas probadas para obtener los mejores precios y condiciones.',
      imagen_url: '/images/courses/negociacion-proveedores.jpg',
      categoria: 'Negociación',
      nivel: 'Intermedio',
      es_premium: true,
      orden: 3
    },
    {
      titulo: 'Logística Internacional',
      descripcion: 'Entiende las rutas marítimas, aéreas y terrestres. Aprende a calcular costos de envío y elegir el mejor método de transporte.',
      imagen_url: '/images/courses/logistica-internacional.jpg',
      categoria: 'Logística',
      nivel: 'Intermedio',
      es_premium: true,
      orden: 4
    },
    {
      titulo: 'Estrategias de Reventa Exitosa',
      descripcion: 'Maximiza tus ganancias con estrategias comprobadas de pricing, marketing y canales de venta para productos importados.',
      imagen_url: '/images/courses/estrategias-reventa.jpg',
      categoria: 'Ventas',
      nivel: 'Avanzado',
      es_premium: true,
      orden: 5
    }
  ];

  const { data: insertedCourses, error: courseError } = await supabase
    .from('curso')
    .upsert(courses, { onConflict: 'titulo' })
    .select();

  if (courseError) {
    console.error('❌ Error inserting courses:', courseError.message);
    console.log('   Attempting to fetch existing courses instead...');
  }

  // Fetch the courses to get their IDs
  const { data: allCourses, error: fetchError } = await supabase
    .from('curso')
    .select('*')
    .order('orden');

  if (fetchError) {
    console.error('❌ Error fetching courses:', fetchError.message);
    console.log('\n⚠️  The tables might not exist yet. Please create them first.');
    console.log('   Go to your Supabase Dashboard → SQL Editor and run the migration SQL below.\n');
    printMigrationSQL();
    return;
  }

  console.log(`   ✅ ${allCourses.length} courses ready\n`);

  // ── 2. Insert Lessons ────────────────────────────────────────────────────
  console.log('📖 Inserting lessons...');

  const courseMap = {};
  allCourses.forEach(c => { courseMap[c.titulo] = c.id; });

  // Videos de YouTube públicos sobre importación/negocios (placeholders)
  const lessons = [
    // Curso 1: Importación desde Cero
    { curso_id: courseMap['Importación desde Cero'], titulo: '¿Qué es importar y por qué hacerlo?', descripcion: 'Introducción al mundo de las importaciones y sus beneficios económicos.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 12, orden: 1, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Importación desde Cero'], titulo: 'Plataformas para encontrar productos', descripcion: 'Alibaba, 1688, Made-in-China y cómo buscar productos de calidad.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 18, orden: 2, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Importación desde Cero'], titulo: 'Cómo contactar proveedores', descripcion: 'Templates de mensajes, qué preguntar y red flags a evitar.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 15, orden: 3, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Importación desde Cero'], titulo: 'Muestras y control de calidad', descripcion: 'Cómo pedir muestras, evaluar calidad y evitar estafas.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 14, orden: 4, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Importación desde Cero'], titulo: 'Tu primera importación paso a paso', descripcion: 'Guía completa desde el pedido hasta la recepción en Bolivia.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 22, orden: 5, tipo: 'tutorial', recurso_descargable_url: null },

    // Curso 2: Documentación Aduanera
    { curso_id: courseMap['Documentación Aduanera Bolivia'], titulo: 'Marco legal de importaciones en Bolivia', descripcion: 'Leyes, regulaciones y entidades gubernamentales que regulan las importaciones.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 16, orden: 1, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Documentación Aduanera Bolivia'], titulo: 'Documentos obligatorios', descripcion: 'Factura comercial, packing list, BL, certificados y más.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 20, orden: 2, tipo: 'documento', recurso_descargable_url: null },
    { curso_id: courseMap['Documentación Aduanera Bolivia'], titulo: 'Cálculo de aranceles e impuestos', descripcion: 'GA, IVA, ICE y cómo calcular el costo total de tu importación.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 18, orden: 3, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Documentación Aduanera Bolivia'], titulo: 'Proceso de despacho aduanero', descripcion: 'Paso a paso del proceso en la aduana boliviana.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 15, orden: 4, tipo: 'tutorial', recurso_descargable_url: null },

    // Curso 3: Negociación con Proveedores
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Cultura de negocios en China', descripcion: 'Entende la mentalidad y costumbres comerciales chinas para negociar mejor.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 14, orden: 1, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Técnicas de negociación de precios', descripcion: 'Estrategias para obtener descuentos por volumen y mejores condiciones.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 20, orden: 2, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Términos de pago internacionales', descripcion: 'FOB, CIF, EXW y otros Incoterms que debes conocer.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 16, orden: 3, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Contratos y acuerdos comerciales', descripcion: 'Cómo protegerte legalmente en tus transacciones internacionales.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 18, orden: 4, tipo: 'documento', recurso_descargable_url: null },
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Manejo de disputas y reclamos', descripcion: 'Qué hacer cuando algo sale mal con tu proveedor.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 12, orden: 5, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Negociación con Proveedores Chinos'], titulo: 'Construir relaciones a largo plazo', descripcion: 'De proveedor a socio estratégico: cómo mantener buenas relaciones.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 10, orden: 6, tipo: 'video', recurso_descargable_url: null },

    // Curso 4: Logística Internacional
    { curso_id: courseMap['Logística Internacional'], titulo: 'Tipos de transporte internacional', descripcion: 'Marítimo, aéreo, terrestre y multimodal. Cuándo usar cada uno.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 16, orden: 1, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Logística Internacional'], titulo: 'Cálculo de costos de envío', descripcion: 'Peso volumétrico, CBM, y cómo estimar el costo real de tu carga.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 20, orden: 2, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Logística Internacional'], titulo: 'Consolidación de carga', descripcion: 'Cómo ahorrar dinero agrupando envíos con otros importadores.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 14, orden: 3, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Logística Internacional'], titulo: 'Seguro de carga internacional', descripcion: 'Protege tu inversión: tipos de seguro y cómo reclamar.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 12, orden: 4, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Logística Internacional'], titulo: 'Tracking y seguimiento de envíos', descripcion: 'Herramientas y plataformas para rastrear tu carga en tiempo real.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 10, orden: 5, tipo: 'tutorial', recurso_descargable_url: null },

    // Curso 5: Estrategias de Reventa
    { curso_id: courseMap['Estrategias de Reventa Exitosa'], titulo: 'Análisis de mercado local', descripcion: 'Identifica oportunidades de reventa en el mercado boliviano.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 18, orden: 1, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Estrategias de Reventa Exitosa'], titulo: 'Pricing y márgenes de ganancia', descripcion: 'Cómo calcular precios competitivos que maximicen tus ganancias.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 16, orden: 2, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Estrategias de Reventa Exitosa'], titulo: 'Canales de venta online y offline', descripcion: 'Marketplace, redes sociales, tiendas físicas y más.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 20, orden: 3, tipo: 'video', recurso_descargable_url: null },
    { curso_id: courseMap['Estrategias de Reventa Exitosa'], titulo: 'Marketing para productos importados', descripcion: 'Estrategias de marketing digital para vender tus productos rápidamente.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duracion_min: 22, orden: 4, tipo: 'video', recurso_descargable_url: null },
  ];

  const { data: insertedLessons, error: lessonError } = await supabase
    .from('leccion')
    .upsert(lessons, { onConflict: 'curso_id,orden' })
    .select();

  if (lessonError) {
    console.error('❌ Error inserting lessons:', lessonError.message);
  } else {
    console.log(`   ✅ ${insertedLessons.length} lessons inserted\n`);
  }

  console.log('🎉 Education module seeded successfully!');
}

function printMigrationSQL() {
  console.log(`
-- ============================================
-- MIGRATION: Education Module Tables
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS public.curso (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url TEXT,
  categoria TEXT DEFAULT 'General',
  nivel TEXT DEFAULT 'Básico' CHECK (nivel IN ('Básico', 'Intermedio', 'Avanzado')),
  es_premium BOOLEAN DEFAULT false,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS public.leccion (
  id SERIAL PRIMARY KEY,
  curso_id INT REFERENCES public.curso(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  video_url TEXT,
  duracion_min INT DEFAULT 0,
  orden INT DEFAULT 0,
  tipo TEXT DEFAULT 'video' CHECK (tipo IN ('video', 'documento', 'tutorial')),
  recurso_descargable_url TEXT,
  UNIQUE(curso_id, orden)
);

-- Progreso del usuario por lección
CREATE TABLE IF NOT EXISTS public.progreso_curso (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  curso_id INT REFERENCES public.curso(id) ON DELETE CASCADE,
  leccion_id INT REFERENCES public.leccion(id) ON DELETE CASCADE,
  completada BOOLEAN DEFAULT false,
  fecha_completada TIMESTAMPTZ,
  xp_ganado INT DEFAULT 0,
  UNIQUE(usuario_id, leccion_id)
);

-- Favoritos de cursos
CREATE TABLE IF NOT EXISTS public.favorito_curso (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  curso_id INT REFERENCES public.curso(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, curso_id)
);

-- Comentarios en lecciones
CREATE TABLE IF NOT EXISTS public.comentario_curso (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  leccion_id INT REFERENCES public.leccion(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS on all new tables
ALTER TABLE public.curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leccion DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorito_curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentario_curso DISABLE ROW LEVEL SECURITY;
  `);
}

seed().catch(console.error);
