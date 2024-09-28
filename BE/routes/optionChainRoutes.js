import express from 'express';
import { getData, getAlertData, getExpiryStrike, getAlertIndicatorList, geyTDalert } from '../controllers/optionChainController.js';

const router = express.Router();

router.post('/get-data', getData);
router.post('/get-alerts', getAlertData);
router.get('/get-alerts-list', getAlertIndicatorList);
router.post('/get-exp-strike', getExpiryStrike);
router.post('/webhook', geyTDalert);

export default router;
