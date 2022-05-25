"""
Site uploads route.

URLs include:
/uploads/<path:filename>
"""
import flask
import rsite


@rsite.app.route('/uploads/<path:filename>')
def get_image(filename):
    """Get image at path if session is authenticated."""
    # logname must exist in session
    if 'logname' not in flask.session:
        return flask.abort(403)

    return flask.send_from_directory(
        rsite.app.config['UPLOAD_FOLDER'], filename, as_attachment=True
    )
