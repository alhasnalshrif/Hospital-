import { Request, Response } from 'express';
import { db, bills, payments, serviceCharges } from '../db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse, AuthenticatedRequest, BillingFilters, ServiceItem } from '../types';
import { generateBillNumber, generateReceiptNumber } from '../utils/helpers';

export const createBill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, visitDate, department, services, notes } = req.body;
    const billNumber = generateBillNumber();

    // Calculate totals
    let subtotal = 0;
    const processedServices: ServiceItem[] = [];

    for (const service of services) {
      // Get service price from service charges
      const serviceCharge = await db
        .select()
        .from(serviceCharges)
        .where(eq(serviceCharges.serviceCode, service.serviceCode))
        .limit(1);

      if (!serviceCharge[0]) {
        return res.status(400).json(createErrorResponse(`Service ${service.serviceCode} not found`));
      }

      const totalPrice = Number(serviceCharge[0].basePrice) * service.quantity;
      subtotal += totalPrice;

      processedServices.push({
        serviceCode: service.serviceCode,
        serviceName: serviceCharge[0].serviceName,
        quantity: service.quantity,
        unitPrice: Number(serviceCharge[0].basePrice),
        totalPrice,
        department: serviceCharge[0].department,
      });
    }

    const taxAmount = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal + taxAmount;
    const patientResponsibility = totalAmount; // Will be adjusted based on insurance

    const newBill = await db
      .insert(bills)
      .values({
        billNumber,
        patientId,
        visitDate: new Date(visitDate),
        department,
        services: processedServices,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        patientResponsibility: patientResponsibility.toString(),
        generatedById: req.user!.id,
        notes,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })
      .returning();

    res.status(201).json(createSuccessResponse(newBill[0], 'Bill created successfully'));
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json(createErrorResponse('Failed to create bill'));
  }
};

export const getBills = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      patientId,
      status,
      dateFrom,
      dateTo,
      department,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    }: BillingFilters = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let whereConditions = [];
    
    if (patientId) {
      whereConditions.push(eq(bills.patientId, patientId));
    }
    
    if (status) {
      whereConditions.push(eq(bills.status, status as any));
    }
    
    if (department) {
      whereConditions.push(eq(bills.department, department));
    }
    
    if (dateFrom) {
      whereConditions.push(gte(bills.visitDate, new Date(dateFrom)));
    }
    
    if (dateTo) {
      whereConditions.push(lte(bills.visitDate, new Date(dateTo)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const billList = await db
      .select()
      .from(bills)
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(bills.createdAt) : bills.createdAt)
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse({
      bills: billList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: billList.length,
      },
    }));
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json(createErrorResponse('Failed to get bills'));
  }
};

export const getBillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bill = await db
      .select()
      .from(bills)
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill[0]) {
      return res.status(404).json(createErrorResponse('Bill not found'));
    }

    // Get related payments
    const billPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.billId, id))
      .orderBy(desc(payments.paymentDate));

    res.json(createSuccessResponse({
      ...bill[0],
      payments: billPayments,
    }));
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json(createErrorResponse('Failed to get bill'));
  }
};

export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { billId, amount, paymentMethod, transactionReference, notes } = req.body;
    const receiptNumber = generateReceiptNumber();

    // Get bill details
    const bill = await db
      .select()
      .from(bills)
      .where(eq(bills.id, billId))
      .limit(1);

    if (!bill[0]) {
      return res.status(404).json(createErrorResponse('Bill not found'));
    }

    // Calculate total paid amount
    const existingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.billId, billId));

    const totalPaid = existingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const newTotalPaid = totalPaid + Number(amount);
    const billTotal = Number(bill[0].totalAmount);

    if (newTotalPaid > billTotal) {
      return res.status(400).json(createErrorResponse('Payment amount exceeds bill total'));
    }

    // Create payment record
    const newPayment = await db
      .insert(payments)
      .values({
        billId,
        patientId: bill[0].patientId,
        amount: amount.toString(),
        paymentMethod,
        transactionReference,
        cashierId: req.user!.id,
        receiptNumber,
        notes,
      })
      .returning();

    // Update bill status
    let newStatus = bill[0].status;
    if (newTotalPaid >= billTotal) {
      newStatus = 'paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'partial';
    }

    await db
      .update(bills)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, billId));

    res.status(201).json(createSuccessResponse(newPayment[0], 'Payment processed successfully'));
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json(createErrorResponse('Failed to process payment'));
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, patientId, cashierId, dateFrom, dateTo } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereConditions = [];
    
    if (patientId) {
      whereConditions.push(eq(payments.patientId, patientId as string));
    }
    
    if (cashierId) {
      whereConditions.push(eq(payments.cashierId, cashierId as string));
    }
    
    if (dateFrom) {
      whereConditions.push(gte(payments.paymentDate, new Date(dateFrom as string)));
    }
    
    if (dateTo) {
      whereConditions.push(lte(payments.paymentDate, new Date(dateTo as string)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const paymentList = await db
      .select()
      .from(payments)
      .where(whereClause)
      .orderBy(desc(payments.paymentDate))
      .limit(Number(limit))
      .offset(offset);

    res.json(createSuccessResponse({
      payments: paymentList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: paymentList.length,
      },
    }));
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json(createErrorResponse('Failed to get payments'));
  }
};

export const getServiceCharges = async (req: Request, res: Response) => {
  try {
    const { department, serviceType } = req.query;
    
    let whereConditions = [eq(serviceCharges.isActive, true)];
    
    if (department) {
      whereConditions.push(eq(serviceCharges.department, department as string));
    }
    
    if (serviceType) {
      whereConditions.push(eq(serviceCharges.serviceType, serviceType as any));
    }

    const whereClause = and(...whereConditions);

    const services = await db
      .select()
      .from(serviceCharges)
      .where(whereClause)
      .orderBy(serviceCharges.serviceName);

    res.json(createSuccessResponse(services));
  } catch (error) {
    console.error('Get service charges error:', error);
    res.status(500).json(createErrorResponse('Failed to get service charges'));
  }
};