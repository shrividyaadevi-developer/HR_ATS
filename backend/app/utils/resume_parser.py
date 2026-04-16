from PyPDF2 import PdfReader
import re

def extract_text_from_pdf(file_path: str) -> str:
    """Extract clean text from a PDF resume."""
    try:
        reader = PdfReader(file_path)
        text_parts = [page.extract_text() for page in reader.pages if page.extract_text()]
        full_text = "\n".join(text_parts)
        # Clean up whitespace
        full_text = re.sub(r"\n{3,}", "\n\n", full_text)
        full_text = re.sub(r" {2,}", " ", full_text)
        return full_text.strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

def extract_linkedin_url(text: str) -> str:
    """
    Fallback: Finds LinkedIn profile link if NOT provided in the form.
    """
    pattern = r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w\-\d/]+'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        url = match.group(0)
        return url if url.startswith("http") else f"https://{url}"
    return None