-- =============================================================================
-- SEED DATA FOR DOMERA PLATFORM
-- Sample data for development and testing
-- Created: August 2025
-- =============================================================================

-- =============================================================================
-- ORGANIZATIONS (Developers/Constructors)
-- =============================================================================

INSERT INTO organizations (id, name, slug, email, phone, address, tax_id, status, description) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Kopel Sánchez Desarrollos',
  'kopel-sanchez',
  'contacto@kopelsanchez.com.uy',
  '+598 2123 4567',
  'Av. 18 de Julio 1234, Montevideo',
  '210123456789',
  'active',
  'Desarrolladora inmobiliaria especializada en proyectos de alta calidad en Montevideo'
),
(
  '550e8400-e29b-41d4-a716-446655440002', 
  'Constructora del Este',
  'constructora-del-este',
  'info@constructoradeleste.com.uy',
  '+598 2234 5678',
  'Rambla Armenia 2456, Carrasco',
  '210123456790',
  'active',
  'Constructora con más de 20 años de experiencia en la zona este de Montevideo'
);

-- =============================================================================
-- USERS (Sample users for testing)
-- =============================================================================

INSERT INTO users (id, email, first_name, last_name, phone, document_type, document_number, address, city, country) VALUES
-- Admin user
(
  '550e8400-e29b-41d4-a716-446655440011',
  'admin@domera.com',
  'Admin',
  'Domera',
  '+598 99123456',
  'cedula',
  '12345678',
  'World Trade Center, Montevideo',
  'Montevideo',
  'Uruguay'
),
-- Organization owner (Kopel Sánchez)
(
  '550e8400-e29b-41d4-a716-446655440012',
  'owner@kopelsanchez.com.uy',
  'Carlos',
  'Kopel',
  '+598 99234567',
  'cedula',
  '23456789',
  'Av. 18 de Julio 1234, Montevideo',
  'Montevideo', 
  'Uruguay'
),
-- Sales manager
(
  '550e8400-e29b-41d4-a716-446655440013',
  'ventas@kopelsanchez.com.uy',
  'María',
  'González',
  '+598 99345678',
  'cedula',
  '34567890',
  'Av. 18 de Julio 1234, Montevideo',
  'Montevideo',
  'Uruguay'
),
-- Finance manager
(
  '550e8400-e29b-41d4-a716-446655440014',
  'finanzas@kopelsanchez.com.uy',
  'Roberto',
  'Fernández',
  '+598 99456789',
  'cedula',
  '45678901',
  'Av. 18 de Julio 1234, Montevideo',
  'Montevideo',
  'Uruguay'
),
-- Professional (Escribanía)
(
  '550e8400-e29b-41d4-a716-446655440015',
  'escribania@legal.com.uy',
  'Ana',
  'Rodríguez',
  '+598 99567890',
  'cedula',
  '56789012',
  'Av. 8 de Octubre 2567, Montevideo',
  'Montevideo',
  'Uruguay'
),
-- Regular user/buyer
(
  '550e8400-e29b-41d4-a716-446655440016',
  'prueba@test.com',
  'Juan',
  'Pérez',
  '+598 99678901',
  'cedula',
  '67890123',
  'Bvar. Artigas 1234, Montevideo',
  'Montevideo',
  'Uruguay'
),
-- Another regular user
(
  '550e8400-e29b-41d4-a716-446655440017',
  'maria.silva@email.com',
  'María',
  'Silva',
  '+598 99789012',
  'cedula',
  '78901234',
  'Av. Italia 3456, Montevideo',
  'Montevideo',
  'Uruguay'
);

-- =============================================================================
-- USER ROLES
-- =============================================================================

INSERT INTO user_roles (user_id, organization_id, role) VALUES
-- Admin role (no organization)
('550e8400-e29b-41d4-a716-446655440011', NULL, 'admin'),
-- Kopel Sánchez team
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'organization_owner'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'sales_manager'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'finance_manager'),
-- Professional
('550e8400-e29b-41d4-a716-446655440015', NULL, 'professional'),
-- Regular users
('550e8400-e29b-41d4-a716-446655440016', NULL, 'user'),
('550e8400-e29b-41d4-a716-446655440017', NULL, 'user');

-- =============================================================================
-- PROFESSIONALS
-- =============================================================================

INSERT INTO professionals (id, user_id, professional_type, company_name, registration_number, specializations, service_areas, is_verified, verified_by) VALUES
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440015',
  'escribania',
  'Escribanía Rodríguez & Asociados',
  'ESC-2024-001',
  '["compraventa_inmobiliaria", "sociedades", "sucesiones"]',
  '["Montevideo", "Canelones"]',
  true,
  '550e8400-e29b-41d4-a716-446655440011'
);

