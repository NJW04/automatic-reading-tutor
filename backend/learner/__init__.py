from flask import Blueprint

# Define the blueprint for admin routes
learner_bp = Blueprint('learner', __name__)

# Import the routes
from . import learner_routes