"""Site REST API."""
from rsite.api.v1 import get_routes
from rsite.api.user_rest import current_user
from rsite.api.resume_rest import load_resumes
from rsite.api.tag_rest import get_entry_tags, get_resume_tags
from rsite.api.entry_rest import post_entry, delete_entry, swap_entry, get_subentries, get_recommended
from rsite.api.create_rest import load_create
