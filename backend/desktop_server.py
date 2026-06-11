from pathlib import Path

import uvicorn

from app.config import BASE_DIR


def main() -> None:
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    (BASE_DIR / "data").mkdir(parents=True, exist_ok=True)
    (BASE_DIR / "uploads").mkdir(parents=True, exist_ok=True)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    main()
