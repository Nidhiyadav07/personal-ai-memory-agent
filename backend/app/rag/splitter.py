from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = []

    for document in documents:
        text = document["text"]

        split_texts = splitter.split_text(text)

        for chunk in split_texts:
            chunks.append({
                "page": document["page"],
                "text": chunk
            })

    return chunks
