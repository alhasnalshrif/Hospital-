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

    // Seed basic permissions
    const basicPermissions = [
      { name: 'patients:create', description: 'Create patients', resource: 'patients', action: 'create' },
      { name: 'patients:read', description: 'Read patients', resource: 'patients', action: 'read' },
      { name: 'patients:update', description: 'Update patients', resource: 'patients', action: 'update' },
      { name: 'patients:delete', description: 'Delete patients', resource: 'patients', action: 'delete' },
      { name: 'bills:create', description: 'Create bills', resource: 'bills', action: 'create' },
      { name: 'bills:read', description: 'Read bills', resource: 'bills', action: 'read' },
      { name: 'payments:create', description: 'Process payments', resource: 'payments', action: 'create' },
      { name: 'payments:read', description: 'Read payments', resource: 'payments', action: 'read' },
    ];

    for (const permission of basicPermissions) {
      await db.insert(permissions).values(permission).onConflictDoNothing();
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