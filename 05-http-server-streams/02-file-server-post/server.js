const url = require('url');
const http = require('http');
const path = require('path');
const fsPromises = require('fs/promises');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'POST':
        const pathnameLength = pathname.split(path.sep).length;
        if (pathnameLength > 1) {
          res.statusCode = 400;
          res.end();
          break;
        }
        if (!req.body) {
          res.statusCode = 409;
          res.end();
          break;
        }

        fsPromises.open(filepath, 'wx')
            .then((file) => {
              //
            })
            .catch((e) => {
              if (e.code === 'EEXIST') {
                res.statusCode = 409;
                res.end();
              } else {
                throw e;
              }
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