-- =============================================================================
-- PROJECTS
-- =============================================================================

INSERT INTO projects (
  id, 
  organization_id, 
  name, 
  slug, 
  description,
  short_description,
  address, 
  neighborhood, 
  city,
  status,
  start_date,
  estimated_completion,
  total_units,
  available_units,
  base_price,
  legal_regime,
  images,
  amenities,
  master_plan_files
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440001',
  'Winks America',
  'winks-america',
  'Se construye un nuevo desarrollo de Kopel Sánchez en Barra de Carrasco. Winks Américas. Ubicado en el sector de mayor crecimiento de la zona este de Montevideo.

Este proyecto se desarrolla en una edificación de 8 niveles con apartamentos monoambientes y de 1, 2 y 3 dormitorios con amplias terrazas y vistas panorámicas. Y un amplio local comercial en planta baja.',
  'Nuevo desarrollo en Barra de Carrasco con apartamentos de 1, 2 y 3 dormitorios',
  'Av. de las Américas & Melchora Cuenca',
  'Carrasco',
  'Montevideo',
  'pre_sale',
  '2025-03-01',
  '2027-01-31',
  34,
  28,
  228000.00,
  'Ley de Vivienda Promovida N°18.795',
  '["/pro-hero.png", "/pro-big.png"]',
  '[
    {"icon": "🏢", "text": "34 unidades disponibles"},
    {"icon": "🚗", "text": "23 garages disponibles"},
    {"icon": "🔥", "text": "4 barbacoas y gimnasio"},
    {"icon": "🏊", "text": "Piscina climatizada"}
  ]',
  '[
    "1a Plano Planta Nivel 1 al 3.pdf",
    "1b Plano Planta Nivel 4.pdf", 
    "1c Plano Planta Nivel 5.pdf",
    "1d Plano Planta Nivel 6 al 8.pdf"
  ]'
);

-- =============================================================================
-- UNITS
-- =============================================================================

INSERT INTO units (
  id,
  project_id,
  unit_number,
  floor,
  unit_type,
  status,
  bedrooms,
  bathrooms,
  total_area,
  built_area,
  orientation,
  facing,
  price,
  description,
  images
) VALUES
-- Apartments
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440031',
  '604',
  6,
  'apartment',
  'available',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-1-66596a.png"]'
),
(
  '550e8400-e29b-41d4-a716-446655440042',
  '550e8400-e29b-41d4-a716-446655440031',
  '608',
  6,
  'apartment',
  'available',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Contra-Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-2-5e5a37.png"]'
),
(
  '550e8400-e29b-41d4-a716-446655440043',
  '550e8400-e29b-41d4-a716-446655440031',
  '702',
  7,
  'apartment',
  'available',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-3-2eff01.png"]'
),
(
  '550e8400-e29b-41d4-a716-446655440044',
  '550e8400-e29b-41d4-a716-446655440031',
  '708',
  7,
  'apartment',
  'reserved',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-4.png"]'
),
(
  '550e8400-e29b-41d4-a716-446655440045',
  '550e8400-e29b-41d4-a716-446655440031',
  '812',
  8,
  'apartment',
  'sold',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-5-124e52.png"]'
),
(
  '550e8400-e29b-41d4-a716-446655440046',
  '550e8400-e29b-41d4-a716-446655440031',
  '808',
  8,
  'apartment',
  'sold',
  2,
  2,
  86.00,
  86.00,
  'Norte',
  'Contra-Frente',
  190000.00,
  '2 dormitorios, 2 baños',
  '["/unit-image-6-48ba9f.png"]'
),
-- Commercial space
(
  '550e8400-e29b-41d4-a716-446655440047',
  '550e8400-e29b-41d4-a716-446655440031',
  'LOCAL-01',
  0,
  'commercial_space',
  'available',
  0,
  2,
  286.00,
  286.00,
  'Norte',
  'Frente',
  350000.00,
  'Local comercial en planta baja',
  '["/unit-image-7.png"]'
),
-- Garages
(
  '550e8400-e29b-41d4-a716-446655440048',
  '550e8400-e29b-41d4-a716-446655440031',
  'COCHERA-02',
  -1,
  'garage',
  'available',
  0,
  0,
  10.00,
  10.00,
  'Simple',
  'Interior',
  20000.00,
  'Cochera en subsuelo',
  '["/unit-image-8.png"]'
),
-- Storage
(
  '550e8400-e29b-41d4-a716-446655440049',
  '550e8400-e29b-41d4-a716-446655440031',
  'BODEGA-08',
  0,
  'storage',
  'available',
  0,
  0,
  13.50,
  13.50,
  'Simple',
  'Interior',
  15000.00,
  'Bodega en planta baja',
  '["/unit-image-9-91f5c8.png"]'
);

