from flask import Blueprint

# Define the blueprint for admin routes
story_bp = Blueprint('story', __name__)

# Import the routes
from . import story_routes