"""
FastAPI Main Application
Configuração central da API Python
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.database import check_db_connection, init_db
from app.routers import auth, chat, dashboard, goals, lgpd, transactions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events - startup e shutdown
    """
    # Startup
    print("🚀 Starting PayWinApp API...")
    
    # Check database connection
    if check_db_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")
        raise Exception("Cannot connect to database")
    
    # Initialize database (create tables if needed)
    init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down PayWinApp API...")


# Create FastAPI app
app = FastAPI(
    title="PayWinApp API",
    description="API de Finanças Pessoais com Agente Conversacional",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware (production)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # Configure properly in production
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Verifica se a API está respondendo e o banco está acessível
    """
    db_healthy = check_db_connection()
    
    return JSONResponse(
        status_code=200 if db_healthy else 503,
        content={
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "service": "python-api",
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint
    """
    return {
        "message": "PayWinApp API - Finanças Pessoais com IA",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["Goals"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(lgpd.router, prefix="/api/v1/lgpd", tags=["LGPD"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Handler global para exceções não tratadas
    """
    # Log the error (não incluir dados sensíveis)
    print(f"Unexpected error: {type(exc).__name__}: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
