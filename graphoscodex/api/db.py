"""GraphosCodex — Supabase client (mesmo padrão da Hermeneia)."""
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(override=True)


def get_supabase():
    """Service role key preferida; cai pra publishable em dev."""
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_KEY"]
    return create_client(os.environ["SUPABASE_URL"], key)
