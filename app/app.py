from flask import Flask
from redis import Redis, RedisError
import os
import socket

# Connect to Redis
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)

app = Flask(__name__)

@app.route("/")
def hello():
    html = "<h3>Hello, there {name}!</h3>\n" \
           "from <b>{hostname}</b><br/>\n" \
    return html.format(name=os.getenv("NAME", "world"), hostname=socket.gethostname()s)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
