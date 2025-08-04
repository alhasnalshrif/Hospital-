import { Request, Response } from 'express';
import { db, inventoryItems, inventoryStock, stockMovements, purchaseOrders, inventoryCategories } from '../db';
import { eq, and, sql } from 'drizzle-orm';

// Inventory Management Controller (Internal ERP)

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      categoryId,
      unit,
      unitCost,
      reorderLevel,
      maxStockLevel,
      supplier,
      supplierContactInfo,
      requiresPrescription,
      expiryTracking,
    } = req.body;

    const itemCode = `ITM_${Date.now()}`;

    const newItem = await db.insert(inventoryItems).values({
      itemCode,
      name,
      description,
      categoryId,
      unit,
      unitCost,
      reorderLevel: reorderLevel || 10,
      maxStockLevel,
      supplier,
      supplierContactInfo,
      requiresPrescription: requiresPrescription || false,
      expiryTracking: expiryTracking || false,
    }).returning();

    // Initialize stock record
    await db.insert(inventoryStock).values({
      itemId: newItem[0].id,
      quantityInStock: 0,
      availableQuantity: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: newItem[0],
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory item',
    });
  }
};

export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const { category, lowStock } = req.query;

    let query = db
      .select({
        item: inventoryItems,
        stock: inventoryStock,
      })
      .from(inventoryItems)
      .leftJoin(inventoryStock, eq(inventoryItems.id, inventoryStock.itemId));

    if (category) {
      query = query.where(eq(inventoryItems.categoryId, category as string));
    }

    const items = await query;

    // Filter for low stock if requested
    let filteredItems = items;
    if (lowStock === 'true') {
      filteredItems = items.filter(item => 
        item.stock && item.stock.quantityInStock <= (item.item.reorderLevel || 0)
      );
    }

    res.json({
      success: true,
      data: filteredItems,
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve inventory items',
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { movementType, quantity, unitCost, reference, reason, performedBy } = req.body;

    // Get current stock
    const currentStock = await db
      .select()
      .from(inventoryStock)
      .where(eq(inventoryStock.itemId, itemId))
      .limit(1);

    if (currentStock.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in stock',
      });
    }

    const currentQuantity = currentStock[0].quantityInStock;
    let newQuantity: number;

    // Calculate new quantity based on movement type
    switch (movementType) {
      case 'IN':
        newQuantity = currentQuantity + quantity;
        break;
      case 'OUT':
        newQuantity = currentQuantity - quantity;
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            error: 'Insufficient stock available',
          });
        }
        break;
      case 'ADJUSTMENT':
        newQuantity = quantity; // Direct adjustment to specified quantity
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid movement type',
        });
    }

    // Update stock
    await db
      .update(inventoryStock)
      .set({
        quantityInStock: newQuantity,
        availableQuantity: newQuantity, // Assuming no reservations for simplicity
        lastStockCheck: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inventoryStock.itemId, itemId));

    // Record movement
    await db.insert(stockMovements).values({
      itemId,
      movementType,
      quantity: movementType === 'ADJUSTMENT' ? quantity - currentQuantity : quantity,
      unitCost,
      totalCost: unitCost ? (unitCost * Math.abs(quantity)) : null,
      reference,
      reason,
      performedBy,
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        itemId,
        previousQuantity: currentQuantity,
        newQuantity,
        movementType,
        quantity,
      },
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock',
    });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { limit = 50 } = req.query;

    const movements = await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.itemId, itemId))
      .orderBy(sql`${stockMovements.movementDate} DESC`)
      .limit(Number(limit));

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stock movements',
    });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const {
      supplier,
      supplierContactInfo,
      expectedDeliveryDate,
      items, // Array of { itemId, quantityOrdered, unitPrice }
      requestedBy,
    } = req.body;

    const poNumber = `PO_${Date.now()}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.quantityOrdered * item.unitPrice), 0);

    const newPO = await db.insert(purchaseOrders).values({
      poNumber,
      supplier,
      supplierContactInfo,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      totalAmount,
      finalAmount: totalAmount, // Assuming no tax/discount for simplicity
      requestedBy,
    }).returning();

    // Add PO items (would need purchaseOrderItems table)
    // For now, just return the PO

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: {
        ...newPO[0],
        items,
      },
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create purchase order',
    });
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = db.select().from(purchaseOrders);

    if (status) {
      query = query.where(eq(purchaseOrders.status, status as string));
    }

    const orders = await query.orderBy(sql`${purchaseOrders.orderDate} DESC`);

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve purchase orders',
    });
  }
};

export const updatePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const { poId } = req.params;
    const { status, approvedBy, actualDeliveryDate } = req.body;

    const updatedPO = await db
      .update(purchaseOrders)
      .set({
        status,
        approvedBy,
        actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, poId))
      .returning();

    if (updatedPO.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found',
      });
    }

    res.json({
      success: true,
      message: 'Purchase order status updated successfully',
      data: updatedPO[0],
    });
  } catch (error) {
    console.error('Update purchase order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update purchase order status',
    });
  }
};

export const createInventoryCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    const newCategory = await db.insert(inventoryCategories).values({
      name,
      description,
      parentCategoryId,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Inventory category created successfully',
      data: newCategory[0],
    });
  } catch (error) {
    console.error('Create inventory category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory category',
    });
  }
};

export const getInventoryCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db
      .select()
      .from(inventoryCategories)
      .orderBy(inventoryCategories.name);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get inventory categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve inventory categories',
    });
  }
};

export const getLowStockAlert = async (req: Request, res: Response) => {
  try {
    // Get items with stock below reorder level
    const lowStockItems = await db
      .select({
        item: inventoryItems,
        stock: inventoryStock,
      })
      .from(inventoryItems)
      .leftJoin(inventoryStock, eq(inventoryItems.id, inventoryStock.itemId))
      .where(sql`${inventoryStock.quantityInStock} <= ${inventoryItems.reorderLevel}`);

    res.json({
      success: true,
      data: lowStockItems,
      alert: lowStockItems.length > 0 ? `${lowStockItems.length} items are below reorder level` : null,
    });
  } catch (error) {
    console.error('Get low stock alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve low stock alerts',
    });
  }
};