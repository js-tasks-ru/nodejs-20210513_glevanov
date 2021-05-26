const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'DELETE':
        const pathnameLength = pathname.split(path.sep).length;
        if (pathnameLength > 1) {
          res.statusCode = 400;
          res.end();
          break;
        }
        fs.access(filepath, fs.F_OK, (err) => {
          if (err) {
            res.statusCode = 404;
            res.end();
            return;
          }
          fs.unlink(filepath, () => res.end());
        });
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end();
  }
});

module.exports = server;
