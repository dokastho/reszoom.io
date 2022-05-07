"""
Site resume rest api.

URLs include:
/api/v1/entry/
/api/v1/entry/eid/
/api/v1/entry/meta/
"""

import flask
import rsite
from rsite.model import rest_api_auth_user

###############################################################################
## EDUCATION # EXPERIENCE # EDUCATION ## EXPERIENCE # EDUCATION # EXPERIENCE ##
###############################################################################


@rsite.app.route("/api/v1/experience/", methods=["GET"])
def get_experience():
    """Fetch education/experience from db."""
    logname, database = rest_api_auth_user()

    # get education info
    header = flask.request.args.get("header", type=int)
    if header is None:
        flask.abort(400)

    data = {"p": "q"}
    # fetch experience
    cur = database.execute(
        "SELECT * "
        "FROM experience "
        "WHERE owner == ? "
        "AND typename == ?",
        (logname, header, )
    )
    arr = cur.fetchall()

    # assemble json
    for elt in arr:
        data[elt['expid']] = {
            'location': elt['location'],
            'begin': elt['begin'],
            'end': elt['end'],
            'gpa': elt['gpa']
        }


    return flask.jsonify(data), 201


@rsite.app.route("/api/v1/experience/", methods=["POST"])
def add_experience():
    """Add education/experience from db."""
    logname, database = rest_api_auth_user()

    # get info from request
    body = dict(flask.request.get_json())

    # verify args
    # doesn't read well but it's better than taking tons of lines
    location = body['location'] if 'location'   in body.keys() else flask.abort(400)
    typename = body['header']     if 'type'       in body.keys() else flask.abort(400)
    begin = body['begin']       if 'begin'      in body.keys() else flask.abort(400)
    end = body['end']           if 'end'        in body.keys() else flask.abort(400)
    gpa = float(body['gpa'])    if 'gpa'        in body.keys() else flask.abort(400)

    # add a new entry
    cur = database.execute(
        "INSERT INTO experience "
        "(owner, location, typename, begin, end, gpa) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (logname, location, typename, begin, end, gpa, )
    )
    cur.fetchone()

    # construct response msg
    cur = database.execute(
        "SELECT MAX(expid) "
        "AS max_id "
        "FROM experience "
    )
    expid = cur.fetchone()['max_id']
    cur = database.execute(
        "SELECT * "
        "FROM experience "
        "WHERE expid == ?",
        (expid, )
    )
    data = cur.fetchone()

    # ensure this matches user
    if data['owner'] != logname:
        flask.abort(403)

    return flask.jsonify({
        'expid': expid,
        'data': data
    }), 201


@rsite.app.route("/api/v1/experience/<int:expid>", methods=["DELETE"])
def delete_experience(expid):
    """Delete education/experience from db."""
    logname, database = rest_api_auth_user()

    # verify user authorization
    cur = database.execute(
        "SELECT * "
        "FROM experience "
        "WHERE expid == ?",
        (expid, )
    )
    auth = cur.fetchone()

    if auth is None or auth['owner'] != logname:
        flask.abort(403)
    
    # delete entry
    cur = database.execute(
        "DELETE FROM experience "
        "WHERE expid == ?",
        (expid, )
    )
    cur.fetchone()
    return flask.Response(201)