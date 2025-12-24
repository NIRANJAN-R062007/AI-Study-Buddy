
import sys
import os
import uuid
from datetime import datetime

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

from services import AIStudyBuddyBackend
from models import StudyPlan

def test_delete_study_plan():
    print("Initializing Backend...")
    backend = AIStudyBuddyBackend()
    user_id = "test_user_delete"
    
    # 1. Create a dummy plan
    print("\nCreating dummy plan...")
    plan_data = {
        "topic": "Delete Me",
        "daily_hours": 1,
        "target_days": 7
    }
    plan = backend.create_study_plan(user_id, plan_data)
    print(f"Plan created with ID: {plan.id}")
    
    # 2. Verify it exists
    plans = backend.get_study_plans(user_id)
    if any(p.id == plan.id for p in plans):
        print("Plan found in database.")
    else:
        print("ERROR: Plan not found after creation!")
        return

    # 3. Delete the plan
    print(f"\nDeleting plan {plan.id}...")
    success = backend.delete_study_plan(user_id, plan.id)
    if success:
        print("Delete operation returned success.")
    else:
        print("ERROR: Delete operation returned failure!")
        return

    # 4. Verify it's gone
    plans_after = backend.get_study_plans(user_id)
    if not any(p.id == plan.id for p in plans_after):
        print("Plan successfully removed from database.")
    else:
        print("ERROR: Plan still exists in database!")

if __name__ == "__main__":
    test_delete_study_plan()
