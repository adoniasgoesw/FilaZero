// server/routes/AuthRoutes.js
import express from 'express';
import { login } from '../controllers/login.js';

const router = express.Router();

// Rota de login
router.post('/login', login);

export default router;
