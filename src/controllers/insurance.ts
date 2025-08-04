import { Request, Response } from 'express';
import { db, insuranceCompanies, patientInsurance, internalInsuranceClaims, eligibilityVerifications, preauthorizations, insuranceBenefits } from '../db';
import { eq, and } from 'drizzle-orm';

// Insurance Management Controller (Internal Insurance System)

export const verifyInsuranceEligibility = async (req: Request, res: Response) => {
  try {
    const { patientId, policyNumber } = req.body;

    // Find patient insurance
    const insurance = await db
      .select()
      .from(patientInsurance)
      .where(and(
        eq(patientInsurance.patientId, patientId),
        eq(patientInsurance.policyNumber, policyNumber)
      ))
      .limit(1);

    if (insurance.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance policy not found for patient',
      });
    }

    const policy = insurance[0];
    const currentDate = new Date();
    const isActive = policy.isActive && 
                    (!policy.expirationDate || new Date(policy.expirationDate) > currentDate);

    // Get insurance company and benefits
    const company = await db
      .select()
      .from(insuranceCompanies)
      .where(eq(insuranceCompanies.id, policy.companyId))
      .limit(1);

    const benefits = await db
      .select()
      .from(insuranceBenefits)
      .where(eq(insuranceBenefits.companyId, policy.companyId));

    // Create eligibility verification record
    const verification = await db.insert(eligibilityVerifications).values({
      patientId,
      insuranceId: policy.id,
      eligibilityStatus: isActive ? 'active' : 'inactive',
      effectiveDate: policy.effectiveDate,
      terminationDate: policy.expirationDate,
      benefitDetails: benefits,
      copayInfo: { copayment: policy.coPayment },
      deductibleInfo: { deductible: policy.deductible },
      verificationMethod: 'internal',
      responseCode: isActive ? 'ELIGIBLE' : 'INACTIVE',
    }).returning();

    const eligibilityResponse = {
      isEligible: isActive,
      policyStatus: isActive ? 'active' : 'inactive',
      coverageType: policy.coverageType,
      deductible: policy.deductible,
      copay: policy.coPayment,
      outOfPocketMax: policy.outOfPocketMax,
      benefits: benefits.map(b => ({
        service: b.serviceCategory,
        covered: b.isCovered,
        coveragePercentage: b.coveragePercentage,
        copayAmount: b.copayAmount,
        annualLimit: b.annualLimit,
        priorAuthRequired: b.priorAuthRequired,
      })),
      company: company[0]?.name,
      verificationId: verification[0].id,
    };

    res.json({
      success: true,
      data: eligibilityResponse,
    });
  } catch (error) {
    console.error('Insurance verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify insurance eligibility',
    });
  }
};

export const submitInsuranceClaim = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      insuranceId,
      serviceDate,
      claimType,
      totalCharges,
      serviceItems, // Array of line items
    } = req.body;

    const claimNumber = `CLM_${Date.now()}_${patientId}`;

    // Create main claim
    const newClaim = await db.insert(internalInsuranceClaims).values({
      claimNumber,
      patientId,
      insuranceId,
      serviceDate: new Date(serviceDate),
      claimType,
      totalCharges,
      status: 'submitted',
    }).returning();

    // In a real implementation, would also create claim line items
    // For simplicity, storing in the response

    res.status(201).json({
      success: true,
      message: 'Insurance claim submitted successfully',
      data: {
        claimId: newClaim[0].id,
        claimNumber: newClaim[0].claimNumber,
        status: 'submitted',
        submittedAt: newClaim[0].submissionDate,
        estimatedProcessingTime: '5-7 business days',
        totalCharges: newClaim[0].totalCharges,
      },
    });
  } catch (error) {
    console.error('Insurance claim submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit insurance claim',
    });
  }
};

export const getClaimStatus = async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;

    const claim = await db
      .select()
      .from(internalInsuranceClaims)
      .where(eq(internalInsuranceClaims.id, claimId))
      .limit(1);

    if (claim.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance claim not found',
      });
    }

    const claimData = claim[0];

    res.json({
      success: true,
      data: {
        claimId: claimData.id,
        claimNumber: claimData.claimNumber,
        status: claimData.status,
        totalCharges: claimData.totalCharges,
        allowedAmount: claimData.allowedAmount,
        paidAmount: claimData.paidAmount,
        patientResponsibility: claimData.patientResponsibility,
        paymentDate: claimData.paymentDate,
        denialReason: claimData.denialReason,
        lastUpdated: claimData.lastStatusUpdate,
      },
    });
  } catch (error) {
    console.error('Get claim status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get claim status',
    });
  }
};

