const app = require('express', '.../data.js')();

const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`It's alive on https://localhost:${PORT}`)
)