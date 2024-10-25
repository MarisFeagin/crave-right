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
    });
});