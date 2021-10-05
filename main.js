require('dotenv').config();
const jsonServer = require('json-server');
const queryString = require('query-string');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  } else if (req.method === 'PATCH') {
    req.body.updatedAt = Date.now();
  }

  // Continue to JSON Server router
  next();
});

// Custom output for LIST with pagination
router.render = (req, res) => {
  // Check GET with pagination
  // If yes, custom output
  const headers = res.getHeaders();

  const totalCountHeader = headers['x-total-count'];
  if (req.method === 'GET' && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedUrl.query);

    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 10,
        _totalRows: Number.parseInt(totalCountHeader),
      },
    };

    return res.jsonp(result);
  }

  // Otherwise, keep default behavior
  res.jsonp(res.locals.data);
};

// Use default router
server.use('/api', router);

// Start server
const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log('JSON Server is running');
// });

// khi build nhớ chỉnh lại file .env
if(process.env.HTTPS_LOCAL === "true"){            
  const fs = require('fs');
  const https = require('https');
  const serverLocal = https.createServer({
    key: fs.readFileSync('./.cert/key.pem'),
    cert: fs.readFileSync('./.cert/cert.pem')        
  }, server);      
  serverLocal.listen(process.env.PORT || 5000);
  console.log('Listening on port local ' + PORT)

}else{
  server.listen(PORT, function() {
    console.log('Listening on port ' + PORT)
  })
}


