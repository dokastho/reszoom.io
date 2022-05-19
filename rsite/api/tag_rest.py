
"""
Site resume rest api.

URLs include:
/api/v1/<entryid>/tags
"""

import flask
import rsite
from rsite.model import rest_api_auth_user


@rsite.app.route("/api/v1/<int:entryid>/tags/", methods=['GET'])
def get_tags(entryid):
    """Get the other entries owned by this user for a given header."""
    """Send: array of recommended entries"""

    if entryid is None:
        flask.abort(404)

    _, database = rest_api_auth_user()

    # get tagids
    cur = database.execute(
        "SELECT * "
        "FROM entry_to_tag "
        "WHERE entryid == ? ",
        (entryid,)
    )
    tags = cur.fetchall()

    # construct response
    # entryid: array of tag names
    data = {
        "tags": []
        }
    for tag in tags:
        cur = database.execute(
            "SELECT * "
            "FROM tags "
            "WHERE tagid == ? ",
            (tag['tagid'],)
        )
        t = cur.fetchone()
        data["tags"].append(t['tagname'])

    return flask.jsonify(data), 201
