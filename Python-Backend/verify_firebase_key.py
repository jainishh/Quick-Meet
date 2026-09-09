import os
import base64
import json
import re
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def check_key():
    b64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")
    if not b64:
        print("RESULT: ENV_VAR_MISSING")
        return

    try:
        decoded = base64.b64decode(b64).decode('utf-8')
        cred_dict = json.loads(decoded)
        pk = cred_dict.get("private_key", "")
        
        has_literal_n = "\\n" in pk
        content = pk.replace("\\n", "\n").replace("\\r", "")
        body = content
        for marker in ["-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----", "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----"]:
            body = body.replace(marker, "")
        clean_body = "".join(body.split())
        
        valid_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        invalid_chars = [c for c in clean_body if c not in valid_chars]
        
        len_mod_4 = len(clean_body) % 4
        
        header = "-----BEGIN PRIVATE KEY-----"
        footer = "-----END PRIVATE KEY-----"
        NL = "\n"
        folded_lines = [clean_body[i:i+64] for i in range(0, len(clean_body), 64)]
        final_pk = f"{header}{NL}{NL.join(folded_lines)}{NL}{footer}{NL}"
        
        crypto_ok = False
        try:
            serialization.load_pem_private_key(final_pk.encode('utf-8'), password=None, backend=default_backend())
            crypto_ok = True
        except:
            pass
            
        print(f"RESULT: PK_LEN={len(pk)}, LITERAL_N={has_literal_n}, BODY_LEN={len(clean_body)}, MOD4={len_mod_4}, INVALID_CHARS={len(invalid_chars)}, CRYPTO_OK={crypto_ok}")
        if len(clean_body) > 10:
            print(f"HEX_START: {clean_body[:10].encode('utf-8').hex()}")
            print(f"HEX_END: {clean_body[-10:].encode('utf-8').hex()}")
        if invalid_chars:
            print(f"INVALID: {repr(list(set(invalid_chars)))}")
            
    except Exception as e:
        print(f"RESULT: ERROR={type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    check_key()

if __name__ == "__main__":
    check_key()
