
from datetime import date


def calculate_goal_status(goal):
    """
    Weight Loss is completed when current weight
    reaches or goes below the target.

    Muscle Gain and Steps are completed when
    current value reaches or exceeds the target.
    """

    if goal.goal_type == "Weight Loss":
        completed = goal.current_value <= goal.target_value
    else:
        completed = goal.current_value >= goal.target_value

    if completed:
        return "COMPLETED"

    if goal.deadline < date.today():
        return "OVERDUE"

    return "IN_PROGRESS"


def calculate_progress_percentage(goal):
    """
    Calculate progress using the starting value.
    """

    if goal.goal_type == "Weight Loss":
        difference = goal.starting_value - goal.target_value

        if difference <= 0:
            return 100.0 if goal.current_value <= goal.target_value else 0.0

        progress = (
            (goal.starting_value - goal.current_value) / difference
        ) * 100

    else:
        if goal.target_value <= 0:
            return 0.0

        progress = (goal.current_value / goal.target_value) * 100

    return round(max(0.0, min(progress, 100.0)), 2)


def update_goal_status(goal):
    goal.status = calculate_goal_status(goal)
    return goal
