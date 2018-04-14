const html =
`<!doctype html>
<head>
    <meta charset='UTF-8'>
    <title>Chat</title>
</head>
<body>
    <input type='text' id='by' placeholder='Choose nick, press enter' />
    <p
        id='u_r'
        style='position: absolute; top : 0; right: 0.5%;'
        title='# of people who recieved the last non-empty message (including you)' >
    </p>
    <div id='chat' style='display: none'>
        <span id='nick'></span>:&nbsp;
        <input type='text' id='said' placeholder='type something, press enter'/>
        <div id='room'></div>
    </div>
    <script>
    "use strict";
    var u_r = document.getElementById("u_r"),
    room = document.getElementById("room"),
    said = document.getElementById("said"),
    by = document.getElementById("by"),
    nick = document.getElementById("nick"),
    chat = document.getElementById("chat"),
    xhr = new XMLHttpRequest();
    function formatParams(a) {
    return (
        "?" +
        Object.keys(a)
        .map(function(c) {
            return c + "=" + encodeURIComponent(a[c]);
        })
        .join("&")
    );
    }
    said.addEventListener("keypress", function(a) {
    if (13 === a.keyCode)
        return (
        xhr.open(
            "GET",
            "/" + formatParams({ by: by.value || "anon", said: said.value }),
            !0
        ),
        xhr.send(),
        (said.value = ""),
        !0
        );
    }),
    by.addEventListener("keyup", function(a) {
        13 === a.keyCode &&
        (by.setAttribute("disabled", "true"),
        by.setAttribute("type", "hidden"),
        (nick.innerHTML =
            (10 > by.value.trim().length
            ? by.value
                .trim()
                .replace(/</g, "\u1438")
                .replace(/>/g, "\u1433")
            : by.value
                .trim()
                .substring(0, 10)
                .replace(/</g, "\u1438")
                .replace(/>/g, "\u1433")) || "anon"),
        chat.removeAttribute("style"));
    }),
    (new EventSource("data").onmessage = function(a) {
        var c = JSON.parse(a.data),
        d = document.createElement("b");
        d.innerHTML = c.by;
        var e = document.createElement("p");
        e.setAttribute("title", new Date().toLocaleString());
        var f = document.createTextNode(": " + c.said);
        e.appendChild(d),
        e.appendChild(f),
        room.insertBefore(e, room.firstChild),
        (u_r.innerHTML = c.users_recieving);
    });
    </script>
</body>
`;

const chat = new (require('events'))();
const URL  = require('url').URL;


global.max_emit = 0;

chat.on('someone-said-something', (by, said) =>
{
    for(let i = 1; i <= global.max_emit; ++i) chat.emit(String(i), by, said);
});

require('http').createServer((req, res) =>
{
    if(req.method !== 'GET')
    {
        res.statusCode = 404;

        res.setHeader('Content-Length', Buffer.byteLength('404 PAGE NOT FOUND'));
        res.setHeader('Content-Type', 'text/plain');

        res.write('404 PAGE NOT FOUND');
        res.end();
    }
    else if(req.url.match(/\/\?by=.+&said=.+/) !== null)
    {
        let said = new URL('http://www.example.com'+req.url.trim())
                .searchParams.get('said');
        let by   = new URL('http://www.example.com'+req.url.trim())
                .searchParams.get('by');

        if
        (
            typeof said === 'string' && said.length &&
            typeof by   === 'string' && by.length
        )
        {
            chat.emit
            (
                'someone-said-something',
                (by.length < 10 ? by : by.substring(0, 10))
                    .replace(/</g, 'ᐸ')
                    .replace(/>/g, 'ᐳ'),
                said
                    .replace(/</g, 'ᐸ')
                    .replace(/>/g, 'ᐳ')
            );
        }
        else
        {
            res.statusCode = 400;
        }

        res.end();
    }
    else if(req.url === '/data')
    {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Cache-Control', 'no-cache');

        let event_name = String(++global.max_emit);

        let event_listener = (by, said) =>
        {
            res.write
            (
                `data: ${
                JSON.stringify
                (
                    {
                        said : said,
                        by : by,
                        users_recieving : chat.eventNames().length-1
                    }
                )}\n\n`
            );
        }

        chat.on(event_name, event_listener);
        res.on('close', () => chat.removeListener(event_name, event_listener));
    }
    else if(req.url === '/')
    {
        res.statusCode = 200;

        res.setHeader('Content-Length', Buffer.byteLength(html));
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Connection', 'close');

        res.write(html);
        res.end();
    }
    else
    {
        res.statusCode = 404;

        res.setHeader('Content-Length', Buffer.byteLength('404 PAGE NOT FOUND'));
        res.setHeader('Content-Type', 'text/plain');

        res.write('404 PAGE NOT FOUND');
        res.end();
    }
})
.listen(process.env.PORT || '9001', () =>
{
    console.log
    (
        'Server started listening on',
        process.env.PORT ? process.env.PORT : '9001'
    );
});


/*
        let u_r = document.getElementById('u_r');
        let room = document.getElementById('room');
        let said = document.getElementById('said');
        let by = document.getElementById('by');
        let nick = document.getElementById('nick');
        let chat = document.getElementById('chat');
        let xhr = new XMLHttpRequest();

        function formatParams( params )
        {
            // https://stackoverflow.com/a/31713191
            return "?" + Object
                .keys(params)
                .map(function(key)
                {
                    return key+"="+encodeURIComponent(params[key])
                })
                .join("&")
        }

        said.addEventListener('keypress', (event) =>
        {
            if(event.keyCode === 13)
            {
                xhr.open
                (
                    'GET',
                    '/' + formatParams({ by : by.value || 'anon', said: said.value}),
                    true
                );
                xhr.send();
                said.value = '';
                return true;
            }
        });

        by.addEventListener('keyup', (event) =>
        {
            if(event.keyCode === 13)
            {
                by.setAttribute('disabled', 'true');
                by.setAttribute('type', 'hidden');
                nick.innerHTML =
                (
                    by.value.trim().length < 10 ?
                        by.value.trim()
                            .replace(/</g, 'ᐸ')
                            .replace(/>/g, 'ᐳ')
                        :
                        by.value.trim().substring(0, 10)
                            .replace(/</g, 'ᐸ')
                            .replace(/>/g, 'ᐳ')
                ) || 'anon';
                chat.removeAttribute('style');
            }
        });

        (new EventSource('data')).onmessage = function(event)
        {
            let data = JSON.parse(event.data);
            let b = document.createElement('b');
            b.innerHTML = data.by;
            let p = document.createElement('p');
            p.setAttribute('title', new Date().toLocaleString());
            let t = document.createTextNode(': ' + data.said);
            p.appendChild(b);
            p.appendChild(t);
            room.insertBefore(p, room.firstChild);
            u_r.innerHTML = data.users_recieving;
        };
 */