require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes/api');

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({
        status: true,
        message: "You probably shouldn't be here, but...",
        data: {
            service: "wavepay-api",
            version: "1.x"
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