export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;
    const {
      status,
      allowedAmount,
      paidAmount,
      patientResponsibility,
      denialReason,
      paymentDate,
      checkNumber,
    } = req.body;

    const updatedClaim = await db
      .update(internalInsuranceClaims)
      .set({
        status,
        allowedAmount,
        paidAmount,
        patientResponsibility,
        denialReason,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        checkNumber,
        lastStatusUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(internalInsuranceClaims.id, claimId))
      .returning();

    if (updatedClaim.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance claim not found',
      });
    }

    res.json({
      success: true,
      message: 'Claim status updated successfully',
      data: updatedClaim[0],
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update claim status',
    });
  }
};

export const createPreauthorization = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      insuranceId,
      requestedService,
      serviceCode,
      estimatedCost,
      clinicalJustification,
      requestedBy,
    } = req.body;

    const authNumber = `AUTH_${Date.now()}_${patientId}`;

    const newAuth = await db.insert(preauthorizations).values({
      authNumber,
      patientId,
      insuranceId,
      requestedService,
      serviceCode,
      estimatedCost,
      clinicalJustification,
      requestedBy,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Pre-authorization request submitted successfully',
      data: newAuth[0],
    });
  } catch (error) {
    console.error('Create pre-authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pre-authorization request',
    });
  }
};

export const updatePreauthorizationStatus = async (req: Request, res: Response) => {
  try {
    const { authId } = req.params;
    const {
      status,
      approvedUnits,
      denialReason,
      reviewerNotes,
      expirationDate,
      reviewedBy,
    } = req.body;

    const updatedAuth = await db
      .update(preauthorizations)
      .set({
        status,
        approvalDate: status === 'approved' ? new Date() : null,
        approvedUnits,
        denialReason,
        reviewerNotes,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        reviewedBy,
        updatedAt: new Date(),
      })
      .where(eq(preauthorizations.id, authId))
      .returning();

    if (updatedAuth.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pre-authorization not found',
      });
    }

    res.json({
      success: true,
      message: 'Pre-authorization status updated successfully',
      data: updatedAuth[0],
    });
  } catch (error) {
    console.error('Update pre-authorization status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pre-authorization status',
    });
  }
};

export const addPatientInsurance = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      companyId,
      policyNumber,
      groupNumber,
      policyHolderName,
      relationshipToPatient,
      effectiveDate,
      expirationDate,
      isPrimary,
      coverageType,
      deductible,
      coPayment,
      outOfPocketMax,
    } = req.body;

    const newInsurance = await db.insert(patientInsurance).values({
      patientId,
      companyId,
      policyNumber,
      groupNumber,
      policyHolderName,
      relationshipToPatient: relationshipToPatient || 'self',
      effectiveDate: new Date(effectiveDate),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      isPrimary: isPrimary || false,
      coverageType,
      deductible,
      coPayment,
      outOfPocketMax,
      verificationStatus: 'pending',
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Patient insurance added successfully',
      data: newInsurance[0],
    });
  } catch (error) {
    console.error('Add patient insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add patient insurance',
    });
  }
};

export const getPatientInsurance = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const insurance = await db
      .select({
        insurance: patientInsurance,
        company: insuranceCompanies,
      })
      .from(patientInsurance)
      .leftJoin(insuranceCompanies, eq(patientInsurance.companyId, insuranceCompanies.id))
      .where(eq(patientInsurance.patientId, patientId));

    res.json({
      success: true,
      data: insurance,
    });
  } catch (error) {
    console.error('Get patient insurance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient insurance',
    });
  }
};

export const createInsuranceCompany = async (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      address,
      contactPhone,
      contactEmail,
      website,
      contractedServices,
      paymentTerms,
    } = req.body;

    const newCompany = await db.insert(insuranceCompanies).values({
      name,
      code,
      address,
      contactPhone,
      contactEmail,
      website,
      contractedServices,
      paymentTerms,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Insurance company created successfully',
      data: newCompany[0],
    });
  } catch (error) {
    console.error('Create insurance company error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create insurance company',
    });
  }
};

export const getInsuranceCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await db
      .select()
      .from(insuranceCompanies)
      .where(eq(insuranceCompanies.isActive, true))
      .orderBy(insuranceCompanies.name);

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.error('Get insurance companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve insurance companies',
    });
  }
};