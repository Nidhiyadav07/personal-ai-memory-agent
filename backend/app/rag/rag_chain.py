from app.rag.embeddings import embeddings
from app.rag.vector_store import search_documents
from app.llm import llm
from app.memory.chat_memory import get_history, add_message


def ask_question(question: str, session_id: str, user_id: str):

    # Only this user's PDF chunks
    results = search_documents(question, embeddings, user_id, limit=3)

    context = "\n\n".join(
        f"[Page {r.payload['page']}]\n{r.payload['text']}" for r in results
    )

    # Only this user's conversation, last 10 messages
    history = get_history(session_id, user_id)[-10:]
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history)

    prompt = f"""
You are an AI study assistant.

Use both:
1. The study material from the PDF
2. The previous conversation

to understand the user's current question.

STUDY MATERIAL:
{context or "(no documents uploaded yet)"}

PREVIOUS CONVERSATION:
{history_text}

CURRENT QUESTION:
{question}

Rules:
- Answer clearly and accurately.
- Use the PDF material as the primary source.
- Use conversation history to understand references such as
  "it", "that", "the previous concept", etc.
- If the user asks for code, generate code based on the concepts
  in the study material.
- If the PDF does not provide enough information, say so.
"""

    answer = llm.invoke(prompt).content

    add_message(session_id, user_id, "user", question)
    add_message(session_id, user_id, "assistant", answer)

    return answer
