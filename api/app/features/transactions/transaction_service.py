import enum
from fastapi import HTTPException, status
from typing import Optional
from app.features.transactions.transaction_repository import TransactionRepository
from app.features.transactions.transaction_schema import TransactionCreate, TransactionResponse
from app.features.transactions.transaction_entity import TransactionType, TransactionStatus
from app.features.parties.party_repository import PartyRepository
from app.features.parties.party_entity import Party
from app.features.parties.party_schema import PartyUpdate
from app.features.vouchers.voucher_repository import VoucherRepository
from app.core.logger import logger

class TransactionService:
    @staticmethod
    async def create_transaction(txn_in: TransactionCreate, user_id: Optional[int] = None) -> TransactionResponse:
        # 1. Validate Party if provided
        if txn_in.party_id:
            party = await PartyRepository.get_by_id(txn_in.party_id)
            if not party:
                raise HTTPException(status_code=404, detail="Party not found")
        
        # 2. Validate Voucher if provided
        if txn_in.voucher_id:
            voucher = await VoucherRepository.get_by_id(txn_in.voucher_id)
            if not voucher:
                raise HTTPException(status_code=404, detail="Voucher not found")
        
        # 3. Create the Transaction Record
        # We assume status is COMPLETED for now to affect balance immediately
        new_txn = await TransactionRepository.create(txn_in, created_by=user_id)
        
        # 3. Update Party Balance (Ledger Logic)
        # Assuming: Positive Balance = Receivable (Asset), Negative = Payable (Liability)
        # This is a simplification. Usually separate Debit/Credit columns are used.
        # But for 'Current Balance':
        
        if txn_in.party_id and new_txn.status == TransactionStatus.COMPLETED:
            await TransactionService._update_party_balance(txn_in.party_id, txn_in.transaction_type, txn_in.amount)
        
        return TransactionResponse.model_validate(new_txn)

    @staticmethod
    async def _update_party_balance(party_id: int, type: TransactionType, amount: float):
        party = await PartyRepository.get_by_id(party_id)
        if not party:
            return

        current_bal = party.current_balance
        
        # Logic: 
        # SALE -> We sold goods -> Party owes us more -> Balance Increases (+)
        # PURCHASE -> We bought goods -> We owe party -> Balance Decreases (-)
        # PAYMENT_IN -> Party paid us -> Party owes us less -> Balance Decreases (-)
        # PAYMENT_OUT -> We paid party -> We owe less (or they owe us more) -> Balance Increases (+)
        
        if type == TransactionType.SALE:
            current_bal += amount
        elif type == TransactionType.PURCHASE:
            current_bal -= amount
        elif type == TransactionType.PAYMENT_IN:
            # Customer paying us reduces their debt
            current_bal -= amount
        elif type == TransactionType.PAYMENT_OUT:
            # We paying supplier reduces our debt (makes balance more positive/less negative)
            current_bal += amount
            
        await PartyRepository.update(party_id, PartyUpdate(current_balance=current_bal))
        logger.info(f"Updated Party {party.name} balance to {current_bal}")

    @staticmethod
    async def get_all_transactions(skip: int = 0, limit: int = 100):
        txns = await TransactionRepository.get_all(skip, limit)
        return [TransactionResponse.model_validate(t) for t in txns]
    
    @staticmethod
    async def get_transactions_by_party(party_id: int, skip: int = 0, limit: int = 100):
        txns = await TransactionRepository.get_by_party(party_id, skip, limit)
        return [TransactionResponse.model_validate(t) for t in txns]
