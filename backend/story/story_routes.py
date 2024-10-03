from flask import jsonify, request,session
from . import story_bp
from models import Learner, Story


@story_bp.route("/library", methods=["GET"])
def get_stories():
    """
    This route allows a user to request stories based on a specified difficulty level.
    The stories returned are marked with the user's read status, indicating whether 
    the user has already read the story or not.

    Query Parameters:
        difficulty (str): The difficulty level of the stories to retrieve (e.g., 'easy', 'medium', 'hard').

    Returns:
        Response (json):
            - 200: A list of stories filtered by the provided difficulty level, each including 
              its ID, title, content, difficulty, and the user's read status (whether the story 
              has been read by the user or not).
            - 401: If the user is not authenticated (missing or invalid session).
            - 404: If the user is not found in the database.
    """
    story_difficulty = request.args.get("difficulty")
    
    #Now get all books from database where difficulty = difficulty
    stories = Story.query.filter_by(difficulty=story_difficulty).all()
    
     # Get current user from session
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    learner = Learner.query.filter_by(id=user_id).first()
    
    if not learner:
        return jsonify({"error": "Learner not found"}), 404
    
    # Get the user's read stories (a list of Story objects)
    learner_read_stories = learner.read_stories
    
    stories_list = []  # Initialize an empty list to store the story dictionaries

    for story in stories:
        readStatus = story in learner_read_stories  # Check if the story is in the user's read_stories
        
        story_data = {
            "id": story.id,
            "title": story.title,
            "content": story.content,
            "difficulty": story.difficulty,
            "read": readStatus,
        }
        stories_list.append(story_data)  # Append each story's data dictionary to the list

    return jsonify(stories_list)  # Return the JSON response with the list of stories
