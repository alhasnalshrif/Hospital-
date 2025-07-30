import { ExternalSystemResponse } from '../types';
import { db, medicalImages, inventoryStock, patientInsurance, internalInsuranceClaims } from '../db';
import { eq } from 'drizzle-orm';

// Internal Medical Imaging System (PACS)
export class PACSService {
  async uploadImage(patientId: string, imageData: Buffer, metadata: any): Promise<ExternalSystemResponse> {
    try {
      console.log(`Processing image upload internally for patient ${patientId}`);
      
      const dicomId = `DICOM_${Date.now()}_${patientId}`;
      const imageUrl = `/internal/images/${patientId}/${Date.now()}`;
      
      // Store in internal database
      const newImage = await db.insert(medicalImages).values({
        patientId,
        dicomId,
        imageType: metadata?.imageType || 'X-RAY',
        studyDate: new Date(),
        bodyPart: metadata?.bodyPart,
        description: metadata?.description,
        imageUrl,
        thumbnailUrl: `${imageUrl}_thumb`,
        fileSize: imageData.length,
        metadata,
      }).returning();

      return {
        success: true,
        data: {
          dicomId: newImage[0].dicomId,
          imageUrl: newImage[0].imageUrl,
          metadata: newImage[0].metadata,
        },
      };
    } catch (error) {
      console.error('Internal PACS upload error:', error);
      return {
        success: false,
        error: 'Failed to upload image to internal PACS',
      };
    }
  }

  async getImage(dicomId: string): Promise<ExternalSystemResponse> {
    try {
      console.log(`Retrieving image from internal PACS: ${dicomId}`);
      
      const image = await db
        .select()
        .from(medicalImages)
        .where(eq(medicalImages.dicomId, dicomId))
        .limit(1);

      if (image.length === 0) {
        return {
          success: false,
          error: 'Image not found in internal PACS',
        };
      }

      return {
        success: true,
        data: {
          imageUrl: image[0].imageUrl,
          metadata: {
            studyDate: image[0].studyDate,
            imageType: image[0].imageType,
            bodyPart: image[0].bodyPart,
            findings: image[0].findings,
          },
        },
      };
    } catch (error) {
      console.error('Internal PACS retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve image from internal PACS',
      };
    }
  }
}

// Internal HL7/FHIR System - Extended patient data management
export class HL7FHIRService {
  async sendPatientData(patientData: any): Promise<ExternalSystemResponse> {
    try {
      console.log('Processing patient data in internal HL7/FHIR system');
      
      // Convert to FHIR format for internal processing
      const fhirPatient = {
        resourceType: 'Patient',
        id: patientData.id,
        identifier: [
          {
            use: 'usual',
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                },
              ],
            },
            value: patientData.patientNumber,
          },
        ],
        name: [
          {
            use: 'official',
            family: patientData.lastName,
            given: [patientData.firstName],
          },
        ],
        gender: patientData.gender,
        birthDate: patientData.dateOfBirth,
      };

      // In internal system, this would be stored in a FHIR-compliant format
      return {
        success: true,
        data: { 
          fhirResource: fhirPatient,
          processingStatus: 'completed',
          internalId: `FHIR_${Date.now()}_${patientData.id}`,
        },
      };
    } catch (error) {
      console.error('Internal HL7/FHIR processing error:', error);
      return {
        success: false,
        error: 'Failed to process data in internal HL7/FHIR system',
      };
    }
  }

  async getDiagnosticReport(patientId: string): Promise<ExternalSystemResponse> {
    try {
      console.log(`Getting diagnostic report from internal system for patient ${patientId}`);
      
      // Generate internal diagnostic report
      const diagnosticReport = {
        resourceType: 'DiagnosticReport',
        id: `report_${patientId}_${Date.now()}`,
        status: 'final',
        subject: {
          reference: `Patient/${patientId}`,
        },
        effectiveDateTime: new Date().toISOString(),
        conclusion: 'Internal diagnostic report generated from hospital system',
        source: 'internal',
      };

      return {
        success: true,
        data: diagnosticReport,
      };
    } catch (error) {
      console.error('Internal HL7/FHIR get report error:', error);
      return {
        success: false,
        error: 'Failed to get diagnostic report from internal system',
      };
    }
  }
}

// Internal ERP System - Staff and Inventory Management
export class ERPService {
  async syncStaffData(userData: any): Promise<ExternalSystemResponse> {
    try {
      console.log('Syncing staff data in internal ERP system');
      
      // Internal staff sync - would update employee records
      return {
        success: true,
        data: {
          employeeId: userData.employeeId,
          syncedAt: new Date().toISOString(),
          internalProcessing: true,
          status: 'synchronized',
        },
      };
    } catch (error) {
      console.error('Internal ERP sync error:', error);
      return {
        success: false,
        error: 'Failed to sync with internal ERP system',
      };
    }
  }

