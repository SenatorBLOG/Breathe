// server.js — HTTP entrypoint. All app wiring lives in app.js so tests can
// import the Express app without binding a port.
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
