
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    User,
    FitnessProviderConnection,
    ExternalActivity,
)
from app.schemas import (
    FitnessProviderConnectionResponse,
    ExternalActivityImport,
    ExternalActivityResponse,
)

router = APIRouter(
    prefix="/api/v1/fitness-integrations",
    tags=["Third-Party Fitness Integration"]
)

ProviderType = Literal["health_connect", "apple_health"]


@router.get(
    "/providers",
    response_model=list[FitnessProviderConnectionResponse]
)
def get_connected_providers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(FitnessProviderConnection)
        .filter(
            FitnessProviderConnection.user_id == current_user.id
        )
        .order_by(FitnessProviderConnection.id.desc())
        .all()
    )


@router.post(
    "/providers/{provider}/connect",
    response_model=FitnessProviderConnectionResponse
)
def connect_provider(
    provider: ProviderType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connection = (
        db.query(FitnessProviderConnection)
        .filter(
            FitnessProviderConnection.user_id == current_user.id,
            FitnessProviderConnection.provider == provider,
        )
        .first()
    )

    if connection:
        connection.status = "connected"
        connection.connected_at = datetime.now(timezone.utc)
    else:
        connection = FitnessProviderConnection(
            user_id=current_user.id,
            provider=provider,
            status="connected",
        )
        db.add(connection)

    db.commit()
    db.refresh(connection)

    return connection


@router.post(
    "/providers/{provider}/disconnect",
    response_model=FitnessProviderConnectionResponse
)
def disconnect_provider(
    provider: ProviderType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connection = (
        db.query(FitnessProviderConnection)
        .filter(
            FitnessProviderConnection.user_id == current_user.id,
            FitnessProviderConnection.provider == provider,
        )
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider connection not found"
        )

    connection.status = "disconnected"

    db.commit()
    db.refresh(connection)

    return connection


@router.post(
    "/activities/import",
    response_model=ExternalActivityResponse,
    status_code=status.HTTP_201_CREATED
)
def import_external_activity(
    activity_data: ExternalActivityImport,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connection = (
        db.query(FitnessProviderConnection)
        .filter(
            FitnessProviderConnection.user_id == current_user.id,
            FitnessProviderConnection.provider == activity_data.provider,
            FitnessProviderConnection.status == "connected",
        )
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connect this fitness provider before importing activities."
        )

    existing_activity = (
        db.query(ExternalActivity)
        .filter(
            ExternalActivity.user_id == current_user.id,
            ExternalActivity.provider == activity_data.provider,
            ExternalActivity.external_record_id
            == activity_data.external_record_id,
        )
        .first()
    )

    if existing_activity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This activity has already been imported."
        )

    new_activity = ExternalActivity(
        user_id=current_user.id,
        provider=activity_data.provider,
        external_record_id=activity_data.external_record_id,
        activity_type=activity_data.activity_type,
        duration_seconds=activity_data.duration_seconds,
        calories_burned=activity_data.calories_burned,
        steps=activity_data.steps,
        distance_meters=activity_data.distance_meters,
        started_at=activity_data.started_at,
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


@router.get(
    "/activities",
    response_model=list[ExternalActivityResponse]
)
def get_external_activities(
    provider: ProviderType | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ExternalActivity).filter(
        ExternalActivity.user_id == current_user.id
    )

    if provider:
        query = query.filter(
            ExternalActivity.provider == provider
        )

    return (
        query
        .order_by(ExternalActivity.started_at.desc())
        .all()
    )
