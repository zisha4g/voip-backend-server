const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const voipmsClient = require('../src/VoipmsClient');
const logger = require('../src/Logger');
const db = require('../database/DatabaseManager');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SALT_ROUNDS = 10;

/**
 * Register new client
 * POST /api/auth/register
 * Body: { email, password }
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        logger.info('Registration attempt', { email });

        // Check if user already registered by email
        const existingUser = db.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Fetch all clients from VoIP.ms API
        const response = await voipmsClient.call('getClients', {});

        logger.info('VoIP.ms API response', { status: response.status });

        if (response.status !== 'success' || !response.clients || response.clients.length === 0) {
            logger.warning('Failed to fetch clients from VoIP.ms', { status: response.status });
            return res.status(503).json({
                success: false,
                error: 'Unable to verify with VoIP.ms system. Please try again later.'
            });
        }

        // Find client by email
        const client = response.clients.find(c => c.email.toLowerCase() === email.toLowerCase());

        if (!client) {
            logger.warning('Client email not found in VoIP.ms', { email });
            return res.status(404).json({
                success: false,
                error: 'Email not found in VoIP.ms system. Please contact support.'
            });
        }

        const client_id = client.client;
        const company = client.company || 'N/A';

        // Check if this client_id is already registered
        const existingClientUser = db.findUserByVoipmsId(client_id);
        if (existingClientUser) {
            return res.status(400).json({
                success: false,
                error: 'This VoIP.ms account is already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user in database
        const user = db.createUser(email, hashedPassword, client_id, company);

        logger.info('User registered successfully', { 
            email: user.email, 
            client_id: user.voipms_client_id 
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                voipms_client_id: user.voipms_client_id,
                company: user.company,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });

    } catch (error) {
        logger.error('Registration error', { error: error.message });
        next(error);
    }
});

/**
 * Login for clients
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        logger.info('Login attempt', { email });

        // Find user in database
        const user = db.findUserByEmail(email);

        if (!user) {
            logger.warning('Login failed - user not found', { email });
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            logger.warning('Login failed - account inactive', { email });
            return res.status(403).json({
                success: false,
                error: 'Account is inactive. Please contact support.'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            logger.warning('Login failed - invalid password', { email });
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                voipms_client_id: user.voipms_client_id,
                company: user.company,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info('Login successful', { email });

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                company: user.company,
                role: user.role
            }
        });

    } catch (error) {
        logger.error('Login error', { error: error.message });
        next(error);
    }
});

/**
 * Verify token
 * GET /api/auth/verify
 * Headers: Authorization: Bearer <token>
 */
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        res.json({
            success: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                company: decoded.company,
                role: decoded.role
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
});

/**
 * Get current user info (requires authentication)
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = db.findUserById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                company: user.company,
                voipms_client_id: user.voipms_client_id,
                role: user.role,
                status: user.status,
                created_at: user.created_at
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        next(error);
    }
});

/**
 * Logout (client-side should delete token)
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
