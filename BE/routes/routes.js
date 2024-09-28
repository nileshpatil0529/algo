import express from 'express';
import { getOptionChainData, getExpiryStrikeList } from '../controllers/optionChainController.js';
import { alertWebhook, getAlertData, getAlertIndicatorList } from '../controllers/alertController.js';

const router = express.Router();

// Option-Chain routes
router.post('/get-exp-strike', getExpiryStrikeList);
router.post('/get-option-chain-data', getOptionChainData);

// Alerts Route
router.post('/webhook', alertWebhook);
router.post('/get-alerts', getAlertData);
router.get('/get-alerts-list', getAlertIndicatorList);

export default router;
