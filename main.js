const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use( cors() );
app.use( bodyParser.json() );

let nutritionLabels = [
    {
        "productName": "Test Product",
        "servingSize": "1 cup",
        "nutrients": {
            "calories": 100
        }
    }
];


// Get All Labels
app.get('/api/labels', (req, res) => {
    res.json(nutritionLabels);
});

// Get Label by ID
app.get('/api/labels/:id', (req, res) => {
    const { id } = req.params; // Get the ID from the request parameters
    const label = nutritionLabels.find(label => label.id == id); // Find the label by ID

    if (label) {
        res.json(label); // Return the label if found
    } else {
        res.status(404).json({ message: 'Label not found' }); // Return 404 if not found
    }
});

// Add new label
app.post('/api/labels', (req, res) => {
    const newLabel = { id: Date.now().toString(), ...req.body }; // Ensure ID is a string
    nutritionLabels.push(newLabel);
    res.status(201).json(newLabel);
});

// Update existing label
app.put('/api/label/:id', (req, res) => {
    const { id } = req.params;
    const index = nutritionLabels.findIndex(label => label.id == id);
    if (index !== -1) {
        nutritionLabels[index] = { id: id, ...req.body }; // Keep the ID as it is
        res.json(nutritionLabels[index]);
    } else {
        res.status(404).json({ message: 'Label not found' });
    }
});

// Start Server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("hello",(req,res)=>res.send("hi there"))
