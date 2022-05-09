"""
Site main resume content view.

URLs include:
/resume/
/resume/new/
/resume/<id>/
"""
import flask
import rsite
from rsite.model import show_username, delete_helper


@rsite.app.route('/resume/', methods=['GET'])
def show_resume():
    """Render react content for main resume page"""
    with rsite.app.app_context():
        context = show_username()
        return flask.render_template('resume.html', **context)


@rsite.app.route('/resume/new/')
def show_new():
    """Render react content for new resume page"""
    with rsite.app.app_context():
        context = show_username()
        if context['logname'] == "Sign In":
            return flask.redirect("/accounts/login")
        return flask.render_template('new.html', **context)


@rsite.app.route('/resume/<int:resumeid>/')
def show_saved(resumeid):
    """Render react content for view/edit resume page"""
    with rsite.app.app_context():
        context = show_username()

        logname = context['logname']
        if logname == "Sign In":
            flask.abort(403)

        database = rsite.model.get_db()
        cur = database.execute(
            "SELECT * "
            "FROM resumes "
            "WHERE resumeid == ?",
            (resumeid, )
        )
        resume = cur.fetchone()

        if resume is None:
            flask.abort(404)

        if resume['owner'] != logname:
            flask.abort(403)

        resp = flask.make_response(flask.render_template('view_edit.html', **context))
        resp.set_cookie('resumeid', f'{resumeid}')

        return resp

@rsite.app.route('/resume/commit/', methods=['POST'])
def post_resumes():
    """Resolve post requests for the resume."""
    database = rsite.model.get_db()

    logname = rsite.model.get_logname()
    if not logname:
        flask.abort(403)

    op = flask.request.form.get("operation", default=None, type=str)

    if op is None:
        flask.abort(404)

    if op == "create":
        # get name and type of resume
        rname = flask.request.form.get('name')
        rtype = flask.request.form.get('type')
        
        if len(rname) == 0:
            flask.abort(400)
        
        rtype = 1 if rtype == 'on' else 0
        
        cur = database.execute(
            "INSERT INTO resumes "
            "(owner, name, typename) "
            "VALUES (?, ?, ?)",
            (logname, rname, rtype, )
        )
        cur.fetchone()

        # get id to redirect to
        cur = database.execute(
            "SELECT MAX(resumeid) "
            "AS rid "
            "FROM resumes "
        )
        data = cur.fetchone()
        target = "/resume/" + str(data['rid']) + "/"

    elif op == "delete":
        rid = flask.request.form.get("id", default=0, type=int)
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

            if entry is None:
                continue

            if logname != entry['owner']:
                flask.abort(403)
            
            delete_helper(entry['entryid'], entry['frequency'])
            
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
        target = rsite.model.get_target()

    elif op == "save":
        pass


    return flask.redirect(target)