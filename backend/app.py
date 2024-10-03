from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from config import ApplicationConfig
from models import db, User,Learner,Admin,Story
import os

# Import the blueprints
from admin import admin_bp  
from story import story_bp
from learner import learner_bp
from statistic import statistic_bp

from speech_checker import instantiateModels

        
app = Flask(__name__)
app.config.from_object(ApplicationConfig)


# Configure the folder where audio files will be saved
UPLOAD_FOLDER = 'static/audio_files'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}}, allow_headers=["Content-Type", "Authorization"])
server_session = Session(app)
db.init_app(app)

# Register the blueprints for all entities
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(story_bp, url_prefix="/story")
app.register_blueprint(learner_bp, url_prefix="/learner")
app.register_blueprint(statistic_bp, url_prefix="/statistic")

def add_initial_stories():
   # Check if stories are already added
   if not Story.query.filter_by(difficulty='easy').first():
       story1 = Story(
           title="The Garden Adventure",
           content="Once, Lucy found a magical passport in the garden. She and a mermaid played together. They laughed until it was time to go home. The mermaid thanked Lucy before leaving.",
           difficulty="easy"
       )
       story2 = Story(
           title="Bruce and the Sauce",
           content="Bruce and his friend played outside. Bruce wondered if they could trust the sauce. His friend said it was always good. They kept playing happily, enjoying their day.",
           difficulty="easy"
       )
       story3 = Story(
           title="The Big Flower",
           content="Jack picked a big flower from the garden. Its petals fell off before he got home. With a friend's help, Jack planted new seeds. Soon, new flowers started to grow.",
           difficulty="easy"
       )
       story4 = Story(
           title="Lucy Sells Her Knee",
           content="Lucy went to the market to sell her knee. An old woman helped her find a buyer. Lucy was happy to get good advice. She thanked the woman and left.",
           difficulty="easy"
       )
       story5 = Story(
           title="The Careful Bug",
           content="John wanted to play with a bug. His mom put the bug in a case to keep it safe. John understood and smiled. They played some more before dinner.",
           difficulty="easy"
       )
       story6 = Story(
           title="Tim's Adventure by the Lake",
           content="Tim and his family walked by a lake. Tim wanted to explore, so they all went together. He found colorful rocks and plants. It was a special day for Tim.",
           difficulty="easy"
       )
       story7 = Story(
           title="The Mysterious Toy",
           content="Jill’s toy car moved on its own. It led her to a box. Inside was a surprise toy. Jill was excited and showed her parents.",
           difficulty="easy"
       )
       story8 = Story(
           title="The Farmer and the Duck",
           content="A farmer found his duck talking to other animals. The duck told them about a pond nearby. They all went to see the pond together. They found fish and bugs.",
           difficulty="easy"
       )
       story9 = Story(
           title="Amy and the Painter",
           content="Amy asked a painter to help with her room. He painted it beautifully. Amy was very happy with the new look. She thanked him and watched him leave.",
           difficulty="easy"
       )
       story10 = Story(
           title="Lola’s Purple Pastry",
           content="Lola found a purple pastry in the park. She took a bite and smiled. It was very sweet. She saved the rest to share with her mom.",
           difficulty="easy"
       )


       story11 = Story(
           title="The Brave Sailor",
           content="A sailor and his crew faced a storm. They worked hard to stay safe. After a long fight, they reached the harbor. Everyone was tired but happy.",
           difficulty="medium"
       )
       story12 = Story(
           title="The Magical Forest",
           content="In a magical forest, a group of friends found a talking tree. The tree shared wisdom about nature. The friends felt thankful. They promised to visit again.",
           difficulty="medium"
       )
       story13 = Story(
           title="The Lost Treasure",
           content="A group of explorers found a treasure map. They followed it for days. At last, they found the chest. It was full of gold and jewels.",
           difficulty="medium"
       )
       story14 = Story(
           title="The Flying Carpet",
           content="A boy found a flying carpet in his attic. He flew over the city. He saw amazing sights from above. Then, he safely returned home.",
           difficulty="medium"
       )
       story15 = Story(
           title="The Wise Old Owl",
           content="A curious child visited an old owl. The owl was very wise. The child listened carefully to its advice. The lessons stayed with the child for life.",
           difficulty="medium"
       )
       story16 = Story(
           title="The Enchanted Lake",
           content="A girl found an enchanted lake near her village. The lake granted wishes. She made a wish for her family. Her wish came true, bringing joy to all.",
           difficulty="medium"
       )
       story17 = Story(
           title="The King's Challenge",
           content="The king challenged his people with a riddle. Many tried to solve it. A clever villager finally succeeded. The king gave the villager a great prize.",
           difficulty="medium"
       )
       story18 = Story(
           title="The Hidden Door",
           content="Two children found a hidden door in their house. Behind it was a magical land. They made new friends and had many adventures.",
           difficulty="medium"
       )
       story19 = Story(
           title="The Forgotten Kingdom",
           content="An explorer found a forgotten kingdom. The people there were kind. Together, they restored the kingdom. The explorer stayed there for many years.",
           difficulty="medium"
       )
       story20 = Story(
           title="The Curious Robot",
           content="A robot wanted to learn about feelings. It met many people and asked them questions. In the end, the robot understood love and friendship.",
           difficulty="medium"
       )


       story21 = Story(
           title="The Philosopher’s Dilemma",
           content="A philosopher thought about life. He spent many nights thinking. In the end, he realized that people are the most important part of life. His heart was at peace.",
           difficulty="hard"
       )
       story22 = Story(
           title="The Warrior’s Sacrifice",
           content="A warrior fought to protect his village. He gave up everything to save his people. The villagers honored him for years. His story became a legend.",
           difficulty="hard"
       )
       story23 = Story(
           title="The Infinite Library",
           content="A scholar found a library with endless books. He read many books for years. In the end, he found that wisdom comes from inside. His mind was clear.",
           difficulty="hard"
       )
       story24 = Story(
           title="The Last Dragon",
           content="A knight found the last dragon. Instead of fighting it, they became friends. Together, they protected the land from danger. The people praised the knight.",
           difficulty="hard"
       )
       story25 = Story(
           title="The Time Traveler",
           content="A scientist built a time machine. He traveled through the past and future. Each time, he saw how small actions could change everything. He learned to act carefully.",
           difficulty="hard"
       )
       story26 = Story(
           title="The Painter’s Secret",
           content="A painter created beautiful art. People admired his work, but he had a secret. The colors he used were enchanted. Only the painter knew this.",
           difficulty="hard"
       )
       story27 = Story(
           title="The Starship Captain",
           content="In the future, a captain led her crew through space. They faced many dangers. With courage, they protected the galaxy. The captain earned her crew's trust.",
           difficulty="hard"
       )
       story28 = Story(
           title="The Desert Wanderer",
           content="A wanderer traveled across the desert. He faced many challenges along the way. In the end, he learned that the journey itself was the true reward.",
           difficulty="hard"
       )
       story29 = Story(
           title="The Philosopher’s Stone",
           content="An alchemist searched for the philosopher’s stone. He wanted immortality. In the end, he found that true immortality comes from what we leave behind.",
           difficulty="hard"
       )
       story30 = Story(
           title="The Final Frontier",
           content="An explorer traveled to the edge of space. There, he realized the true meaning of exploration. Understanding our place in the universe was his greatest discovery.",
           difficulty="hard"
       )


       # Add stories to session
       db.session.add_all([story1, story2, story3, story4, story5, story6, story7, story8, story9, story10,
                           story11, story12, story13, story14, story15, story16, story17, story18, story19, story20,
                           story21, story22, story23, story24, story25, story26, story27, story28, story29, story30])
       db.session.commit()


      
