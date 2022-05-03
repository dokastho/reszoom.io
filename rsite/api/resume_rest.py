"""
Site resume rest api.

URLs include:
/api/v1/resume/load/
/api/v1/resume/
"""
import flask
import rsite


@rsite.app.route('/api/v1/resume/load/', methods=['GET'])
def load_resumes():
    """Return resumes from database matching logname."""
    with rsite.app.app_context():
        logname = rsite.model.get_logname()
        if not logname:
            flask.abort(403)

        op = flask.request.args.get("fetch", default="resume", type=str)

        database = rsite.model.get_db()

        if op == "list":
            cur = database.execute(
                "SELECT * "
                "FROM resumes "
                "WHERE owner == ?",
                (logname, )
            )
            resumes = cur.fetchall()
            data = {'resumes': resumes}
        elif op == "userinfo":
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?",
                (logname, )
            )
            entries = cur.fetchall()
            if len(entries) == 0:
                flask.abort(500)
            data = {'entries': entries}
        elif op == "resume":
            rid = flask.request.args.get("id", default=0, type=int)

            if rid == 0:
                flask.abort(500)

            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE owner == ?"
                "AND resumeid == ?",
                (logname, rid, )
            )
            entries = cur.fetchall()
            data = {'entries': entries}
        else:
            flask.abort(403)
        return flask.jsonify(data), 201


@rsite.app.route('/api/v1/resume/', methods=['POST'])
def load_resumes():
    """Resolve post requests for the resume."""
    database = rsite.model.get_db()

    logname = flask.session.get('logname')

    op = flask.request.args.get("operation", default=None, type=str)

    if op is None:
        flask.abort(404)

    if op == "create":
        # get name and type of resume
        rname = flask.request.form.get('name')
        type = flask.request.form.get('type')
        if len(rname) == 0:
            flask.abort(400)
        
        cur = database.execute(
            "INSERT INTO resumes "
            "(owner, name, typename) "
            "VALUES (?, ?, ?)",
            (logname, rname, type, )
        )
        cur.fetchone()

    elif op == "delete":
        rid = flask.request.args.get("id", default=0, type=int)
        if rid == 0:
            flask.abort(404)
        # first delete/update the entries. load them using the intermediate table
        cur = database.execute(
            "SELECT * "
            "FROM resume_to_entry "
            "WHERE resumeid == ?",
            (rid, )
        )
        eids = cur.fetchall()
        for eid in eids:
            # fetch the entry
            cur = database.execute(
                "SELECT * "
                "FROM entries "
                "WHERE entryid == ?",
                (eid['entryid'], )
            )
            entry = cur.fetchone()

            if logname != entry['owner']:
                flask.abort(403)

            entry['frequency'] = entry['frequency'] - 1
            if entry['frequency'] == 0:
                # delete the entry
                cur = database.execute(
                    "DELETE FROM entries "
                    "WHERE entryid == ?",
                    (entry['entryid'],)
                )

            else:
                # update the entry
                cur = database.execute(
                    "UPDATE entries "
                    "SET frequency = ?"
                    "WHERE entryid == ?",
                    (entry['frequency'], entry['entryid'],)
                )
            
            # execute the update/delete for this entry
            cur.fetchone()

        # then delete the resume
        cur = database.execute(
            "DELETE FROM resumes "
            "WHERE resumeid == ?"
            "AND owner == ?",
            (rid, logname, )
        )
        cur.fetchone()

        # redirect to some target TODO: find where to go instead of /
        target = rsite.model.get_target()

        return flask.redirect(target)


    elif op == "save":
        pass


@rsite.app.route('/api/v1/resume/save/', methods=['DELETE'])
def load_resumes():
    """Remove resume from db if the credentials match."""
