from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timedelta
import random
from dataclasses import asdict
from models import UserProfile, StudySession, StudyPlan, QuizQuestion
from database import Database
import google.generativeai as genai
import os
import json
from config import Config

class AIStudyBuddyBackend:
    def __init__(self):
        self.db = Database()
        self.knowledge_base = self._initialize_knowledge_base()
        self._setup_gemini()

    def _setup_gemini(self):
        api_key = Config.GEMINI_API_KEY
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.has_gemini = True
        else:
            self.has_gemini = False
            print("WARNING: No Gemini API key found. Using fallback logic.")

    def _call_gemini(self, prompt: str) -> str:
        if not self.has_gemini:
            return None
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return None

    def _initialize_knowledge_base(self) -> Dict:
        return {
            "programming": {
                "python": ["basics", "OOP", "data structures", "algorithms", "libraries"],
                "javascript": ["syntax", "DOM", "async programming", "frameworks"],
                "java": ["classes", "inheritance", "collections", "multithreading"]
            },
            "mathematics": {
                "algebra": ["equations", "functions", "polynomials", "matrices"],
                "calculus": ["limits", "derivatives", "integrals", "applications"],
                "statistics": ["probability", "distributions", "hypothesis testing", "regression"]
            },
            "science": {
                "physics": ["mechanics", "thermodynamics", "electromagnetism", "quantum"],
                "chemistry": ["periodic table", "reactions", "organic chemistry", "biochemistry"],
                "biology": ["cell biology", "genetics", "ecology", "evolution"]
            }
        }

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        data = self.db.get_user_by_id(user_id)
        if data:
            # Filter keys that match UserProfile fields
            valid_keys = UserProfile.__annotations__.keys()
            filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            return UserProfile(**filtered_data)
        return None

    def update_user_profile(self, user_id: str, profile_data: Dict) -> Optional[UserProfile]:
        data = self.db.update_user_profile(user_id, profile_data)
        if data:
            valid_keys = UserProfile.__annotations__.keys()
            filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            return UserProfile(**filtered_data)
        return None

    def create_study_session(self, user_id: str, session_data: Dict) -> StudySession:
        session = StudySession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            topic=session_data.get('topic', 'general'),
            duration=0,
            materials_covered=[],
            questions_asked=0,
            confidence_level=0,
            start_time=datetime.now().isoformat(),
            end_time=""
        )
        self.db.save_study_session(session)
        return session

    def end_study_session(self, user_id: str, session_id: str, confidence_level: int) -> Optional[StudySession]:
        session = self.db.get_study_session(session_id)
        if session and session.user_id == user_id and not session.end_time:
            session.end_time = datetime.now().isoformat()
            session.confidence_level = confidence_level
            
            # Calculate duration in minutes
            start_time = datetime.fromisoformat(session.start_time)
            end_time = datetime.fromisoformat(session.end_time)
            session.duration = int((end_time - start_time).total_seconds() / 60)
            
            self.db.save_study_session(session)
            return session
        return None

    def add_session_question(self, user_id: str, session_id: str) -> bool:
        session = self.db.get_study_session(session_id)
        if session and session.user_id == user_id:
            session.questions_asked += 1
            self.db.save_study_session(session)
            return True
        return False

    def ask_ai(self, user_id: str, session_id: str, question: str) -> str:
        # First, increment the question count
        self.add_session_question(user_id, session_id)
        
        session = self.db.get_study_session(session_id)
        topic = session.topic if session else "general knowledge"
        
        if self.has_gemini:
            prompt = f"""
            You are an AI Study Buddy helping a student learn {topic}.
            The student asks: "{question}"
            Provide a clear, concise, and helpful explanation suitable for a student.
            """
            response = self._call_gemini(prompt)
            if response:
                return response
        
        # Fallback response
        return f"I'm currently in offline mode, but that's a great question about {topic}! Try looking it up in the recommended resources."

    def get_study_sessions(self, user_id: str) -> List[StudySession]:
        return self.db.get_study_sessions(user_id)

    def generate_quiz(self, topic: str, difficulty: str, num_questions: int = 5) -> List[Dict]:
        if self.has_gemini:
            prompt = f"""
            Generate {num_questions} {difficulty} level quiz questions about {topic}.
            Return ONLY a valid JSON array of objects. Each object must have:
            - id: a unique string
            - question: string
            - options: array of 4 strings
            - correct_answer: string (must be one of the options)
            - explanation: string
            - topic: "{topic}"
            - difficulty: "{difficulty}"
            """
            response = self._call_gemini(prompt)

            if response:
                questions_data = self._parse_gemini_json(response)
                if questions_data:
                    return questions_data
        
        # Fallback to hardcoded
        all_quizzes = self._generate_comprehensive_quizzes()
        topic_quizzes = all_quizzes.get(topic, {})
        difficulty_quizzes = topic_quizzes.get(difficulty, [])
        
        selected_questions = difficulty_quizzes[:num_questions]
        return [asdict(q) for q in selected_questions]

    def _generate_comprehensive_quizzes(self):
        # ... (Keeping the hardcoded quizzes for now as per original app.py)
        # In a real app, these should probably be in the DB too
        return {
            "python": {
                "easy": [
                    QuizQuestion(
                        id="py_easy_1",
                        question="What is the output of print(2 + 3 * 4)?",
                        options=["20", "14", "24", "Error"],
                        correct_answer="14",
                        explanation="Python follows PEMDAS order of operations: multiplication before addition.",
                        topic="python",
                        difficulty="easy"
                    ),
                    QuizQuestion(
                        id="py_easy_2",
                        question="What keyword is used to define a function in Python?",
                        options=["function", "def", "define", "func"],
                        correct_answer="def",
                        explanation="The 'def' keyword is used to define functions in Python.",
                        topic="python",
                        difficulty="easy"
                    )
                ],
                "medium": [
                    QuizQuestion(
                        id="py_medium_1",
                        question="What does the 'self' parameter represent in Python class methods?",
                        options=["The class itself", "The instance of the class", "A reference to the parent class", "A static method indicator"],
                        correct_answer="The instance of the class",
                        explanation="The 'self' parameter refers to the instance of the class.",
                        topic="python",
                        difficulty="medium"
                    )
                ],
                "hard": [
                    QuizQuestion(
                        id="py_hard_1",
                        question="What is the time complexity of searching in a Python dictionary?",
                        options=["O(1)", "O(n)", "O(log n)", "O(n²)"],
                        correct_answer="O(1)",
                        explanation="Python dictionaries use hash tables, providing average O(1) time complexity for lookups.",
                        topic="python",
                        difficulty="hard"
                    )
                ]
            },
            "javascript": {
                "easy": [
                    QuizQuestion(
                        id="js_easy_1",
                        question="Which keyword is used to declare a variable in modern JavaScript?",
                        options=["var", "let", "const", "all of the above"],
                        correct_answer="all of the above",
                        explanation="JavaScript has three variable declaration keywords: var, let, and const.",
                        topic="javascript",
                        difficulty="easy"
                    )
                ]
            },
            "react": {
                "easy": [
                    QuizQuestion(
                        id="react_easy_1",
                        question="What is JSX in React?",
                        options=["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A database query language"],
                        correct_answer="A syntax extension for JavaScript",
                        explanation="JSX is a syntax extension that allows writing HTML-like code in JavaScript.",
                        topic="react",
                        difficulty="easy"
                    )
                ]
            }
        }

    def submit_quiz_answers(self, questions: List[Dict], answers: Dict) -> Dict:
        score = 0
        results = []
        
        for question in questions:
            question_id = question['id']
            user_answer = answers.get(question_id)
            correct_answer = question['correct_answer']
            is_correct = user_answer == correct_answer
            
            if is_correct:
                score += 1
            
            results.append({
                'question_id': question_id,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'explanation': question['explanation']
            })
        
        percentage = (score / len(questions)) * 100 if questions else 0
        
        return {
            'score': score,
            'total_questions': len(questions),
            'percentage': percentage,
            'results': results
        }

    def create_study_plan(self, user_id: str, plan_data: Dict) -> StudyPlan:
        topic = plan_data.get('topic', 'General Studies')
        
        target_days = plan_data.get('target_days')
        if target_days:
            days_available = int(target_days)
            deadline_date = datetime.now() + timedelta(days=days_available)
            deadline = deadline_date.isoformat()
        else:
            deadline = plan_data.get('deadline')
            deadline_date = datetime.fromisoformat(deadline)
            days_available = (deadline_date - datetime.now()).days
            
        daily_hours = plan_data.get('daily_hours')
        if daily_hours:
            daily_hours = float(daily_hours)
            total_hours = int(daily_hours * max(days_available, 1))
        else:
            total_hours = plan_data.get('hours_available', 10)
            daily_hours = total_hours / max(days_available, 1)
        
        plan = StudyPlan(
            id=str(uuid.uuid4()),
            user_id=user_id,
            topic=topic,
            total_hours=total_hours,
            daily_hours=round(daily_hours, 1),
            weekly_goals=self._generate_weekly_goals(topic, days_available),
            resources=self._get_recommended_resources(topic),
            assessment_schedule=self._generate_assessment_schedule(days_available),
            deadline=deadline,
            created_at=datetime.now().isoformat()
        )
        
        self.db.save_study_plan(plan)
        return plan

    def _parse_gemini_json(self, response_text: str) -> Optional[Any]:
        try:
            # Remove markdown code blocks
            cleaned_text = response_text.replace('```json', '').replace('```', '').strip()
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            print(f"Failed to decode Gemini response: {response_text}")
            return None

    def _generate_weekly_goals(self, topic: str, total_days: int) -> List[Dict]:
        weeks = max(1, min(total_days // 7, 12))
        
        if self.has_gemini:
            prompt = f"""
            Create a {weeks}-week study plan for {topic}.
            Return ONLY a valid JSON array of objects. Each object must have:
            - week: integer (1, 2, etc.)
            - theme: string (Main topic for the week)
            - goals: array of strings (Specific learning objectives)
            Example: [{{"week": 1, "theme": "Basics", "goals": ["Learn syntax", "Variables"]}}]
            """
            response = self._call_gemini(prompt)
            if response:
                goals = self._parse_gemini_json(response)
                if isinstance(goals, list) and len(goals) > 0:
                    return goals[:weeks]

        # Fallback
        goals = []
        topic_goals = {
            "python": [
                {"theme": "Python Basics", "goals": ["Install Python", "Variables & Data Types", "Basic Operators"]},
                {"theme": "Control Flow", "goals": ["If/Else Statements", "For/While Loops", "List Comprehensions"]},
                {"theme": "Data Structures", "goals": ["Lists & Tuples", "Dictionaries & Sets", "String Manipulation"]},
                {"theme": "Functions", "goals": ["Defining Functions", "Arguments & Return Values", "Lambda Functions"]},
                {"theme": "OOP Basics", "goals": ["Classes & Objects", "Inheritance", "Methods"]},
                {"theme": "File Handling", "goals": ["Reading Files", "Writing Files", "Context Managers"]},
                {"theme": "Modules & Packages", "goals": ["Importing Modules", "Standard Library", "Pip & Virtualenvs"]},
                {"theme": "Final Project", "goals": ["Plan Project", "Implement Features", "Testing & Debugging"]}
            ],
            "javascript": [
                {"theme": "JS Fundamentals", "goals": ["Variables (let/const)", "Data Types", "Operators"]},
                {"theme": "Logic & Loops", "goals": ["Conditionals", "Loops", "Functions"]},
                {"theme": "DOM Manipulation", "goals": ["Selecting Elements", "Event Listeners", "Modifying Styles"]},
                {"theme": "ES6+ Features", "goals": ["Arrow Functions", "Destructuring", "Template Literals"]},
                {"theme": "Async JS", "goals": ["Callbacks", "Promises", "Async/Await"]},
                {"theme": "APIs", "goals": ["Fetch API", "JSON Parsing", "Error Handling"]},
                {"theme": "Modern Tooling", "goals": ["NPM Basics", "Modules", "Webpack/Vite concepts"]},
                {"theme": "Project Week", "goals": ["Build a To-Do App", "Code Review", "Refactoring"]}
            ]
        }
        
        specific_goals = topic_goals.get(topic.lower(), [])
        
        for i in range(weeks):
            week_num = i + 1
            if i < len(specific_goals):
                goals.append({
                    "week": week_num,
                    "theme": specific_goals[i]["theme"],
                    "goals": specific_goals[i]["goals"]
                })
            else:
                goals.append({
                    "week": week_num,
                    "theme": f"Advanced {topic} Concepts",
                    "goals": ["Deep Dive", "Practice Problems", "Mini Project"]
                })
        
        return goals

    def _get_recommended_resources(self, topic: str) -> List[str]:
        if self.has_gemini:
            prompt = f"""
            Suggest 3-5 high-quality study resources for {topic}.
            Return ONLY a valid JSON array of strings.
            Example: ["Resource 1", "Resource 2"]
            """
            response = self._call_gemini(prompt)
            if response:
                resources = self._parse_gemini_json(response)
                if resources and isinstance(resources, list):
                    return resources
        
        return [f"{topic} Official Documentation", f"{topic} for Beginners", f"Advanced {topic} Concepts"]

    def generate_flashcards(self, topic: str, count: int = 5) -> List[Dict]:
        if self.has_gemini:
            prompt = f"""
            Create {count} flashcards for the topic "{topic}".
            Return ONLY a valid JSON array of objects. Each object must have:
            - front: string (the question or term)
            - back: string (the answer or definition)
            Example: [{{"front": "Term", "back": "Definition"}}]
            """
            response = self._call_gemini(prompt)
            if response:
                return self._parse_gemini_json(response)
        
        # Fallback
        return [
            {"front": f"What is {topic}?", "back": f"A key concept in {topic}."},
            {"front": "Key Term 1", "back": "Definition of key term 1."},
            {"front": "Key Term 2", "back": "Definition of key term 2."}
        ]

    def _generate_assessment_schedule(self, total_days: int) -> List[str]:
        weeks = total_days // 7
        assessments = []
        
        for week in range(1, weeks + 1):
            if week % 2 == 0:
                assessments.append(f"Week {week} Progress Quiz")
            if week % 4 == 0:
                assessments.append(f"Week {week} Project Review")
        
        if weeks >= 8:
            assessments.append("Final Comprehensive Assessment")
        
        return assessments

    def get_study_plans(self, user_id: str) -> List[StudyPlan]:
        return self.db.get_study_plans(user_id)

    def delete_study_plan(self, user_id: str, plan_id: str) -> bool:
        return self.db.delete_study_plan(plan_id, user_id)

    def get_progress_stats(self, user_id: str) -> Dict:
        sessions = self.db.get_study_sessions(user_id)
        
        total_study_time = sum(session.duration for session in sessions)
        sessions_completed = len(sessions)
        questions_asked = sum(session.questions_asked for session in sessions)
        average_confidence = sum(session.confidence_level for session in sessions) / sessions_completed if sessions_completed > 0 else 0
        
        topic_distribution = {}
        for session in sessions:
            topic = session.topic
            topic_distribution[topic] = topic_distribution.get(topic, 0) + session.duration
        
        return {
            'total_study_time': total_study_time,
            'sessions_completed': sessions_completed,
            'questions_asked': questions_asked,
            'average_confidence': round(average_confidence, 1),
            'topic_distribution': topic_distribution
        }

    def get_motivational_message(self) -> str:
        messages = [
            "Great job on your study session! Every minute counts towards your goals! 🌟",
            "Consistency is key! You're building valuable knowledge with each study session. 💪",
            "Remember why you started! Your future self will thank you for this effort. 🎯",
            "Learning is a journey. Celebrate your progress, no matter how small! 🎉",
            "You're developing skills that will open new opportunities. Keep going! 🚀",
            "The expert in anything was once a beginner. Keep pushing forward! 🌈",
            "Every question you ask brings you closer to mastery. Stay curious! 🔍",
            "You're not just studying - you're building your future self! 🌠",
            "Small progress is still progress. Keep that momentum going! ⚡",
            "Your brain is getting stronger with every study session! 🧠"
        ]
        return random.choice(messages)
