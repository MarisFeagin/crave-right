const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json())

app.listen(
    PORT,
    () => console.log(`It's alive on https://localhost:${PORT}`)
)

app.post('/menu-item/:id', (req, res) => {
    const { id } = req.params;
    const { logo } = req.body;

    if (!logo) {
        res.status(418).send({ message: 'Nutrition Information has not been sourced at this time.'})
    }

    // Where are you gonna get this information from? -  Moon
    res.send({
        id: `item with your ${logo} and ID of ${id}`,
        title: `${name}`,
        //set some stuff as dummy data as you should do that when you have yet to add the actual code
        nutrition: {
            serving: {
                number: 12,
                unit: "cups",
                servingSize: 2,
            },
            totalSize: 15
            // Amount per serving
            // Calories: ${calories}
            // (Listed in grams and onces)
            // Total Fat: ${fat}
            // Saturated Fat: ${satfat}
            // Trans Fat: ${transfat}
            // Cholesterol: ${cholest}
            // Sodium: ${sodium}
            // Total Carbohydrate: ${carbs}
            // Dietary Fiber: ${fiber}
            // Total Sugars: ${sugar}
            // Included Added Sugars: ${addsugar}
            // Protein: ${protein}
            // Vitamin D: ${vitD}
            // Calcium: ${calcium}
            // Iron: ${iron}
            // Potassium: ${potass}`,
        },
    });
});