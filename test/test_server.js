const Express = require('express');

const Port = 8080;
const app = Express();

app.get('/', (req, res) => res.send('You are awesome!'));
app.listen(Port, () => console.log('Listening on port: ' + Port));