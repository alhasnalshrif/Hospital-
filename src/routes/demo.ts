import { Router } from 'express';
import { demoLogin, demoRegister, demoPatients, demoServiceCharges } from '../controllers/demo';
import { validateRequest } from '../middleware/validation';
import { authValidation } from '../utils/validation';

const router = Router();

// Demo authentication routes
router.post('/login', validateRequest(authValidation.login), demoLogin);
router.post('/register', validateRequest(authValidation.register), demoRegister);

// Demo data routes
router.get('/patients', demoPatients);
router.get('/service-charges', demoServiceCharges);

export default router;