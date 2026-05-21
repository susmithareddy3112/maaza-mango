const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Get all orders
app.get('/api/orders', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(data);
});

// Submit a new order
app.post('/api/orders', (req, res) => {
    const { type, qty, name } = req.body;
    
    if (!type || !qty || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        qty,
        name,
        timestamp: new Date().toISOString()
    };

    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    data.push(order);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

    res.json(order);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
