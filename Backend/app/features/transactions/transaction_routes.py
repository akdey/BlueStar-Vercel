from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from app.features.transactions.transaction_schema import TransactionCreate, TransactionResponse
from app.features.transactions.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions (Ledger)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_transaction(txn_in: TransactionCreate, request: Request):
    """
    Record a financial transaction (Sale, Purchase, Payment).
    Automatically updates the Party's balance.
    """
    # Extract user from middleware state if available
    user_id = None
    if hasattr(request.state, "user") and request.state.user:
        user_id = request.state.user.get("id")
        
    txn = await TransactionService.create_transaction(txn_in, user_id=user_id)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True,
            "message": "Transaction recorded successfully",
            "data": txn.model_dump(mode='json')
        }
    )

@router.get("/")
async def get_all_transactions(skip: int = 0, limit: int = 100):
    txns = await TransactionService.get_all_transactions(skip, limit)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(txns)} transactions",
            "data": [t.model_dump(mode='json') for t in txns],
            "pagination": {"skip": skip, "limit": limit, "count": len(txns)}
        }
    )

@router.get("/party/{party_id}")
async def get_party_transactions(party_id: int, skip: int = 0, limit: int = 100):
    txns = await TransactionService.get_transactions_by_party(party_id, skip, limit)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(txns)} records for party {party_id}",
            "data": [t.model_dump(mode='json') for t in txns]
        }
    )
