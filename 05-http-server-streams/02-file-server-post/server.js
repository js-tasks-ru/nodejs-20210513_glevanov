const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

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

        const limitStream = new LimitSizeStream({limit: 1000000});
        const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

        writeStream.on('finish', () => {
          res.statusCode = 201;
          res.end();
        });

        req
            .pipe(limitStream)
            .on('error', () => {
              res.statusCode = 413;
              fs.unlink(filepath, () => res.end());
            })
            .pipe(writeStream)
            .on('error', (e) => {
              if (e.code === 'EEXIST') {
                res.statusCode = 409;
                res.end();
              } else {
                throw e;
              }
            });

        req.on('aborted', () => {
          writeStream.destroy();
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
