import { Router } from 'express';
import {
  createInventoryItem,
  getInventoryItems,
  updateStock,
  getStockMovements,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus,
  createInventoryCategory,
  getInventoryCategories,
  getLowStockAlert,
} from '../controllers/inventory';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// All inventory routes require authentication
router.use(requireAuth);

// Inventory Items
router.post('/items', requirePermission('inventory', 'create'), createInventoryItem);
router.get('/items', requirePermission('inventory', 'read'), getInventoryItems);

// Stock Management
router.put('/items/:itemId/stock', requirePermission('inventory', 'update'), updateStock);
router.get('/items/:itemId/movements', requirePermission('inventory', 'read'), getStockMovements);

// Purchase Orders
router.post('/purchase-orders', requirePermission('inventory', 'create'), createPurchaseOrder);
router.get('/purchase-orders', requirePermission('inventory', 'read'), getPurchaseOrders);
router.put('/purchase-orders/:poId/status', requirePermission('inventory', 'update'), updatePurchaseOrderStatus);

// Categories
router.post('/categories', requirePermission('inventory', 'create'), createInventoryCategory);
router.get('/categories', requirePermission('inventory', 'read'), getInventoryCategories);

// Alerts and Reports
router.get('/alerts/low-stock', requirePermission('inventory', 'read'), getLowStockAlert);

export default router;