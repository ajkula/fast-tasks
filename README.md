# Fast Tasks
A fast answering API that passes payloads to a second process through IPC and answers [STATUS, [MESSAGE]] very quickly.

<pre>Usage: <b>yarn start</b> will start the two PM2 managed processes <b>API<b> and <b>SERVICES</b>.
<b>pm2 logs</b> will let you watch the feed from pm2.
to stop precisely this app's processes:
 - <b>pm2 stop API</b>
 - <b>pm2 stop Service</b>
<b>pm2 list</b> will list all active processes
<b>pm2 stop all</b> will stop all active process
</pre>

** Env variables management

<pre>Add a .env file in the root of the projectwith all needed env Vars as:
 - PG_HOST=yourhost
 - PG_USER=youruser
 - PG_PASSWORD=yourDBpassword
 - PG_DATABASE=yourDBname
 - PG_PORT=5432
</pre>

[swagger-ui API Doc](http://localhost:3500/api-docs)