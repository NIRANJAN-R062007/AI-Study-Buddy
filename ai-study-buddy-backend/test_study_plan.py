
import sys
import os
from datetime import datetime

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

from services import AIStudyBuddyBackend
from config import Config

def test_generate_study_plan():
    print("Initializing Backend...")
    backend = AIStudyBuddyBackend()
    
    user_id = "test_user_1"
    plan_data = {
        "topic": "Advanced Python",
        "daily_hours": 2,
        "target_days": 14
    }
    
    print(f"Generating plan for: {plan_data}")
    try:
        plan = backend.create_study_plan(user_id, plan_data)
        print("\nPlan Generated Successfully!")
        print(f"ID: {plan.id}")
        print(f"Topic: {plan.topic}")
        print(f"Total Hours: {plan.total_hours}")
        print(f"Daily Hours: {plan.daily_hours}")
        print(f"Weekly Goals ({len(plan.weekly_goals)}):")
        for goal in plan.weekly_goals:
            print(f" - {goal}")
        print(f"Resources ({len(plan.resources)}):")
        for res in plan.resources:
            print(f" - {res}")
            
    except Exception as e:
        print(f"\nError generating plan: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generate_study_plan()
