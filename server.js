const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

const port = process.env.PORT || 8080; // ✅ Uses 8080 if Azure sets it

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });
});
