from fastapi import APIRouter

router = APIRouter(tags=["projects"])

@router.get("/projects/{project_id}/timeline")
def get_timeline(project_id: str):
    return {
        "project_id": project_id,
        "timeline": [
            {"agent": "Director", "summary": "Проект открыт и привязан к офису."},
            {"agent": "Strategist", "summary": "Brief по проекту собран."},
            {"agent": "Developer", "summary": "Реализация в процессе."},
        ],
    }
