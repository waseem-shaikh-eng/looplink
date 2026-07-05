"""Entry point for running the FastAPI application.

Usage:
    python run.py
    # or
    uvicorn app.presentation.app:create_app --factory --reload
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.presentation.app:create_app",
        factory=True,
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
