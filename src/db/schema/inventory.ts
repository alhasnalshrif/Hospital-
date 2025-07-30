import { pgTable, text, timestamp, uuid, integer, boolean, decimal, json } from 'drizzle-orm/pg-core';

// Inventory Management
export const inventoryCategories = pgTable('inventory_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  parentCategoryId: uuid('parent_category_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemCode: text('item_code').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => inventoryCategories.id),
  unit: text('unit').notNull(), // 'pieces', 'boxes', 'bottles', 'kg', etc.
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  reorderLevel: integer('reorder_level').default(10),
  maxStockLevel: integer('max_stock_level'),
  supplier: text('supplier'),
  supplierContactInfo: json('supplier_contact_info'),
  isActive: boolean('is_active').default(true),
  requiresPrescription: boolean('requires_prescription').default(false),
  expiryTracking: boolean('expiry_tracking').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryStock = pgTable('inventory_stock', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').references(() => inventoryItems.id).notNull(),
  batchNumber: text('batch_number'),
  quantityInStock: integer('quantity_in_stock').notNull().default(0),
  reservedQuantity: integer('reserved_quantity').default(0),
  availableQuantity: integer('available_quantity').notNull().default(0),
  expiryDate: timestamp('expiry_date'),
  locationCode: text('location_code'), // Storage location
  lastStockCheck: timestamp('last_stock_check'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').references(() => inventoryItems.id).notNull(),
  movementType: text('movement_type').notNull(), // 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'
  quantity: integer('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  reference: text('reference'), // PO number, requisition number, etc.
  reason: text('reason'),
  fromLocation: text('from_location'),
  toLocation: text('to_location'),
  performedBy: uuid('performed_by'),
  approvedBy: uuid('approved_by'),
  movementDate: timestamp('movement_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Purchase Orders
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  poNumber: text('po_number').unique().notNull(),
  supplier: text('supplier').notNull(),
  supplierContactInfo: json('supplier_contact_info'),
  orderDate: timestamp('order_date').defaultNow(),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  status: text('status').default('pending'), // 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }),
  finalAmount: decimal('final_amount', { precision: 12, scale: 2 }),
  requestedBy: uuid('requested_by'),
  approvedBy: uuid('approved_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  poId: uuid('po_id').references(() => purchaseOrders.id).notNull(),
  itemId: uuid('item_id').references(() => inventoryItems.id).notNull(),
  quantityOrdered: integer('quantity_ordered').notNull(),
  quantityReceived: integer('quantity_received').default(0),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  specifications: text('specifications'),
  createdAt: timestamp('created_at').defaultNow(),
});