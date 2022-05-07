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
    isEducation = flask.request.args.get("edu", type=int)
    if isEducation is None:
        flask.abort(400)

    # fetch experience
    cur = database.execute(
        "SELECT * "
        "FROM experience "
        "WHERE owner == ? "
        "AND typename == ?",
        (logname, isEducation, )
    )
    data = cur.fetchall()
    if len(data) == 0:
        flask.abort(404)

    return flask.jsonify({
        "exp": data
    }), 201


@rsite.app.route("/api/v1/experience/", methods=["POST"])
def add_experience():
    """Add education/experience from db."""
    logname, database = rest_api_auth_user()


@rsite.app.route("/api/v1/experience/<int:expid>", methods=["DELETE"])
def delete_experience():
    """Delete education/experience from db."""
    logname, database = rest_api_auth_user()

    # verify user authorization
