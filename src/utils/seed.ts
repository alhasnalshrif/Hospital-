import { db, users, serviceCharges, permissions, rolePermissions } from '../db';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await db.insert(users).values({
      employeeId: 'EMP001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@hospital.com',
      role: 'admin',
      department: 'administration',
      passwordHash: adminPassword,
      hireDate: new Date(),
    }).onConflictDoNothing();

    // Create sample doctor
    const doctorPassword = await bcrypt.hash('doctor123', 12);
    await db.insert(users).values({
      employeeId: 'DOC001',
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor@hospital.com',
      role: 'doctor',
      department: 'dental',
      specialization: 'General Dentistry',
      licenseNumber: 'LIC12345',
      passwordHash: doctorPassword,
      hireDate: new Date(),
    }).onConflictDoNothing();

    // Create sample nurse
    const nursePassword = await bcrypt.hash('nurse123', 12);
    await db.insert(users).values({
      employeeId: 'NUR001',
      firstName: 'Mary',
      lastName: 'Johnson',
      email: 'nurse@hospital.com',
      role: 'nurse',
      department: 'inpatient',
      passwordHash: nursePassword,
      hireDate: new Date(),
    }).onConflictDoNothing();

    // Create sample cashier
    const cashierPassword = await bcrypt.hash('cashier123', 12);
    await db.insert(users).values({
      employeeId: 'CSH001',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'cashier@hospital.com',
      role: 'cashier',
      department: 'administration',
      passwordHash: cashierPassword,
      hireDate: new Date(),
    }).onConflictDoNothing();

    // Seed service charges
    const services = [
      // Dental services
      { serviceCode: 'DEN001', serviceName: 'Dental Consultation', serviceType: 'dental', department: 'dental', basePrice: '100.00' },
      { serviceCode: 'DEN002', serviceName: 'Tooth Filling', serviceType: 'dental', department: 'dental', basePrice: '150.00' },
      { serviceCode: 'DEN003', serviceName: 'Tooth Extraction', serviceType: 'dental', department: 'dental', basePrice: '200.00' },
      { serviceCode: 'DEN004', serviceName: 'Dental X-Ray', serviceType: 'dental', department: 'dental', basePrice: '75.00' },
      { serviceCode: 'DEN005', serviceName: 'Teeth Cleaning', serviceType: 'dental', department: 'dental', basePrice: '120.00' },

      // Inpatient services
      { serviceCode: 'INP001', serviceName: 'Room Charge (General)', serviceType: 'inpatient', department: 'inpatient', basePrice: '300.00' },
      { serviceCode: 'INP002', serviceName: 'Room Charge (Private)', serviceType: 'inpatient', department: 'inpatient', basePrice: '500.00' },
      { serviceCode: 'INP003', serviceName: 'Nursing Care', serviceType: 'inpatient', department: 'inpatient', basePrice: '100.00' },
      { serviceCode: 'INP004', serviceName: 'Medication Administration', serviceType: 'inpatient', department: 'inpatient', basePrice: '50.00' },

      // ICU services
      { serviceCode: 'ICU001', serviceName: 'ICU Room Charge', serviceType: 'icu', department: 'icu', basePrice: '1000.00' },
      { serviceCode: 'ICU002', serviceName: 'Ventilator Support', serviceType: 'icu', department: 'icu', basePrice: '500.00' },
      { serviceCode: 'ICU003', serviceName: 'Critical Care Monitoring', serviceType: 'icu', department: 'icu', basePrice: '300.00' },

      // Pediatric services
      { serviceCode: 'PED001', serviceName: 'Pediatric Consultation', serviceType: 'pediatrics', department: 'pediatrics', basePrice: '120.00' },
      { serviceCode: 'PED002', serviceName: 'Vaccination', serviceType: 'pediatrics', department: 'pediatrics', basePrice: '80.00' },
      { serviceCode: 'PED003', serviceName: 'Growth Assessment', serviceType: 'pediatrics', department: 'pediatrics', basePrice: '60.00' },

      // Physical Therapy services
      { serviceCode: 'PT001', serviceName: 'Physical Therapy Session', serviceType: 'physical_therapy', department: 'physical_therapy', basePrice: '150.00' },
      { serviceCode: 'PT002', serviceName: 'Initial PT Assessment', serviceType: 'physical_therapy', department: 'physical_therapy', basePrice: '200.00' },
      { serviceCode: 'PT003', serviceName: 'Exercise Therapy', serviceType: 'physical_therapy', department: 'physical_therapy', basePrice: '100.00' },

      // General services
      { serviceCode: 'GEN001', serviceName: 'General Consultation', serviceType: 'consultation', department: 'administration', basePrice: '80.00' },
      { serviceCode: 'LAB001', serviceName: 'Blood Test', serviceType: 'diagnostic', department: 'laboratory', basePrice: '50.00' },
      { serviceCode: 'RAD001', serviceName: 'X-Ray', serviceType: 'diagnostic', department: 'radiology', basePrice: '100.00' },
    ];

    for (const service of services) {
      await db.insert(serviceCharges).values({
        ...service,
        serviceType: service.serviceType as any,
      }).onConflictDoNothing();
    }

    // Seed comprehensive permissions
    const allPermissions = [
      // Patient Management
      { name: 'patients:create', description: 'Create patients', resource: 'patients', action: 'create' },
      { name: 'patients:read', description: 'Read patients', resource: 'patients', action: 'read' },
      { name: 'patients:update', description: 'Update patients', resource: 'patients', action: 'update' },
      { name: 'patients:delete', description: 'Delete patients', resource: 'patients', action: 'delete' },
      { name: 'patients:search', description: 'Search patients', resource: 'patients', action: 'search' },
      
      // Medical Records
      { name: 'medical_records:create', description: 'Create medical records', resource: 'medical_records', action: 'create' },
      { name: 'medical_records:read', description: 'Read medical records', resource: 'medical_records', action: 'read' },
      { name: 'medical_records:update', description: 'Update medical records', resource: 'medical_records', action: 'update' },
      { name: 'medical_records:delete', description: 'Delete medical records', resource: 'medical_records', action: 'delete' },
      
      // Billing & Payments
      { name: 'bills:create', description: 'Create bills', resource: 'bills', action: 'create' },
      { name: 'bills:read', description: 'Read bills', resource: 'bills', action: 'read' },
      { name: 'bills:update', description: 'Update bills', resource: 'bills', action: 'update' },
      { name: 'bills:delete', description: 'Delete bills', resource: 'bills', action: 'delete' },
      { name: 'bills:approve', description: 'Approve bills', resource: 'bills', action: 'approve' },
      
      { name: 'payments:create', description: 'Process payments', resource: 'payments', action: 'create' },
      { name: 'payments:read', description: 'Read payments', resource: 'payments', action: 'read' },
      { name: 'payments:refund', description: 'Process refunds', resource: 'payments', action: 'refund' },
      
      // Dental Department
      { name: 'dental:create', description: 'Create dental records', resource: 'dental', action: 'create' },
      { name: 'dental:read', description: 'Read dental records', resource: 'dental', action: 'read' },
      { name: 'dental:update', description: 'Update dental records', resource: 'dental', action: 'update' },
      { name: 'dental:delete', description: 'Delete dental records', resource: 'dental', action: 'delete' },
      { name: 'dental:appointments', description: 'Manage dental appointments', resource: 'dental', action: 'appointments' },
      { name: 'dental:xrays', description: 'Manage dental X-rays', resource: 'dental', action: 'xrays' },
      
      // Inpatient Care
      { name: 'inpatient:create', description: 'Create inpatient records', resource: 'inpatient', action: 'create' },
      { name: 'inpatient:read', description: 'Read inpatient records', resource: 'inpatient', action: 'read' },
      { name: 'inpatient:update', description: 'Update inpatient records', resource: 'inpatient', action: 'update' },
      { name: 'inpatient:delete', description: 'Delete inpatient records', resource: 'inpatient', action: 'delete' },
      { name: 'inpatient:beds', description: 'Manage bed allocations', resource: 'inpatient', action: 'beds' },
      { name: 'inpatient:discharge', description: 'Process patient discharge', resource: 'inpatient', action: 'discharge' },
      
      // ICU Management
      { name: 'icu:create', description: 'Create ICU records', resource: 'icu', action: 'create' },
      { name: 'icu:read', description: 'Read ICU records', resource: 'icu', action: 'read' },
      { name: 'icu:update', description: 'Update ICU records', resource: 'icu', action: 'update' },
      { name: 'icu:delete', description: 'Delete ICU records', resource: 'icu', action: 'delete' },
      { name: 'icu:monitoring', description: 'Access ICU monitoring', resource: 'icu', action: 'monitoring' },
      { name: 'icu:procedures', description: 'Manage ICU procedures', resource: 'icu', action: 'procedures' },
      
      // Pediatrics
      { name: 'pediatrics:create', description: 'Create pediatric records', resource: 'pediatrics', action: 'create' },
      { name: 'pediatrics:read', description: 'Read pediatric records', resource: 'pediatrics', action: 'read' },
      { name: 'pediatrics:update', description: 'Update pediatric records', resource: 'pediatrics', action: 'update' },
      { name: 'pediatrics:delete', description: 'Delete pediatric records', resource: 'pediatrics', action: 'delete' },
      { name: 'pediatrics:vaccinations', description: 'Manage vaccinations', resource: 'pediatrics', action: 'vaccinations' },
      { name: 'pediatrics:growth_charts', description: 'Manage growth charts', resource: 'pediatrics', action: 'growth_charts' },
      
      // Physical Therapy
      { name: 'physical_therapy:create', description: 'Create therapy records', resource: 'physical_therapy', action: 'create' },
      { name: 'physical_therapy:read', description: 'Read therapy records', resource: 'physical_therapy', action: 'read' },
      { name: 'physical_therapy:update', description: 'Update therapy records', resource: 'physical_therapy', action: 'update' },
      { name: 'physical_therapy:delete', description: 'Delete therapy records', resource: 'physical_therapy', action: 'delete' },
      { name: 'physical_therapy:assessments', description: 'Manage PT assessments', resource: 'physical_therapy', action: 'assessments' },
      { name: 'physical_therapy:sessions', description: 'Manage therapy sessions', resource: 'physical_therapy', action: 'sessions' },
      
      // User Management
      { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'users:read', description: 'Read user information', resource: 'users', action: 'read' },
      { name: 'users:update', description: 'Update users', resource: 'users', action: 'update' },
      { name: 'users:delete', description: 'Delete users', resource: 'users', action: 'delete' },
      { name: 'users:roles', description: 'Manage user roles', resource: 'users', action: 'roles' },
      
      // Reports & Analytics
      { name: 'reports:read', description: 'Read reports', resource: 'reports', action: 'read' },
      { name: 'reports:generate', description: 'Generate reports', resource: 'reports', action: 'generate' },
      { name: 'reports:export', description: 'Export reports', resource: 'reports', action: 'export' },
      
      // System Administration
      { name: 'system:config', description: 'System configuration', resource: 'system', action: 'config' },
      { name: 'system:audit', description: 'Access audit logs', resource: 'system', action: 'audit' },
      { name: 'system:backup', description: 'System backup operations', resource: 'system', action: 'backup' },
    ];

    for (const permission of allPermissions) {
      await db.insert(permissions).values(permission).onConflictDoNothing();
    }

    // Assign permissions to roles
    const rolePermissionMappings = {
      admin: [
        // Admins have all permissions (handled by middleware, but we'll assign some for completeness)
        'patients:create', 'patients:read', 'patients:update', 'patients:delete', 'patients:search',
        'bills:create', 'bills:read', 'bills:update', 'bills:delete', 'bills:approve',
        'payments:create', 'payments:read', 'payments:refund',
        'users:create', 'users:read', 'users:update', 'users:delete', 'users:roles',
        'reports:read', 'reports:generate', 'reports:export',
        'system:config', 'system:audit', 'system:backup',
      ],
      doctor: [
        'patients:create', 'patients:read', 'patients:update', 'patients:search',
        'medical_records:create', 'medical_records:read', 'medical_records:update',
        'bills:create', 'bills:read',
        'dental:create', 'dental:read', 'dental:update', 'dental:appointments', 'dental:xrays',
        'inpatient:create', 'inpatient:read', 'inpatient:update', 'inpatient:discharge',
        'icu:create', 'icu:read', 'icu:update', 'icu:procedures',
        'pediatrics:create', 'pediatrics:read', 'pediatrics:update', 'pediatrics:vaccinations', 'pediatrics:growth_charts',
        'physical_therapy:read', 'physical_therapy:assessments',
        'reports:read',
      ],
      nurse: [
        'patients:create', 'patients:read', 'patients:update', 'patients:search',
        'medical_records:create', 'medical_records:read', 'medical_records:update',
        'inpatient:create', 'inpatient:read', 'inpatient:update', 'inpatient:beds',
        'icu:read', 'icu:update', 'icu:monitoring',
        'pediatrics:read', 'pediatrics:update', 'pediatrics:vaccinations',
        'bills:read',
      ],
      therapist: [
        'patients:read', 'patients:search',
        'medical_records:read',
        'physical_therapy:create', 'physical_therapy:read', 'physical_therapy:update', 'physical_therapy:assessments', 'physical_therapy:sessions',
        'reports:read',
      ],
      cashier: [
        'patients:read', 'patients:search',
        'bills:create', 'bills:read', 'bills:update',
        'payments:create', 'payments:read',
        'reports:read',
      ],
      receptionist: [
        'patients:create', 'patients:read', 'patients:update', 'patients:search',
        'dental:appointments',
        'inpatient:beds',
        'bills:read',
      ],
      lab_tech: [
        'patients:read', 'patients:search',
        'medical_records:read',
        'reports:read',
      ],
      radiologist: [
        'patients:read', 'patients:search',
        'medical_records:read',
        'dental:xrays',
        'reports:read',
      ],
    };

    // Get all permissions for ID mapping
    const allPerms = await db.select().from(permissions);
    const permissionMap = new Map(allPerms.map(p => [p.name, p.id]));

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
      for (const permissionName of permissionNames) {
        const permissionId = permissionMap.get(permissionName);
        if (permissionId) {
          await db.insert(rolePermissions).values({
            role: roleName as any,
            permissionId,
          }).onConflictDoNothing();
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📋 Default users created:');
    console.log('   - Admin: admin@hospital.com / admin123');
    console.log('   - Doctor: doctor@hospital.com / doctor123');
    console.log('   - Nurse: nurse@hospital.com / nurse123');
    console.log('   - Cashier: cashier@hospital.com / cashier123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}