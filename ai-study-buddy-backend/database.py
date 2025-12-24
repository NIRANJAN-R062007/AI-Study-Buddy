import sqlite3
import json
from typing import Optional, Dict, List
from models import UserProfile, StudySession, StudyPlan
from config import Config

class Database:
    def __init__(self):
        self.db_path = Config.DB_PATH
        self.init_db()

    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                learning_style TEXT DEFAULT 'visual',
                preferred_topics TEXT DEFAULT '[]',
                difficulty_level TEXT DEFAULT 'beginner',
                study_goals TEXT DEFAULT '[]',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Study sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                topic TEXT NOT NULL,
                duration INTEGER NOT NULL,
                materials_covered TEXT,
                questions_asked INTEGER DEFAULT 0,
                confidence_level INTEGER,
                start_time TEXT,
                end_time TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Study plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_plans (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                topic TEXT NOT NULL,
                total_hours INTEGER,
                daily_hours REAL,
                weekly_goals TEXT,
                resources TEXT,
                assessment_schedule TEXT,
                deadline TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Quiz progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                question_id TEXT NOT NULL,
                performance TEXT,
                next_review TEXT,
                review_count INTEGER DEFAULT 0,
                interval_days INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def create_user(self, user_data: Dict) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO users (id, email, password_hash, name)
                VALUES (?, ?, ?, ?)
            ''', (user_data['id'], user_data['email'], user_data['password'], user_data['name']))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                'id': row[0], 'email': row[1], 'password': row[2], 'name': row[3],
                'learning_style': row[4], 'preferred_topics': json.loads(row[5]),
                'difficulty_level': row[6], 'study_goals': json.loads(row[7])
            }
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                'id': row[0], 'email': row[1], 'password': row[2], 'name': row[3],
                'learning_style': row[4], 'preferred_topics': json.loads(row[5]),
                'difficulty_level': row[6], 'study_goals': json.loads(row[7])
            }
        return None

    def update_user_profile(self, user_id: str, profile_data: Dict):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Fetch current profile to merge
        current = self.get_user_by_id(user_id)
        if not current:
            return None

        # Update fields
        learning_style = profile_data.get('learning_style', current['learning_style'])
        preferred_topics = json.dumps(profile_data.get('preferred_topics', current['preferred_topics']))
        difficulty_level = profile_data.get('difficulty_level', current['difficulty_level'])
        study_goals = json.dumps(profile_data.get('study_goals', current['study_goals']))
        
        cursor.execute('''
            UPDATE users 
            SET learning_style = ?, preferred_topics = ?, difficulty_level = ?, study_goals = ?
            WHERE id = ?
        ''', (learning_style, preferred_topics, difficulty_level, study_goals, user_id))
        conn.commit()
        conn.close()
        return self.get_user_by_id(user_id)

    def save_study_session(self, session: StudySession):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO study_sessions 
            (id, user_id, topic, duration, materials_covered, questions_asked, confidence_level, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (session.id, session.user_id, session.topic, session.duration, json.dumps(session.materials_covered), 
              session.questions_asked, session.confidence_level, session.start_time, session.end_time))
        conn.commit()
        conn.close()

    def get_study_sessions(self, user_id: str) -> List[StudySession]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM study_sessions WHERE user_id = ?', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        sessions = []
        for row in rows:
            sessions.append(StudySession(
                id=row[0],
                user_id=row[1],
                topic=row[2],
                duration=row[3],
                materials_covered=json.loads(row[4]) if row[4] else [],
                questions_asked=row[5],
                confidence_level=row[6],
                start_time=row[7],
                end_time=row[8]
            ))
        return sessions

    def get_study_session(self, session_id: str) -> Optional[StudySession]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM study_sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return StudySession(
                id=row[0],
                user_id=row[1],
                topic=row[2],
                duration=row[3],
                materials_covered=json.loads(row[4]) if row[4] else [],
                questions_asked=row[5],
                confidence_level=row[6],
                start_time=row[7],
                end_time=row[8]
            )
        return None

    def save_study_plan(self, plan: StudyPlan):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO study_plans 
            (id, user_id, topic, total_hours, daily_hours, weekly_goals, resources, assessment_schedule, deadline, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (plan.id, plan.user_id, plan.topic, plan.total_hours, plan.daily_hours, 
              json.dumps(plan.weekly_goals), json.dumps(plan.resources), json.dumps(plan.assessment_schedule), 
              plan.deadline, plan.created_at))
        conn.commit()
        conn.close()

    def get_study_plans(self, user_id: str) -> List[StudyPlan]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM study_plans WHERE user_id = ?', (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        plans = []
        for row in rows:
            plans.append(StudyPlan(
                id=row[0],
                user_id=row[1],
                topic=row[2],
                total_hours=row[3],
                daily_hours=row[4],
                weekly_goals=json.loads(row[5]) if row[5] else [],
                resources=json.loads(row[6]) if row[6] else [],
                assessment_schedule=json.loads(row[7]) if row[7] else [],
                deadline=row[8],
                created_at=row[9]
            ))
        return plans

    def delete_study_plan(self, plan_id: str, user_id: str) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM study_plans WHERE id = ? AND user_id = ?', (plan_id, user_id))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()
        return rows_affected > 0