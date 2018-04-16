# Use case

You need some simple and quick chat application setup to chat among known
people or demographic for some limited time. You can simply deploy this and
share the url. This uses HTML5 Server-Sent Events.

# "Features"

+ No database
    + No check for unique username
        + Max of 10 character of username will be used
    + No history before connection started
    + No signup/login
    + No logging/no data are saved anywhere
+ Inputs are XSS sanitizatized before pushing to user
+ After any messages are sent/received, top right shows number of user
  receiving that message
+ Code is easy to look over
+ 0 dependency
