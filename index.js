const app = require('express')();
let path = require('path');

let chat = new (require('events'))();

let index = {}; index.html = path.join(__dirname, 'index.html');

app.get('/', (req, res) =>
{
    if(typeof req.query.said === 'string' && typeof req.query.by === 'string')
    {
        chat.emit('someone-said-something', req.query.by, req.query.said);
        return res.send('');
    }
    else
    {
        return res.sendFile(index.html);
    }
});

app.get('/data', (req, res) =>
{
    res.header('Content-Type', 'text/event-stream');
    res.header('Cache-Control', 'no-cache');

    chat.on('someone-said-something', (by, said) =>
    {
        res.write(`data: ${JSON.stringify({ said: said, by : by })}\n\n`);
    });
});

const server = app.listen(process.env.PORT || '9001', () =>
{
    console.log('Server started listening on', server.address());
});