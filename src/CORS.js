const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