-- =============================================================================
-- DOCUMENT TEMPLATES
-- =============================================================================

INSERT INTO document_templates (
  id,
  organization_id,
  document_type,
  name,
  description,
  template_content,
  created_by
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440051',
  '550e8400-e29b-41d4-a716-446655440001',
  'boleto_reserva',
  'Boleto de Reserva Standard',
  'Template estándar para boleto de reserva de unidades',
  '<h1>BOLETO DE RESERVA</h1>
<p>Entre {{BUYER_NAME}}, documento {{BUYER_DOCUMENT}}, en adelante "EL COMPRADOR", y {{ORGANIZATION_NAME}}, en adelante "LA DESARROLLADORA"...</p>
<p>Unidad: {{UNIT_NUMBER}}</p>
<p>Proyecto: {{PROJECT_NAME}}</p>
<p>Precio: {{UNIT_PRICE}} {{CURRENCY}}</p>',
  '550e8400-e29b-41d4-a716-446655440012'
),
(
  '550e8400-e29b-41d4-a716-446655440052',
  NULL, -- Global template
  'compromiso_compraventa',
  'Compromiso de Compra-Venta Standard',
  'Template global para compromiso de compra-venta',
  '<h1>COMPROMISO DE COMPRA-VENTA</h1>
<p>Este compromiso se celebra entre {{BUYER_NAME}} y {{ORGANIZATION_NAME}}...</p>',
  '550e8400-e29b-41d4-a716-446655440011'
);

-- =============================================================================
-- SAMPLE OPERATION (for testing purposes)
-- =============================================================================

INSERT INTO operations (
  id,
  user_id,
  organization_id,
  status,
  total_amount,
  platform_fee
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440061',
  '550e8400-e29b-41d4-a716-446655440016', -- Juan Pérez
  '550e8400-e29b-41d4-a716-446655440001', -- Kopel Sánchez
  'documents_pending',
  210000.00, -- Unit 604 + Garage
  3000.00
);

-- Link operation to units
INSERT INTO operation_units (operation_id, unit_id, price_at_reservation) VALUES
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', 190000.00), -- Unit 604
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440048', 20000.00);   -- Garage 02

-- Operation steps
INSERT INTO operation_steps (
  operation_id,
  step_name,
  step_order,
  status,
  assigned_to
) VALUES
('550e8400-e29b-41d4-a716-446655440061', 'document_generation', 1, 'completed', NULL),
('550e8400-e29b-41d4-a716-446655440061', 'document_upload', 2, 'in_progress', '550e8400-e29b-41d4-a716-446655440016'),
('550e8400-e29b-41d4-a716-446655440061', 'professional_validation', 3, 'pending', '550e8400-e29b-41d4-a716-446655440015'),
('550e8400-e29b-41d4-a716-446655440061', 'payment_confirmation', 4, 'pending', NULL),
('550e8400-e29b-41d4-a716-446655440061', 'operation_completion', 5, 'pending', NULL);

-- Assign professional to operation
INSERT INTO professional_assignments (
  operation_id,
  professional_id,
  assigned_by,
  status
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440061',
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440013', -- Sales manager
  'assigned'
);

-- =============================================================================
-- SAMPLE NOTIFICATIONS
-- =============================================================================

INSERT INTO notifications (
  user_id,
  operation_id,
  type,
  title,
  message
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440016',
  '550e8400-e29b-41d4-a716-446655440061',
  'operation_update',
  'Operación iniciada',
  'Tu operación para la unidad 604 en Winks America ha sido iniciada. El próximo paso es subir los documentos requeridos.'
),
(
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440061',
  'professional_assignment',
  'Nueva operación asignada',
  'Se te ha asignado una nueva operación para validar documentos del proyecto Winks America.'
);

-- =============================================================================
-- UPDATE UNIT AVAILABILITY COUNTS
-- =============================================================================

-- Update available units count in projects table
UPDATE projects SET 
  available_units = (
    SELECT COUNT(*) 
    FROM units 
    WHERE units.project_id = projects.id 
    AND units.status = 'available'
  ),
  updated_at = NOW();

-- Update unit status for reserved units to in_process for active operation
UPDATE units SET 
  status = 'in_process' 
WHERE id IN (
  SELECT ou.unit_id 
  FROM operation_units ou 
  JOIN operations o ON ou.operation_id = o.id 
  WHERE o.status NOT IN ('completed', 'cancelled')
);