'use strict';

const express = require('express');
const authRouter = require('./authRouter');
const todoRouter = require('./todoRouter');
const categoryRouter = require('./categoryRouter');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/todos', todoRouter);
router.use('/categories', categoryRouter);

module.exports = { router };
