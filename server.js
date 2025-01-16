const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const urlRoutes = require('./routes/urlRoutes')
const path = require("path");



const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/',urlRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// export for tests
module.exports = app;