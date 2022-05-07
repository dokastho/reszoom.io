"""Site REST API."""
from rsite.api.v1 import get_routes
from rsite.api.resume_rest import load_resumes
from rsite.api.entry_rest import post_entry, delete_entry, swap_entry
from rsite.api.experience_rest import add_experience, delete_experience