"""Views of site server-side dynamic project."""

from rsite.views.user import show_user
from rsite.views.index import show_index
from rsite.views.uploads import get_image
from rsite.views.accounts import login, accounts
from rsite.views.resume import show_resume, show_new, show_saved, post_resumes