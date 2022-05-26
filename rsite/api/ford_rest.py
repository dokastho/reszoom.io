"""REST Api route for the dummy rest api, until I can use the real thing."""

import  random
import flask
import rsite

@rsite.app.route('/api/v1/ford/', methods=['POST'])
def echo():
    """Return the message posted to the API."""
    
    if not flask.request.is_json:
        flask.abort(400)    # incorrect body
        
    body = flask.request.get_json()
    body["res"] = random.uniform(0.0, 1.0)
    body["max"] = random.uniform(0.0, 1.0)
    body["min"] = random.uniform(0.0, 1.0)

    return flask.jsonify(body), 201