from flask import jsonify, request,session
from . import statistic_bp
from models import Statistic, Story
from app import db


@statistic_bp.route("/upload_statistics",methods=["POST"])
def upload_statistics():
    """
    Upload user statistics after story reading is complete.
    """
    errorsMade = request.form.get("errors_made")
    pronounciationScore = request.form.get("pronounciation_score")
    story_id = request.form.get("story_id")
    wordsPerMinute = request.form.get("wpm_averaged")
    
    # Check if the required data is provided
    if not errorsMade or not pronounciationScore or not story_id:
        return jsonify({"error": "Missing data"}), 400
    
    user_id = session.get("user_id")
    new_statistic = Statistic(learnerID=user_id, storyID=story_id, wordErrorRate=errorsMade, wordsPerMinute=wordsPerMinute, pronounciationScore=pronounciationScore)
    
    # Add to the database
    db.session.add(new_statistic)
    db.session.commit()

    return jsonify({
        "message": "Statistic added successfully",
        "statistic_id": new_statistic.id  # Return the new ID
    }), 201
    

@statistic_bp.route("/get_story_statistic",methods=["GET"])
def get_story_statistic():
    """
    Returns statistic data of just read story
    """
    statistic_id = request.args.get("statistic_id")
    
    statistic = Statistic.query.filter_by(id=statistic_id).first()
    
    if not statistic:
        return jsonify({"error": "No Statistics"}), 401
    
    storyTitle = Story.query.filter_by(id=statistic.storyID).first().title
    storyDifficulty = Story.query.filter_by(id=statistic.storyID).first().difficulty
    
    
    statistic_data = {
            "storyID": statistic.storyID,
            "storyTitle": storyTitle,
            "storyDifficulty": storyDifficulty,
            "wordErrorRate": statistic.wordErrorRate,
            "wordsPerMinute": statistic.wordsPerMinute,
            "pronounciationScore": statistic.pronounciationScore,
            "date": statistic.recordedDate,
        }

    return jsonify(statistic_data),200  # Return the JSON response with the statistic data