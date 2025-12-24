from dataclasses import dataclass
from typing import List, Optional

@dataclass
class StudySession:
    id: str
    user_id: str
    topic: str
    duration: int
    materials_covered: List[str]
    questions_asked: int
    confidence_level: int
    start_time: str
    end_time: str

@dataclass
class UserProfile:
    learning_style: str
    preferred_topics: List[str]
    difficulty_level: str
    study_goals: List[str]
    name: str

@dataclass
class QuizQuestion:
    id: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    topic: str
    difficulty: str

@dataclass
class StudyPlan:
    id: str
    user_id: str
    topic: str
    total_hours: int
    daily_hours: float
    weekly_goals: List[dict]
    resources: List[str]
    assessment_schedule: List[str]
    deadline: str
    created_at: str
