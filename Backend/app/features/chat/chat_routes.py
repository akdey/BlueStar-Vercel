from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.features.chat.chat_schema import ChatRequest, ChatResponse
from app.features.chat.chat_service import ChatService
from app.features.auth.auth_dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["Enterprise Chat"])

# Lazy initialization
_chat_service = None

def get_chat_service():
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service

@router.post("/", response_model=ChatResponse)
async def enterprise_chat(request: ChatRequest, current_user = Depends(get_current_user)):
    """
    Ask a question about the business data. 
    Strictly restricted to internal application data.
    """
    try:
        chat_service = get_chat_service()
        
        # Convert history format for service
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        response_text = await chat_service.get_response(request.message, history)
        
        return ChatResponse(response=response_text)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ChatResponse(
            response=f"I encountered an error while processing your request: {str(e)}",
            success=False
        )
