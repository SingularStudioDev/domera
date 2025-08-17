-- =============================================================================
-- ROW LEVEL SECURITY POLICIES FOR DOMERA PLATFORM
-- Comprehensive security policies for multi-tenant real estate platform
-- Created: August 2025
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Function to get current user's ID from auth.users
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.email = auth.email() 
    AND ur.role = 'admin' 
    AND ur.is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to get user's organization IDs
CREATE OR REPLACE FUNCTION auth.user_organizations() RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(ur.organization_id) 
  FROM user_roles ur
  JOIN users u ON ur.user_id = u.id
  WHERE u.email = auth.email()
  AND ur.is_active = true;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user has role in organization
CREATE OR REPLACE FUNCTION auth.has_role_in_org(org_id UUID, role_name user_role) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.email = auth.email()
    AND ur.organization_id = org_id
    AND ur.role = role_name
    AND ur.is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user can access organization data
CREATE OR REPLACE FUNCTION auth.can_access_org(org_id UUID) RETURNS BOOLEAN AS $$
  SELECT auth.is_admin() OR org_id = ANY(auth.user_organizations());
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================================================
-- ORGANIZATIONS TABLE POLICIES
-- =============================================================================

-- Admins can view all organizations
CREATE POLICY "Admins can view all organizations" ON organizations
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT TO authenticated
  USING (id = ANY(auth.user_organizations()));

-- Only admins can create organizations
CREATE POLICY "Only admins can create organizations" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin());

-- Admins and organization owners can update their organizations
CREATE POLICY "Admins and owners can update organizations" ON organizations
  FOR UPDATE TO authenticated
  USING (
    auth.is_admin() OR 
    auth.has_role_in_org(id, 'organization_owner')
  )
  WITH CHECK (
    auth.is_admin() OR 
    auth.has_role_in_org(id, 'organization_owner')
  );

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated
  USING (email = auth.email());

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Organization members can view users in their organization
CREATE POLICY "Organization members can view org users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur1
      JOIN user_roles ur2 ON ur1.organization_id = ur2.organization_id
      JOIN users u ON ur2.user_id = u.id
      WHERE ur1.user_id = users.id
      AND u.email = auth.email()
      AND ur1.is_active = true
      AND ur2.is_active = true
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- Only admins can create users
CREATE POLICY "Only admins can create users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin());

-- =============================================================================
-- USER ROLES TABLE POLICIES
-- =============================================================================

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Organization owners/admins can view roles in their organization
CREATE POLICY "Org admins can view org roles" ON user_roles
  FOR SELECT TO authenticated
  USING (auth.can_access_org(organization_id));

-- Only admins and organization owners can manage roles
CREATE POLICY "Admins and owners can manage roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    auth.is_admin() OR
    auth.has_role_in_org(organization_id, 'organization_owner')
  )
  WITH CHECK (
    auth.is_admin() OR
    auth.has_role_in_org(organization_id, 'organization_owner')
  );

-- =============================================================================
-- PROJECTS TABLE POLICIES
-- =============================================================================

-- Anyone can view active projects (public listings)
CREATE POLICY "Anyone can view active projects" ON projects
  FOR SELECT TO authenticated
  USING (status IN ('pre_sale', 'construction'));

-- Organization members can view all their projects
CREATE POLICY "Organization members can view org projects" ON projects
  FOR SELECT TO authenticated
  USING (auth.can_access_org(organization_id));

-- Admins can view all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Organization members can manage their projects
CREATE POLICY "Organization members can manage projects" ON projects
  FOR ALL TO authenticated
  USING (auth.can_access_org(organization_id))
  WITH CHECK (auth.can_access_org(organization_id));

-- =============================================================================
-- UNITS TABLE POLICIES
-- =============================================================================

-- Anyone can view available units in active projects
CREATE POLICY "Anyone can view available units" ON units
  FOR SELECT TO authenticated
  USING (
    status = 'available' AND
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = units.project_id 
      AND p.status IN ('pre_sale', 'construction')
    )
  );

-- Organization members can view all units in their projects
CREATE POLICY "Organization members can view org units" ON units
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = units.project_id 
      AND auth.can_access_org(p.organization_id)
    )
  );

-- Users can view units in their operations
CREATE POLICY "Users can view units in their operations" ON units
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operation_units ou
      JOIN operations o ON ou.operation_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE ou.unit_id = units.id
      AND u.email = auth.email()
    )
  );

-- Organization members can manage their units
CREATE POLICY "Organization members can manage units" ON units
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = units.project_id 
      AND auth.can_access_org(p.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = units.project_id 
      AND auth.can_access_org(p.organization_id)
    )
  );

-- =============================================================================
-- OPERATIONS TABLE POLICIES
-- =============================================================================

-- Users can view their own operations
CREATE POLICY "Users can view their own operations" ON operations
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Organization members can view operations in their organization
CREATE POLICY "Organization members can view org operations" ON operations
  FOR SELECT TO authenticated
  USING (auth.can_access_org(organization_id));

-- Admins can view all operations
CREATE POLICY "Admins can view all operations" ON operations
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Users can create their own operations
CREATE POLICY "Users can create their own operations" ON operations
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Users can update their own operations, org members can update org operations
CREATE POLICY "Users and org members can update operations" ON operations
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    ) OR
    auth.can_access_org(organization_id) OR
    auth.is_admin()
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    ) OR
    auth.can_access_org(organization_id) OR
    auth.is_admin()
  );

