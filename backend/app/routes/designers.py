import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db

router = APIRouter(prefix="/api/designers", tags=["designers"])


@router.get("/digital-employees", response_model=list[schemas.DigitalEmployeeOut])
def digital_employees(db: Session = Depends(get_db)):
    return list(db.scalars(select(models.DigitalEmployee).order_by(models.DigitalEmployee.name)))
