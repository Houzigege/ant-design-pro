let Express = require('express');
let favicon = require('serve-favicon');
let compression = require('compression');
let httpProxy = require('http-proxy');
let path = require('path');
let http = require('http');
let session = require('express-session');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let pages = require('./page');
// import pages = require './routes/page';



const app = new Express();
const server = new http.Server(app);
const proxy = httpProxy.createProxyServer({
  target: "http://localhost",
  changeOrigin:true,
  ws: true
});

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.png')));
app.use('/api', pages);
app.use('/proxy', (req, res) => {
  console.log("开始请求……")
  proxy.web(req, res);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false,limit:"10000kb"}));
app.use(cookieParser());
app.use(session({
  resave:false,
  saveUninitialized:true,
  secret: 'keyboard cat'
}));

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.png')));
app.use(Express.static(path.join(__dirname, '..', 'dist')));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});


proxy.on('error', (error, req, res) => {
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  let json = {error: 'proxy_error', reason: error.message};
  res.end(JSON.stringify(json));
});

server.listen(80, (err) => {
  if (err) {
    console.error(err);
  }
  console.error("服务启动");
});
