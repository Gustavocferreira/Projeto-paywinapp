from app.auth import get_password_hash, verify_password
from app.database import get_db
from app.models import User

# Buscar usuário no banco
db = next(get_db())
user = db.query(User).filter(User.email == "gustavocostaferreira@outlook.com.br").first()

if user:
    print(f"✅ Usuário encontrado: {user.email}")
    print(f"Hash armazenado: {user.hashed_password[:60]}...")
    
    # Testar senhas comuns que o usuário pode ter tentado
    senhas_teste = [
        "TesteSenha123",
        "Teste123",
        "teste123",
        "Gustavo123",
        "gustavo123",
    ]
    
    print("\n🔐 Testando senhas:")
    for senha in senhas_teste:
        resultado = verify_password(senha, user.hashed_password)
        print(f"  - '{senha}': {'✅ CORRETA' if resultado else '❌ INCORRETA'}")
    
    # Testar com nova hash
    print("\n🆕 Testando nova hash:")
    nova_senha = "NovaSenha123"
    novo_hash = get_password_hash(nova_senha)
    print(f"  Hash: {novo_hash[:60]}...")
    print(f"  Verifica: {verify_password(nova_senha, novo_hash)}")
else:
    print("❌ Usuário não encontrado")
