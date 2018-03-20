const app        = require('express')();
const xssFilters = require('xss-filters');

let chat = new (require('events'))();

let index = {}; index.html = require('path').join(__dirname, 'index.html');

global.max_emit = 0; // TOFIX: can run out if server runs too long with too many user

chat.on('someone-said-something', (by, said) =>
{
    for(let i = 1; i <= global.max_emit; ++i) chat.emit(String(i), by, said);
});

app.get('/', (req, res) =>
{
    if(typeof req.query.said === 'string' && typeof req.query.by === 'string')
    {
        req.query.said = req.query.said.trim();
        req.query.by = req.query.by.trim();

        if(req.query.said.length && req.query.by.length)
        {
            chat.emit
            (
                'someone-said-something',
                xssFilters.inHTMLData
                (
                    req.query.by.length < 10 ?
                        req.query.by :
                        req.query.by.substring(0, 10)
                ),
                xssFilters.inHTMLData(req.query.said.trim())
            );
        }

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

    let event_listener = (by, said) =>
    {
        res.write
        (
            `data: ${
            JSON.stringify
            (
                {
                    said: said,
                    by : by,
                    users_recieving : chat.eventNames().length-1
                }
            )}\n\n`
        );
    }

    chat.on(event_name, event_listener);
    res.on('close', () => chat.removeListener(event_name, event_listener));
});

const server = app.listen(process.env.PORT || '9001', () =>
{
    console.log('Server started listening on', server.address());
});