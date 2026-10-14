import html
from typing import Optional
import bleach


def sanitize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    # Strip HTML tags and normalize entities
    cleaned = bleach.clean(value, tags=[], attributes={}, strip=True)
    return html.unescape(cleaned).strip()

