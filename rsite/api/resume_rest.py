"""
Site resume rest api.

URLs include:
/api/v1/resume/load/
# /api/v1/resume/
"""
import flask
import rsite
from rsite.model import rest_api_auth_user


@rsite.app.route('/api/v1/resume/load/', methods=['GET'])
def load_resumes():
    """Return resumes from database matching logname."""
    with rsite.app.app_context():
        logname, database = rest_api_auth_user()

        op = flask.request.args.get("fetch", default="resume", type=str)

        if op == "list":
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE owner == ?",
                (logname, )
            )
            resumes = cur.fetchall()
            res = {'resumes': resumes}
        elif op == "userinfo":
            rid = flask.request.args.get("resumeid", default=0, type=int)

            # load all entries for a specific user
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?",
                (logname, )
            )
            data = cur.fetchall()

            # construct entries map
            entries = {}
            for entry in data:
                entries[entry['entryid']] = {
                    'frequency': entry['frequency'],
                    'priority': entry['priority'],
                    'owner': entry['owner'],
                    'header': entry['header'],
                    'subheader': entry['subheader'],
                    'content': entry['content'],
                    'type': entry['type'],
                    'begin': entry['begin'],
                    'end': entry['end'],
                    'gpa': entry['gpa']
                }

            # get eids for the resume id
            if rid == 0:
                flask.abort(404)
            cur = database.execute(
                "SELECT * "
                "FROM resume_to_entry "
                "WHERE resumeid == ?",
                (rid, )
            )
            eids = cur.fetchall()

            # get the userinfo
            cur = database.execute(
                "SELECT * "
                "FROM users "
                "WHERE username == ?",
                (logname, )
            )
            userinfo = cur.fetchone()

            # get the resume info
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE resumeid == ?",
                (rid, )
            )
            resumeinfo = cur.fetchone()

            # construct the response
            res = {
                'eids': eids,
                'entries': entries,
                'username': userinfo['username'],
                'fullname': userinfo['fullname'],
                'email': userinfo['email'],
                'resumename': resumeinfo['name'],
                'resumetype': resumeinfo['typename']
            }
        else:
            flask.abort(403)
        return flask.jsonify(res), 201
