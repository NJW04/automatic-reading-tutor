from flask import Blueprint

# Define the blueprint for admin routes
statistic_bp = Blueprint('statistic', __name__)

# Import the routes
from . import statistic_routes