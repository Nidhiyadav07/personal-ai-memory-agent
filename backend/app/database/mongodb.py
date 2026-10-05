import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["personal_ai_memory"]

users_collection = db["users"]

chat_collection = db["chat_history"]
