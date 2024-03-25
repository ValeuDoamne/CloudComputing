from flask import Flask, Response
from flask import render_template, jsonify
from flask import request
import json
import requests

app = Flask(__name__, static_folder='./templates/static/')

def make_key_pretty(key: str) -> str:
    return key[0].upper() + key[1:]

# Create a rebers proxy at the /api and send back the response from the API
@app.route('/api', methods=["GET", "POST", "DELETE", "PUT"])
@app.route('/api/<path:path>', methods=["GET", "POST", "DELETE", "PUT"])
def redirect_to_API_HOST(path):
    res = requests.request(
        method          = request.method,
        url             = 'http://backend:8000/'+path,
        headers         = {k:v for k,v in request.headers if k.lower() != 'host'}, # exclude 'host' header
        data            = request.get_data(),
        cookies         = request.cookies,
        allow_redirects = False,
    )
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'] 
    headers = [
        (k,v) for k,v in res.raw.headers.items()
        if k.lower() not in excluded_headers
    ]
    #endregion exlcude some keys in :res response

    response = Response(res.content, res.status_code, headers)
    return response

# Serving of the pages to the client
@app.route("/")
def index():
    stats = requests.get("http://backend:8000/v1/stats")
    data = stats.json()
    if stats.ok:
        new_dict = {}
        for key in data:
            new_dict[make_key_pretty(key)] = data[key]
        return render_template('index.html', stats=new_dict)
    else:
        return render_template('index.html', stats=0)

@app.route("/register", methods=["GET"])
def register():
    return render_template('register.html')

@app.route("/login", methods=["GET"])
def login():
    return render_template('login.html')

@app.route("/dashboard", methods=["GET"])
def dashboard():
    actions = {"Asteroids", "Spaceprobes", "Astronauts", "Stations"}
    return render_template('dashboard.html', actions=actions)

@app.route("/spaceprobes", methods=["GET"])
def spaceprobes():
    return render_template('spaceprobes.html')

@app.route("/asteroids", methods=["GET"])
def asteroids():
    return render_template('asteroids.html')

@app.route("/astrounauts", methods=["GET"])
def astronauts():
    return render_template('astronauts.html')

@app.route("/stations", methods=["GET"])
def stations():
    return render_template('stations.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)
