const express = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use( cors() );
app.use( bodyParser.json() );

let nutritionLabels = [

];

// 'Disclaimer': `Crave Right does not claim to recommend diets nor nutrition advice to any of our users. We only arm you with the knowledge of a food's value and numbers. Please meet with a lincesed dietian and/or nutritionist for your individual comsumption needs. Everyone will require a different plan. Please consume responsibly!`

// Get Labels
app.get('/api/labels', (req, res) => {
    res.json(nutritionLabels);
});

// Add new label
app.post('/api/labels', (req, res) => {
    const newLabel = { id: Date.now(), ...req.body };
    nutritionLabels.push(newLabel);
    res.status(201).json(newLabel);
});

// Update existing label
app.put('/api/label/:id', (req, res) => {
    const { id } = req.params;
    const index = nutritionLabels.findIndex(label => label.id == id);
    if (index !== -1) {
        nutritionLabels[index] = { id: parseInt(id), ...req.body };
        res.json(nutritionLabels[index]);
    } else {
        res.status(404).json({ message: 'Label not found' });
    }
});

// Start Server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
