import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class CurrentUser(BaseModel):
    id: str
    email: str


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1)
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not (
            re.search(r"[A-Z]", value)
            and re.search(r"[a-z]", value)
            and re.search(r"[0-9]", value)
            and re.search(r"[!@#$%^&*]", value)
        ):
            raise ValueError(
                "Password must be at least 8 characters and include uppercase, "
                "lowercase, number and special character."
            )
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
