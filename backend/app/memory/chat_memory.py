from app.database.mongodb import chat_collection

chat_collection.create_index([("user_id", 1), ("session_id", 1)])


def session_owner(session_id: str):
    doc = chat_collection.find_one({"session_id": session_id}, {"user_id": 1})
    return doc["user_id"] if doc else None


def get_history(session_id: str, user_id: str):
    messages = chat_collection.find(
        {"session_id": session_id, "user_id": user_id}
    ).sort("_id", 1)

    return [{"role": m["role"], "content": m["content"]} for m in messages]


def add_message(session_id: str, user_id: str, role: str, content: str):
    chat_collection.insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "role": role,
        "content": content,
    })


def list_sessions(user_id: str):
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"_id": 1}},
        {"$group": {
            "_id": "$session_id",
            "title": {"$first": "$content"},
            "last": {"$last": "$_id"},
        }},
        {"$sort": {"last": -1}},
    ]
    return [
        {"session_id": s["_id"], "title": s["title"][:60]}
        for s in chat_collection.aggregate(pipeline)
    ]


def delete_session(session_id: str, user_id: str):
    chat_collection.delete_many({"session_id": session_id, "user_id": user_id})
