const express = require('express');
const { register } = require('../controllers/authController');
const { validateRegister } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegister, register);

module.exports = router;
