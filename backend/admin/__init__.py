from flask import Blueprint

# Define the blueprint for admin routes
admin_bp = Blueprint('admin', __name__)

# Import the routes
from . import admin_routes