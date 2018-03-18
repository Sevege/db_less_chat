const app = require('express')();
let path = require('path');

let chat = new (require('events'))();

let index = {}; index.html = path.join(__dirname, 'index.html');

global.max_emit = 0;
// TODO: use db/hashmap or something similar where closed
// connections can be easily removed

chat.on('someone-said-something', (by, said) =>
{
    console.log(global.max_emit);
    for(let i = 1; i <= global.max_emit; ++i)
    {
        chat.emit(String(i), by, said);
    }
});

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

    let event_name = String(++global.max_emit);
    chat.on(event_name, (by, said) =>
    {
        res.write(`data: ${JSON.stringify({ said: said, by : by })}\n\n`);
    });

    // TOFIX: event listener not being removed
    res.on('finish', () =>
    {
        chat.removeListener(event_name, (by, said) =>
        {
            res.write(`data: ${JSON.stringify({ said: said, by : by })}\n\n`);
        });
    });
});

const server = app.listen(process.env.PORT || '9001', () =>
{
    console.log('Server started listening on', server.address());
});