def add_admin():
   # Check if the admin already exists
   existing_admin = Admin.query.filter_by(email="admin@gmail.com").first()


   if existing_admin:
       print("Admin already exists in the database.")
       return


   # If no admin exists, create a new one
   admin = Admin(
       email="admin@gmail.com",
       password=bcrypt.generate_password_hash("admin").decode('utf-8'),
       accountType="admin"
   )


   # Add the admin to the session and commit to the database
   db.session.add(admin)
   db.session.commit()
   

with app.app_context():
    db.create_all()
    
# When the server is run the models need to be instantiated
instantiateModels()  


# Adding new user to the database
@app.route("/register", methods=["POST"])
def register_learner():
    email = request.json["email"]
    username = request.json["username"]
    password = request.json["password"]

    # Check if the email or username already exists in the Learner table
    email_exists = Learner.query.filter_by(email=email).first() is not None
    username_exists = Learner.query.filter_by(username=username).first() is not None

    if email_exists:
        return jsonify({"error": "User email already exists"}), 409
    elif username_exists:
        return jsonify({"error": "Username already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Create a new Learner instance
    new_learner = Learner(email=email, username=username, password=hashed_password)

    # Add the new learner to the session
    db.session.add(new_learner)
    db.session.commit()
    
    session["user_id"] = new_learner.id

    # Return learner data in response
    return jsonify({
        "id": new_learner.id,
        "email": new_learner.email,
        "username": new_learner.username,
        "password": new_learner.password
    })


# Login user if details are in the database
@app.route("/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    # Query the base user table for the given email
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "User does not exist"}), 401

    # Check if the password matches the hashed password in the database
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    # Store the user ID in the session
    session["user_id"] = user.id

    # Determine if the user is a Learner or Admin based on the polymorphic identity
    account_type = user.accountType
    response_data = {
        "id": user.id,
        "email": user.email,
        "accountType": account_type
    }
    
    return jsonify(response_data)


# Logout User from current session
@app.route("/logout", methods=["POST"])
def logout_user():
    session.pop("user_id")
    return "200"

if __name__ == "__main__":
    app.run(debug=True)