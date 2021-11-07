import * as https from "https";
import express from 'express';
import proxy, {fixRequestBody} from 'http-proxy-middleware';
import path from 'path';
import fs from 'fs';

const app = express();
const herokuBackendUrl = 'https://family-pocket--backend.herokuapp.com';
const rootPath = path.resolve();
const appName = 'family-pocket--backend';

app.use('/api', proxy.createProxyMiddleware({
  target: herokuBackendUrl,
  changeOrigin: true,
  secure: true,
  withCredentials: true,
  onProxyReq: fixRequestBody
  // pathRewrite: {
  //   "^/api/": ""
  // }
}));

app.use(express.static(rootPath + '/dist/' + appName));

// app.get('*', function (req, res, next) {
//   if (req.headers['x-forwarded-proto'] !== 'https')
//     res.redirect(herokuBackendUrl + req.url)
//   else
//     next()
// })

app.get('/*', function (req, res) {
  const fullPath = path.join(rootPath + '/dist/' + appName + '/index.html');
  res.sendFile(fullPath);
})


// for local run ---------------------------------------------

// const options = {
//   key: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/ivan4usa_2021_key.key'),
//   cert: fs.readFileSync(rootPath + '/dist/' + appName + '/assets/ssl/ivan4usa_2021_key.cer')
// };
// const appServer = https.createServer(options, app);
//
//
// const port = process.env.PORT || 3001;
//
// appServer.listen(port, () => console.log(`App running on: https://localhost:${port}`));

// for heroku run ---------------------------------------------

const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});