  async updateInventory(itemId: string, quantity: number): Promise<ExternalSystemResponse> {
    try {
      console.log(`Updating inventory in internal ERP: ${itemId} - ${quantity}`);
      
      // Update internal inventory
      const stock = await db
        .select()
        .from(inventoryStock)
        .where(eq(inventoryStock.itemId, itemId))
        .limit(1);

      if (stock.length > 0) {
        await db
          .update(inventoryStock)
          .set({
            quantityInStock: quantity,
            availableQuantity: quantity,
            lastStockCheck: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(inventoryStock.itemId, itemId));
      }

      return {
        success: true,
        data: {
          itemId,
          newQuantity: quantity,
          updatedAt: new Date().toISOString(),
          source: 'internal_erp',
        },
      };
    } catch (error) {
      console.error('Internal ERP inventory update error:', error);
      return {
        success: false,
        error: 'Failed to update inventory in internal ERP',
      };
    }
  }
}

// Internal Insurance System
export class InsuranceService {
  async verifyEligibility(patientId: string, policyNumber: string): Promise<ExternalSystemResponse> {
    try {
      console.log(`Verifying insurance eligibility internally for patient ${patientId}`);
      
      // Check internal insurance records
      const insurance = await db
        .select()
        .from(patientInsurance)
        .where(eq(patientInsurance.patientId, patientId))
        .limit(1);

      let eligibility;
      if (insurance.length > 0) {
        const policy = insurance[0];
        const isActive = policy.isActive && 
                        (!policy.expirationDate || new Date(policy.expirationDate) > new Date());
        
        eligibility = {
          isEligible: isActive,
          coveragePercent: 80,
          deductible: policy.deductible || 500,
          copay: policy.coPayment || 25,
          policyStatus: isActive ? 'active' : 'inactive',
          benefits: [
            { service: 'dental', covered: true, limit: 2000 },
            { service: 'inpatient', covered: true, limit: 50000 },
            { service: 'emergency', covered: true, limit: 10000 },
          ],
          source: 'internal_verification',
        };
      } else {
        eligibility = {
          isEligible: false,
          policyStatus: 'not_found',
          message: 'No insurance record found for patient',
        };
      }

      return {
        success: true,
        data: eligibility,
      };
    } catch (error) {
      console.error('Internal insurance verification error:', error);
      return {
        success: false,
        error: 'Failed to verify insurance eligibility internally',
      };
    }
  }

  async submitClaim(claimData: any): Promise<ExternalSystemResponse> {
    try {
      console.log('Submitting insurance claim to internal system');
      
      const claimNumber = `CLM_${Date.now()}`;
      
      // Submit to internal insurance processing
      const newClaim = await db.insert(internalInsuranceClaims).values({
        claimNumber,
        patientId: claimData.patientId,
        insuranceId: claimData.insuranceId,
        serviceDate: new Date(claimData.serviceDate),
        claimType: claimData.claimType || 'medical',
        totalCharges: claimData.totalCharges,
        status: 'submitted',
      }).returning();

      return {
        success: true,
        data: {
          claimId: newClaim[0].id,
          claimNumber: newClaim[0].claimNumber,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          estimatedProcessingTime: '3-5 business days (internal processing)',
          source: 'internal_insurance',
        },
      };
    } catch (error) {
      console.error('Internal insurance claim submission error:', error);
      return {
        success: false,
        error: 'Failed to submit insurance claim to internal system',
      };
    }
  }

  async getClaimStatus(claimId: string): Promise<ExternalSystemResponse> {
    try {
      console.log(`Getting claim status from internal system for ${claimId}`);
      
      // Get from internal system
      const claim = await db
        .select()
        .from(internalInsuranceClaims)
        .where(eq(internalInsuranceClaims.id, claimId))
        .limit(1);

      if (claim.length === 0) {
        return {
          success: false,
          error: 'Claim not found in internal system',
        };
      }

      const claimStatus = {
        claimId: claim[0].id,
        claimNumber: claim[0].claimNumber,
        status: claim[0].status,
        processedAmount: claim[0].paidAmount || 0,
        lastUpdated: claim[0].lastStatusUpdate?.toISOString(),
        source: 'internal_insurance',
      };

      return {
        success: true,
        data: claimStatus,
      };
    } catch (error) {
      console.error('Internal insurance claim status error:', error);
      return {
        success: false,
        error: 'Failed to get claim status from internal system',
      };
    }
  }
}