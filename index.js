const app        = require('express')();
const xssFilters = require('xss-filters');

let chat = new (require('events'))();

let index = {}; index.html = require('path').join(__dirname, 'index.html');

global.max_emit = 0; // TOFIX: can run out if server runs too long with too many user
global.num_of_current_user = 0;

chat.on('someone-said-something', (by, said) =>
{
    global.num_of_current_user = 0;

    for(let i = 1; i <= global.max_emit; ++i) chat.emit(String(i), by, said);

    console.info('Current number of user:', global.num_of_current_user);
});

app.get('/', (req, res) =>
{
    if(typeof req.query.said === 'string' && typeof req.query.by === 'string')
    {
        if(req.query.said.length && req.query.by.length)
        {
            chat.emit
            (
                'someone-said-something',
                xssFilters.inHTMLData(req.query.by.trim()),
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
        ++global.num_of_current_user;
        res.write(`data: ${JSON.stringify({ said: said, by : by })}\n\n`);
    }

    chat.on(event_name, event_listener);
    res.on('close', () => chat.removeListener(event_name, event_listener));
});

const server = app.listen(process.env.PORT || '9001', () =>
{
    console.log('Server started listening on', server.address());
});