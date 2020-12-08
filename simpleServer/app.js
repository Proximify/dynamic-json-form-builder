const formRouter = require('./server/formRoutes');
const fileRouter = require('./server/fileRoutes');
const bodyParser = require('body-parser');
const config = require('./server/config');
const express = require('express');
const cors = require('cors');

const app = express();
const router = express.Router();
app.use('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/form', formRouter);
app.use('/file', fileRouter);

router.all('*', (req, res) => {
    console.log('Generic action');
    res.status(200).json({
        status: 'success'
    });
});
app.use('/', router);

app.listen(config.node_port, function () {
    console.log('Server Started! Listening at 127.0.0.1:' + config.node_port);
});
