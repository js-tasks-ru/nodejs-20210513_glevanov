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
          res.end('Nested paths not allowed');
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
            .on('error', (e) => {
              fs.unlink(filepath, () => {});
              res.statusCode = 413;
              res.end('File size limit reached (max 1MB)');
            })
            .pipe(writeStream)
            .on('error', (e) => {
              if (e.code === 'EEXIST') {
                res.statusCode = 409;
                res.end('File already exists');
              } else {
                throw e;
              }
            });

        req.on('aborted', () => {
          fs.unlink(filepath, () => {});
          writeStream.destroy();
          res.end('Aborted by client');
        });
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

module.exports = server;
