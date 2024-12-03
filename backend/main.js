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
            // NO!!!!! dont write your css here - Moon
            // [Insert THICC line here css or something]
            // Amount per serving
            // Calories: ${calories}
            // [Insert line here css or something]
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
            // NO!!!!! dont write your css here - Moon
            // [Insert THICC line here css or something]
            // Vitamin D: ${vitD}
            // Calcium: ${calcium}
            // Iron: ${iron}
            // Potassium: ${potass}`,
        },
        //    Show this at the bottom of the html page not requests, it doesnt belong here noone is going to see this here - Moon
        'Disclaimer': `Crave Right does not claim to recommend diets nor nutrition advice to any of our users. We only arm you with the knowledge of a food's value and numbers. Please meet with a lincesed dietian and/or nutritionist for your individual comsumption needs. Everyone will require a different plan. Please consume responsibly!`
    });
});