-- =============================================================================
-- OPERATION UNITS TABLE POLICIES
-- =============================================================================

-- Inherit policies from operations table
CREATE POLICY "Operation units follow operation policies" ON operation_units
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = operation_units.operation_id
      AND (
        o.user_id IN (
          SELECT id FROM users WHERE email = auth.email()
        ) OR
        auth.can_access_org(o.organization_id) OR
        auth.is_admin()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = operation_units.operation_id
      AND (
        o.user_id IN (
          SELECT id FROM users WHERE email = auth.email()
        ) OR
        auth.can_access_org(o.organization_id) OR
        auth.is_admin()
      )
    )
  );

-- =============================================================================
-- OPERATION STEPS TABLE POLICIES
-- =============================================================================

-- Same as operation units - inherit from operations
CREATE POLICY "Operation steps follow operation policies" ON operation_steps
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = operation_steps.operation_id
      AND (
        o.user_id IN (
          SELECT id FROM users WHERE email = auth.email()
        ) OR
        auth.can_access_org(o.organization_id) OR
        auth.is_admin()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = operation_steps.operation_id
      AND (
        o.user_id IN (
          SELECT id FROM users WHERE email = auth.email()
        ) OR
        auth.can_access_org(o.organization_id) OR
        auth.is_admin()
      )
    )
  );

-- =============================================================================
-- DOCUMENTS TABLE POLICIES
-- =============================================================================

-- Users can view their own documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Organization members can view documents in their organization
CREATE POLICY "Organization members can view org documents" ON documents
  FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL AND
    auth.can_access_org(organization_id)
  );

-- Professionals can view documents they're assigned to validate
CREATE POLICY "Professionals can view assigned documents" ON documents
  FOR SELECT TO authenticated
  USING (
    operation_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM professional_assignments pa
      JOIN professionals p ON pa.professional_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pa.operation_id = documents.operation_id
      AND u.email = auth.email()
      AND pa.is_active = true
    )
  );

-- Users can upload their own documents
CREATE POLICY "Users can upload their own documents" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Users, organization members, and assigned professionals can update documents
CREATE POLICY "Authorized users can update documents" ON documents
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    ) OR
    (organization_id IS NOT NULL AND auth.can_access_org(organization_id)) OR
    (operation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM professional_assignments pa
      JOIN professionals p ON pa.professional_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pa.operation_id = documents.operation_id
      AND u.email = auth.email()
      AND pa.is_active = true
    )) OR
    auth.is_admin()
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    ) OR
    (organization_id IS NOT NULL AND auth.can_access_org(organization_id)) OR
    (operation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM professional_assignments pa
      JOIN professionals p ON pa.professional_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE pa.operation_id = documents.operation_id
      AND u.email = auth.email()
      AND pa.is_active = true
    )) OR
    auth.is_admin()
  );

-- =============================================================================
-- DOCUMENT TEMPLATES TABLE POLICIES
-- =============================================================================

-- Organization members can view their templates
CREATE POLICY "Organization members can view org templates" ON document_templates
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL OR -- Global templates
    auth.can_access_org(organization_id)
  );

-- Organization members can manage their templates
CREATE POLICY "Organization members can manage templates" ON document_templates
  FOR ALL TO authenticated
  USING (
    organization_id IS NULL AND auth.is_admin() OR -- Global templates only by admins
    auth.can_access_org(organization_id)
  )
  WITH CHECK (
    organization_id IS NULL AND auth.is_admin() OR
    auth.can_access_org(organization_id)
  );

-- =============================================================================
-- PROFESSIONALS TABLE POLICIES
-- =============================================================================

-- Admins can view all professionals
CREATE POLICY "Admins can view all professionals" ON professionals
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- Professionals can view their own profile
CREATE POLICY "Professionals can view their own profile" ON professionals
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Organization members can view professionals (for assignment)
CREATE POLICY "Organization members can view professionals" ON professionals
  FOR SELECT TO authenticated
  USING (
    is_active = true AND is_verified = true
  );

-- Professionals can update their own profile
CREATE POLICY "Professionals can update their own profile" ON professionals
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Only admins can create/verify professionals
CREATE POLICY "Only admins can create professionals" ON professionals
  FOR INSERT TO authenticated
  WITH CHECK (auth.is_admin());

-- =============================================================================
-- PROFESSIONAL ASSIGNMENTS TABLE POLICIES
-- =============================================================================

-- Same patterns as operations - users, org members, and assigned professionals can view
CREATE POLICY "Authorized users can view professional assignments" ON professional_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = professional_assignments.operation_id
      AND (
        o.user_id IN (
          SELECT id FROM users WHERE email = auth.email()
        ) OR
        auth.can_access_org(o.organization_id)
      )
    ) OR
    professional_id IN (
      SELECT p.id FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE u.email = auth.email()
    ) OR
    auth.is_admin()
  );

-- Organization members can assign professionals
CREATE POLICY "Organization members can assign professionals" ON professional_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM operations o
      WHERE o.id = professional_assignments.operation_id
      AND auth.can_access_org(o.organization_id)
    ) OR
    auth.is_admin()
  );

-- =============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true); -- Will be controlled by application logic

-- =============================================================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (auth.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- ENABLE REALTIME FOR RELEVANT TABLES
-- =============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE operations;
ALTER PUBLICATION supabase_realtime ADD TABLE operation_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE units;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;