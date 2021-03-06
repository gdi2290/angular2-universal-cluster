import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

// Angular 2
import 'angular2-universal/polyfills';
import {
  provide,
  enableProdMode,
  expressEngine,
  REQUEST_URL,
  ORIGIN_URL,
  BASE_URL,
  NODE_ROUTER_PROVIDERS,
  NODE_HTTP_PROVIDERS,
  ExpressEngineConfig
} from 'angular2-universal';

// Application
import {App} from './app-universal/app.component';
import {Html} from './app-server/html.component';

const app = express();
const ROOT = path.join(path.resolve(__dirname, '..'));

enableProdMode();

// Express View
app.engine('.html', expressEngine);
app.set('views', __dirname);
app.set('view engine', 'html');

app.use(bodyParser.json());


function ngApp(req, res) {
  console.time('\nserializeApplication ' + process.pid);
  let baseUrl = '/';
  let url = req.originalUrl || '/';

  let config: ExpressEngineConfig = {
    directives: [ Html ],
    platformProviders: [
      provide(ORIGIN_URL, {useValue: 'http://localhost:3000'}),
      provide(BASE_URL, {useValue: baseUrl}),
    ],
    providers: [
      provide(REQUEST_URL, {useValue: url}),
      NODE_ROUTER_PROVIDERS,
      NODE_HTTP_PROVIDERS,
    ],
    async: true,
    ngOnRendered: (rendered) => {
      console.timeEnd('\nserializeApplication ' + + process.pid);
      return rendered;
    },
    preboot: false // { appRoot: 'app' } // your top level app component selector
  };

  res.render('index', config);
}

// Serve static files
app.use(express.static(ROOT, {index: false}));

// Our API for demos only
app.get('/data.json', (req, res) => {
  res.json({
    data: 'fake data'
  });
});

// Routes with html5pushstate
app.use('/', ngApp);
app.use('/about', ngApp);
app.use('/home', ngApp);


// Server
app.listen(3000, () => {
  console.log('Process ' + process.pid + ' Listen on http://localhost:3000');
});
