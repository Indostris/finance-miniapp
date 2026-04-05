from sqlalchemy import (
    Column, BigInteger, Integer, Numeric, Text, Date, ForeignKey, CheckConstraint
)
from sqlalchemy import TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(BigInteger, primary_key=True)   # Telegram user_id
    username   = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    accounts     = relationship("Account",     back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class Account(Base):
    __tablename__ = "accounts"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    name       = Column(Text, nullable=False)        # "TBC", "Visa", "Cash"
    currency   = Column(Text, default="UZS")
    balance    = Column(Numeric(15, 2), default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user         = relationship("User",        back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")


class Category(Base):
    __tablename__ = "categories"

    id    = Column(Integer, primary_key=True, autoincrement=True)
    key   = Column(Text, unique=True, nullable=False)   # "food", "transport" …
    label = Column(Text)                                 # "Meal", "Transport" …
    icon  = Column(Text)                                 # "🍔"
    color = Column(Text)                                 # "#6155F5"

    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("type   IN ('expense','income','transfer')", name="chk_tx_type"),
        CheckConstraint("source IN ('manual','ai','voice')",         name="chk_tx_source"),
    )

    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(BigInteger, ForeignKey("users.id",    ondelete="CASCADE"))
    account_id  = Column(Integer,    ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer,    ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    type        = Column(Text, nullable=False, default="expense")
    amount      = Column(Numeric(15, 2), nullable=False)
    note        = Column(Text, nullable=True)
    source      = Column(Text, nullable=False, default="manual")   # how it was added
    date        = Column(Date, server_default=func.current_date())
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user            = relationship("User",           back_populates="transactions")
    account         = relationship("Account",        back_populates="transactions")
    category        = relationship("Category",       back_populates="transactions")
    transfer_detail = relationship("TransferDetail", back_populates="transaction", uselist=False)


class TransferDetail(Base):
    """Stores the destination account for transfer transactions."""
    __tablename__ = "transfer_details"

    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), primary_key=True)
    to_account_id  = Column(Integer, ForeignKey("accounts.id",     ondelete="SET NULL"))

    transaction = relationship("Transaction", back_populates="transfer_detail")
