const express = require('express');
const { getBalance, getCategories, test, purchaseProduct, purchaseAirtime, checkTransactionStatus, getDataPlans, purchaseData, getTVBouquet, verifyTVSC, purchaseTV } = require('../controllers/apiController');
const router = express.Router();

router.post('/purchase-airtime', purchaseAirtime);

router.get('/data-plans/:network', getDataPlans);
router.post('/purchase-data', purchaseData);

router.get('/tv-bouquet/:provider', getTVBouquet);
router.post('/verify-tv', verifyTVSC);
router.post('/purchase-tv', purchaseTV);

router.post('/transaction-status', checkTransactionStatus);

module.exports = router;
