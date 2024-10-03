from flask import jsonify, request,session,url_for,current_app
from . import learner_bp
from models import Learner, Statistic, Story
from app import db
import random
from speech_checker import analyzeSpeech
import uuid
import librosa
import math
import os



@learner_bp.route("/@me")
def get_current_learner():
    """
    This endpoint returns the details of the currently logged-in learner.
    """
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    #Getting the user details from the database where the IDs are equal
    user = Learner.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username
    }) 


@learner_bp.route("/add_read_story",methods=["POST"])
def add_read_story():
    """
    This endpoint marks a story as read for the current learner.
    """
    story_id = request.form.get("storyID")
    
    # Get the current user from the session
    user_id = session.get("user_id")
    
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Fetch the user and the story
    learner = Learner.query.filter_by(id=user_id).first()
    story = Story.query.filter_by(id=story_id).first()
    
    # Check if the story exists
    if not story:
        return jsonify({"error": "Story not found"}), 404

    # Check if the story has already been read by the user
    if story in learner.read_stories:
        return jsonify({"message": "Story already marked as read"}), 200
    
    # Add the story to the user's read stories
    learner.read_stories.append(story)
    
    # Commit the changes to the database
    db.session.commit()
    
    return jsonify({"message": "Story added to user's read stories successfully"}), 200
    
    
@learner_bp.route("/recommend_story", methods=["POST"])
def recommend_story():
    """
    This endpoint suggests a story based on the user's current difficulty level and pronunciation score.
    """
    def story_to_dict(story):
        return {
            "id": story.id,
            "title": story.title,
            "content": story.content,
            "difficulty": story.difficulty,
        }
    
    difficultyLevel = request.json["difficultyLevel"]
    pronounciationScore = int(request.json["pronounciationScore"])
        
    recommendedDifficulty = ""
    
    if difficultyLevel == "easy" and pronounciationScore < 75:
        recommendedDifficulty = "easy"
    elif difficultyLevel == "easy" and pronounciationScore >= 75:
        recommendedDifficulty = "medium"
    elif difficultyLevel == "medium" and pronounciationScore < 50:
        recommendedDifficulty = "easy"
    elif difficultyLevel == "medium" and 50 <= pronounciationScore < 75:
        recommendedDifficulty = "medium"
    elif difficultyLevel == "medium" and pronounciationScore >= 75:
        recommendedDifficulty = "hard"
    elif difficultyLevel == "hard" and pronounciationScore < 75:
        recommendedDifficulty = "medium"
    elif difficultyLevel == "hard" and pronounciationScore >= 75:
        recommendedDifficulty = "hard"
        
    # Query all stories matching the recommended difficulty
    stories = Story.query.filter_by(difficulty=recommendedDifficulty).all()

    if not stories:
        return jsonify({"recommended_story": "none"})

    # Convert the story object to a dictionary
    story = stories[random.randint(0, len(stories) - 1)]
    story_data = story_to_dict(story)

    # Return the story data as JSON
    return jsonify({"recommended_story": story_data})


# Will fetch all learners statistic records
@learner_bp.route("/get_lifetime_statistics",methods=["GET"])
def get_lifetime_statistics():
    """
    This endpoint returns the lifetime statistics for the current learner.
    """
    user_id = session.get("user_id")
    learner = Learner.query.filter_by(id=user_id).first()
    
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Query statistics for the user
    learner_statistics = Statistic.query.filter_by(learnerID=user_id).all()
    
    if not learner_statistics:
        # Return only the username and a message that no statistics exist
        return jsonify({
            "message": "No statistics exist",
            "username": learner.username,
            "total_stories_read": 0,
            "average_word_error_rate": 0,
            "average_pronounciation_score": 0,
            "average_words_per_minute": 0,
            "all_statistic_records": []
        }), 200

    # Calculate total number of stories read (unique story IDs)
    total_stories_read = len(set(stat.storyID for stat in learner_statistics))
    
    # Calculate averages for word error rate, words per minute, and pronunciation score
    total_word_error_rate = sum(stat.wordErrorRate for stat in learner_statistics)
    total_words_per_minute = sum(stat.wordsPerMinute for stat in learner_statistics)
    total_pronounciation_score = sum(stat.pronounciationScore for stat in learner_statistics)
    total_statistics = len(learner_statistics)
    
    # Calculate averages
    average_word_error_rate = round(total_word_error_rate / total_statistics,2)
    average_words_per_minute = round(total_words_per_minute / total_statistics,2)
    average_pronounciation_score = round(total_pronounciation_score / total_statistics,2)
    
    # Prepare a list to hold the statistics data
    statistics_data = []

    for stat in learner_statistics:
        story = Story.query.filter_by(id=stat.storyID).first()
        
        # Append the statistic data in the format needed for the table
        statistics_data.append({
            "storyTitle": story.title,
            "storyDifficulty": story.difficulty,
            "wordErrorRate": stat.wordErrorRate,
            "wordsPerMinute": stat.wordsPerMinute,
            "pronunciationScore": stat.pronounciationScore,
            "dateTime": stat.recordedDate.strftime("%Y-%m-%d %H:%M")
        })

    # Return the aggregated lifetime statistics
    return jsonify({
        "username": learner.username,
        "total_stories_read": total_stories_read,
        "average_word_error_rate": average_word_error_rate,
        "average_words_per_minute": average_words_per_minute,
        "average_pronounciation_score": average_pronounciation_score,
        "all_statistic_records": statistics_data,
    }), 200
    

@learner_bp.route('/check_mispronounciation', methods=['POST'])
def check_mispronunciation():
    """
    This endpoint analyzes an audio file of the user reading a sentence and identifies any mispronounced words.
    """


    # Check if the 'audio' part is present in the request
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    sentence = request.form.get("currentSentence")
    
    audio_data, sample_rate = librosa.load(audio_file, sr=16000)
    
    # Calculate the duration of the audio file
    duration_seconds = len(audio_data) / sample_rate
    duration_seconds_rounded = math.ceil(duration_seconds)
    
    # Call analyzeSpeech with the loaded audio data and the sentence
    mispronounced_words, audio_files, syllable_list = analyzeSpeech(audio_data, sentence)
    #print(f"This is the list of mispronounced words: {mispronounced_words}")
    
    # No mispronounciation detected
    if len(mispronounced_words) == 0:
        return jsonify({"results":"pass","duration_audio_file":duration_seconds_rounded}) 

    # Initialize a list to store the results
    results = []

    for word, wav_file, syllable_string in zip(mispronounced_words, audio_files, syllable_list):
        # Generate a unique filename for each mispronounced word's audio
        audio_filename = f"{uuid.uuid4()}.wav"
        audio_file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)

        with open(audio_file_path, 'wb') as f:
            f.write(wav_file)

        # Generate a URL for the saved audio file
        audio_url = url_for('static', filename=f'audio_files/{audio_filename}', _external=True)

        # Append the word and its audio URL to the results
        results.append({
            "word": word,
            "audio_url": audio_url,
            "syllable_string": syllable_string,
            "duration_audio_file":duration_seconds_rounded,
        })

    # Return the results as a JSON response
    return jsonify({"results": results})