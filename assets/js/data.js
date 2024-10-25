const express = require('express')();
const app = express();
const PORT = 8080;

app.use( express.json() )

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

    res.send({
        id: `item with your ${logo} and ID of ${id}`,

        'title': `${name}`,
        'Nutrition': `${servingnumber} per ${type}
           Serving Size: ${servsize}
           Total Size: ${totalsize}
           [Insert THICC line here css or something]
           Amount per serving
           Calories: ${calories}
           [Insert line here css or something]
           (Listed in grams and onces)
           Total Fat: ${fat}
             Saturated Fat: ${satfat}
             Trans Fat: ${transfat}
           Cholesterol: ${cholest}
           Sodium: ${sodium}
           Total Carbohydrate: ${carbs}
             Dietary Fiber: ${fiber}
             Total Sugars: ${sugar}
               Included Added Sugars: ${addsugar}
           Protein: ${protein}
           [Insert THICC line here css or something]
           Vitamin D: ${vitD}
           Calcium: ${calcium}
           Iron: ${iron}
           Potassium: ${potass}`,
        'Disclaimer': `Crave Right does not claim to recommend diets nor nutrition advice to any of our users. We only arm you with the knowledge of a food's value and numbers. Please meet with a lincesed dietian and/or nutritionist for your individual comsumption needs. Everyone will require a different plan. Please consume responsibly!`
    });
});