const axios = require('axios');
const { generateRequestId } = require('../utils/helpers');

const VT_API_URL = process.env.VT_API_URL;
const API_KEY = process.env.API_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const headers = {
    'api-key': API_KEY,
    'public-key': PUBLIC_KEY
};

const serviceId = {
    "mtn": "mtn-data",
    "airtel": "airtel-data",
    "glo": "glo-data",
    "glo-sme": "glo-sme-data",
    "etisalat": "etisalat-data",
    "etisalat-sme": "9mobile-sme-data"
};

const cableServiceId = {
    "dstv": "dstv"
};

const connectToApi = async (url, errorMessage) => {
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        return {
            error: errorMessage,
            status_code: error.response ? error.response.status : 500,
            message: error.message
        };
    }
};

const getBalance = async (req, res) => {
    const result = await connectToApi(process.env.VT_SANDBOX_URL_BALANCE, "Failed to retrieve Balance");
    res.json(result);
};

const getCategories = async (req, res) => {
    const result = await connectToApi(process.env.VT_SANDBOX_URL_CATEGORIES, "Failed to retrieve Categories");
    res.json(result);
};

const purchaseProduct2 = async (req, res) => {
    const { phone, amount, serviceId } = req.body;
    
    if (!phone || !amount || !serviceId) {
        return res.status(400).json({ error: "Phone, amount, and serviceId are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: serviceId,
        amount,
        phone
    };

    try {
        const response = await axios.post(`${VT_API_URL}/pay`, payload, { headers });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Could not make purchase", message: error.message });
    }
};

const checkTransactionStatus2 = async (req, res) => {
    const { request_id } = req.body;

    if (!request_id) {
        return res.status(400).json({ error: "Request ID is required" });
    }

    const payload = { request_id };

    try {
        const response = await axios.post(`${VT_API_URL}/requery`, payload, { headers });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Could not query status", message: error.message });
    }
};


const purchaseProduct = async (phone, serviceId, variationCode) => {
    if (!phone || !variationCode || !serviceId) {
        return res.status(400).json({ error: "Phone, variation code, and serviceId are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: serviceId,
        variationCode,
        phone
    };

    try {
        const response = await axios.post(process.env.VT_SANDBOX_URL_PURCHASE, payload, { headers });
        return response.data;
    } catch (error) {
        return { error: "Could not make purchase", message: error.message };
    }
};

const checkTransactionStatus = async (req, res) => {
    const { request_id } = req.body;

    if (!request_id) {
        return res.status(400).json({ error: "Request ID is required" });
    }

    const payload = { request_id };

    try {
        const response = await axios.post(process.env.VT_SANDBOX_URL_PURCHASE_DATA_STATUS, payload, { headers });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Could not query status", message: error.message });
    }
};

const purchaseAirtime = async (req, res) => {
    const { phone, amount, network } = req.body;

    if (!phone || !amount || !network) {
        return res.status(400).json({ error: "Phone number, amount, and network are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: network,
        amount: amount,
        phone: phone
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_URL_PURCHASE,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};


const getDataPlans = async(req, res) => {
    const network = req.params.network;

    if (!serviceId[network]) {
        return res.status(400).json({ status: false, error: "Invalid network" });
    }

    const url = process.env.VT_SANDBOX_URL_VARIATION_CODE + serviceId[network];

    try {
        const response = await axios.get(url, { headers });
        if (response.status !== 200) {
            return res.status(response.status).json({ status: false, error: `Failed to fetch data. Status code: ${response.status}` });
        }
        const data = { data: response.data.content.varations, status: true };
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
}

const purchaseData = async (req, res) => {
    const { phone, serviceId, variationCode } = req.body;

    if (!phone || !variationCode || !serviceId) {
        return res.status(400).json({ error: "Phone number, service ID, and variation code are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: serviceId,
        variation_code: variationCode,
        phone: phone
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_URL_PURCHASE,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};


const getTVBouquet = async (req, res) => {

    const provider = req.params.provider;

    if (!provider) {
        return res.status(400).json({ status: false, error: "Invalid TV provider" });
    }

    const url = process.env.VT_SANDBOX_URL_CABLE_VARIATION_CODE + provider;

    try {
        const response = await axios.get(url, { headers });
        if (response.status !== 200) {
            return res.status(response.status).json({ status: false, error: `Failed to fetch bouquet plans. Status code: ${response.status}` });
        }
        const data = { data: response.data.content.varations, status: true };
        res.json(data);
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const verifyTVSC = async (req, res) => {
    const { smartcardNumber, provider } = req.body;

    if (!smartcardNumber || !provider) {
        return res.status(400).json({ error: "Smart card number and provider are required" });
    }

    const payload = {
        serviceID: provider,
        billersCode: smartcardNumber
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_VERIFY_MERCHANT,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};

const purchaseTV = async (req, res) => {
    const { smartcardNumber, provider, phone, tvPlan } = req.body;

    if (!smartcardNumber || !provider || !phone || !tvPlan) {
        return res.status(400).json({ error: "Smart card number, tv plan, phone number and provider are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: provider,
        billersCode: smartcardNumber,
        variation_code: tvPlan,
        phone: phone
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_URL_PURCHASE,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};

const electricityProviders = async (req, res) => {

    const providers = ["jos-electric", "eko-electric", "portharcourt-electric"];

    
    const data = { data: providers, status: true };
    res.json(data);
};

const verifyMeter = async (req, res) => {
    const { meterNumber, provider } = req.body;

    if (!meterNumber || !provider) {
        return res.status(400).json({ error: "Meter number and provider are required" });
    }

    const payload = {
        serviceID: provider,
        billersCode: meterNumber,
        type: "prepaid"
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_VERIFY_MERCHANT,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};

const buyPower = async (req, res) => {
    const { meterNumber, provider, phone, amount } = req.body;

    if (!meterNumber || !provider || !phone || !amount) {
        return res.status(400).json({ error: "Meter number, amount, phone number and provider are required" });
    }

    const payload = {
        request_id: generateRequestId(),
        serviceID: provider,
        billersCode: meterNumber,
        variation_code: "prepaid",
        phone: phone,
        amount: amount
    };

    const headers = {
        'api-key': process.env.API_KEY,
        'secret-key': process.env.SECRET_KEY,
        'Content-Type': 'application/json'
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.VT_SANDBOX_URL_PURCHASE,
        headers: headers,
        data: JSON.stringify(payload)
    };

    try {
        const response = await axios.request(config);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Could not connect to the API endpoint",
            error: error.message
        });
    }
};

module.exports = {
    getBalance,
    getCategories,
    purchaseProduct,
    checkTransactionStatus,
    purchaseAirtime,
    getDataPlans,
    purchaseData,
    getTVBouquet,
    verifyTVSC,
    purchaseTV,
    electricityProviders,
    verifyMeter,
    buyPower
};
