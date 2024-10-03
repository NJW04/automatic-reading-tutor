from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from datetime import datetime

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

# Association table for the many-to-many relationship between users and stories they've read
user_story_association = db.Table('user_story_association',
    db.Column('user_id', db.String(32), db.ForeignKey('learners.id'), primary_key=True),
    db.Column('story_id', db.Integer, db.ForeignKey('stories.id'), primary_key=True),
)
   
class User(db.Model):
    __tablename__ = "base_users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    accountType = db.Column(db.String(10), nullable=False)

    __mapper_args__ = {
        'polymorphic_on': accountType,
        'polymorphic_identity': 'base_user'
    }

class Learner(User):
    __tablename__ = "learners"
    id = db.Column(db.String(32), db.ForeignKey('base_users.id'), primary_key=True)
    username = db.Column(db.String(345), unique=True, nullable=False)
    statistics = db.relationship('Statistic', backref='learner', lazy=True)
    
    # Many-to-many relationship with stories
    read_stories = db.relationship('Story', secondary=user_story_association, lazy='subquery', backref=db.backref('read_by_learners', lazy=True))

    __mapper_args__ = {
        'polymorphic_identity': 'learner'
    }

class Admin(User):
    __tablename__ = "admins"
    id = db.Column(db.String(32), db.ForeignKey('base_users.id'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 'admin'
    }
    
class Story(db.Model):
    __tablename__ = "stories"
    id = db.Column(db.Integer,primary_key=True)
    title = db.Column(db.String(345), unique=True,nullable=False)
    content = db.Column(db.Text, unique=True,nullable=False)
    difficulty = db.Column(db.String(30),nullable=False)
    statistics = db.relationship('Statistic', backref='story', lazy=True)
    
class Statistic(db.Model):
    __tablename__ = "statistics"
    id = db.Column(db.Integer,primary_key=True)
    learnerID = db.Column(db.String(32), db.ForeignKey('learners.id'), nullable=False)
    storyID = db.Column(db.Integer, db.ForeignKey('stories.id'), nullable=False)
    wordErrorRate = db.Column(db.Float,nullable=False)
    wordsPerMinute = db.Column(db.Float, nullable=False)
    pronounciationScore = db.Column(db.Float, nullable=False)
    recordedDate = db.Column(db.DateTime, default=datetime.now)
    