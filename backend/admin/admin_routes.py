from flask import jsonify, request,session
from flask_cors import cross_origin
from . import admin_bp
from models import Learner, Statistic, Story,Admin
from sqlalchemy import func
from app import db


@admin_bp.route("/@me")
def get_current_admin():
    """
    Getting current session user details for admin
    """
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    #Getting the user details from the database where the IDs are equal
    user = Admin.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email,
    })
    
    
@admin_bp.route("/edit_user/<string:user_id>", methods=["PUT"])
@cross_origin(supports_credentials=True)
def edit_user(user_id):
    """
    Edit a user's details (username and email) based on the provided user ID.

    Args:
        user_id (string): The ID of the user to be edited.

    Returns:
        Response (json):
            - 200: A success message with the updated user details (ID, username, email).
            - 404: If the user is not found in the database.
            - 409: If the new email or username is already in use by another user.
            - 500: If a server error occurs during the database update process.
    """
    try:
        data = request.json
        new_username = data.get("username")
        new_email = data.get("email")

        user = Learner.query.filter_by(id=user_id).first()
        if user is None:
            return jsonify({"error": "User not found"}), 404

        email_exists = Learner.query.filter(Learner.email == new_email, Learner.id != user_id).first() is not None
        username_exists = Learner.query.filter(Learner.username == new_username, Learner.id != user_id).first() is not None

        if email_exists:
            return jsonify({"error": "Email already exists"}), 409
        if username_exists:
            return jsonify({"error": "Username already exists"}), 409

        user.username = new_username
        user.email = new_email
        db.session.commit()

        return jsonify({"id": user.id, "username": user.username, "email": user.email}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@admin_bp.route("/delete_user/<string:user_id>", methods=["DELETE"])
@cross_origin(supports_credentials=True)
def delete_user(user_id):
    """
    Deletes a learner from the database based on the provided user ID.

    Args:
        user_id (string): The ID of the user to be deleted.

    Returns:
        Response (json): A success message with a 200 status code if the user 
        is successfully deleted, or an error message with a 404 status code 
        if the user is not found. In case of a server error, a 500 status code 
        is returned with an error message.
    """
    try:
        user = Learner.query.filter_by(id=user_id).first()
        if user is None:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@admin_bp.route("/get_all_learners",methods=["GET"])
def get_all_learners():
    """
    Retrieve a list of all learners from the database.s

    Returns:
        Response (json):
            - 200: A list of all learners with their IDs, usernames, emails, and passwords.
    """
    learners = Learner.query.all()

    # Serialize the learners into a list of dictionaries
    learners_list = [
        {
            "id": learner.id,
            "username": learner.username,
            "email": learner.email,
            "password": learner.password
        } for learner in learners
    ]

    # Return the list of learners as a JSON response
    return jsonify(learners_list), 200
    

@admin_bp.route("/general_statistics", methods=["GET"])
def general_statistics():
    """
    This route calculates and returns the average pronunciation score, average words per minute (WPM),
    and average word error rate (WER) across all learner statistics in the database. These statistics 
    provide a general overview of the performance of all learners.

    Returns:
        Response (json):
            - 200: A JSON object with the aggregated average values for pronunciation score, WPM, and word error rate.
            - 404: A message indicating that no statistics are available if the query returns no results.
    """
    result = db.session.query(
        func.avg(Statistic.pronounciationScore).label('averagePronunciationScore'),
        func.avg(Statistic.wordsPerMinute).label('averageWPM'),
        func.avg(Statistic.wordErrorRate).label('averageWordErrorRate')
    ).first()

    if result:
        return jsonify({
            "averagePronunciationScore": round(result.averagePronunciationScore, 2),
            "averageWPM": round(result.averageWPM, 2),
            "averageWordErrorRate": round(result.averageWordErrorRate, 2)
        })
    else:
        return jsonify({"message": "No statistics available."}), 404
    


@admin_bp.route("/statistics_get_all_learners", methods=["GET"])
def statistics_get_all_learners():
    """
    Retrieve the list of all learners from the database.

    Returns:
        Response (json):
            - 200: A list of learners with their IDs and usernames.
    """
    learners = Learner.query.all()
    learners_list = [{"id": learner.id, "username": learner.username} for learner in learners]
    return jsonify(learners_list), 200



@admin_bp.route("/learner_lifetime_statistics", methods=["GET"])
def learner_lifetime_statistics():
    """
    Retrieve the lifetime reading statistics for a specified learner.
    
    Returns:
        Response (json):
            - 200: If statistics are found or if none exist, returns a summary of statistics including total stories read, average word error rate, pronunciation score, words per minute, and all detailed records.
            - 401: If no learner ID is provided in the request, an error is returned.
    """
    learner_id = request.args.get("learner_id")
    if not learner_id:
        return jsonify({"error": "Unauthorized"}), 401

    learner_statistics = Statistic.query.filter_by(learnerID=learner_id).all()
    if not learner_statistics:
        return jsonify({
            "message": "No statistics exist",
            "total_stories_read": 0,
            "average_word_error_rate": 0,
            "average_pronounciation_score": 0,
            "average_words_per_minute": 0,
            "all_statistic_records": []
        }), 200

    total_stories_read = len(set(stat.storyID for stat in learner_statistics))
    total_word_error_rate = sum(stat.wordErrorRate for stat in learner_statistics)
    total_words_per_minute = sum(stat.wordsPerMinute for stat in learner_statistics)
    total_pronounciation_score = sum(stat.pronounciationScore for stat in learner_statistics)
    total_statistics = len(learner_statistics)

    average_word_error_rate = round(total_word_error_rate / total_statistics, 2)
    average_words_per_minute = round(total_words_per_minute / total_statistics, 2)
    average_pronounciation_score = round(total_pronounciation_score / total_statistics, 2)

    statistics_data = []
    for stat in learner_statistics:
        story = Story.query.filter_by(id=stat.storyID).first()
        statistics_data.append({
            "storyTitle": story.title,
            "storyDifficulty": story.difficulty,
            "wordErrorRate": stat.wordErrorRate,
            "wordsPerMinute": stat.wordsPerMinute,
            "pronunciationScore": stat.pronounciationScore,
            "dateTime": stat.recordedDate.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify({
        "total_stories_read": total_stories_read,
        "average_word_error_rate": average_word_error_rate,
        "average_words_per_minute": average_words_per_minute,
        "average_pronounciation_score": average_pronounciation_score,
        "all_statistic_records": statistics_data,
    }), 200
    

@admin_bp.route("/add_story", methods=["POST"])
def add_story():
    """
    Add a new story to the database.

    This route allows an admin to add a new story by providing the title, content, and 
    difficulty of the story.

    Returns:
        Response (json):
            - 201: Success message indicating the story was added.
            - 400: Error message if any required data (title, content, or difficulty) is missing.
    """
    data = request.json
    title = data.get("title")
    content = data.get("content")
    difficulty = data.get("difficulty")

    if not title or not content or not difficulty:
        return jsonify({"error": "Missing data"}), 400

    new_story = Story(title=title, content=content, difficulty=difficulty)
    db.session.add(new_story)
    db.session.commit()

    return jsonify({"message": "Story added successfully"}), 201