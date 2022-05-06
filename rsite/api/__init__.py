"""Site REST API."""
from rsite.api.v1 import get_routes
from rsite.api.resume_rest import load_resumes, post_entry, delete_entry, swap_entry