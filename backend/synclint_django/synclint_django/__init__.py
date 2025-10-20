import threading
import psycopg2
from psycopg2 import sql
from django.core.management import call_command
from django.db import connection
from django.conf import settings


def ensure_database_exists():
    """
    Mengecek apakah database sudah ada, kalau belum maka membuatnya.
    """
    db_settings = settings.DATABASES["default"]
    dbname = db_settings["NAME"]
    user = db_settings["USER"]
    password = db_settings["PASSWORD"]
    host = db_settings["HOST"]
    port = db_settings["PORT"]

    try:
        # Coba konek langsung ke database target
        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )
        conn.close()
        print(f"✅ Database '{dbname}' sudah ada.")
    except psycopg2.OperationalError:
        print(f"⚙️  Database '{dbname}' belum ada — membuat database baru...")
        try:
            # Koneksi ke database default 'postgres'
            conn = psycopg2.connect(
                dbname="postgres", user="postgres", password=password, host=host, port=port
            )
            conn.autocommit = True
            cur = conn.cursor()

            # Buat user jika belum ada
            cur.execute(
                sql.SQL("DO $$ BEGIN CREATE ROLE {user} WITH LOGIN PASSWORD %s; EXCEPTION WHEN duplicate_object THEN NULL; END $$;")
                .format(user=sql.Identifier(user)),
                [password],
            )

            # Buat database jika belum ada
            cur.execute(
                sql.SQL("DO $$ BEGIN CREATE DATABASE {db} OWNER {user}; EXCEPTION WHEN duplicate_database THEN NULL; END $$;")
                .format(db=sql.Identifier(dbname), user=sql.Identifier(user))
            )

            cur.close()
            conn.close()
            print(f"✅ Database '{dbname}' berhasil dibuat dan dimiliki oleh user '{user}'.")
        except Exception as e:
            print(f"❌ Gagal membuat database: {e}")


def check_and_apply_migrations():
    """
    Mengecek apakah tabel sudah ada di database.
    Jika belum, otomatis menjalankan makemigrations dan migrate.
    """
    ensure_database_exists()  # Pastikan database ada dulu
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'django_migrations'
                );
            """)
            exists = cursor.fetchone()[0]

        if not exists:
            print("⚙️  Tidak ada tabel di database — menjalankan migrasi awal...")
            call_command("makemigrations", interactive=False)
            call_command("migrate", interactive=False)
            print("✅ Migrasi otomatis selesai.")
        else:
            print("✅ Database sudah siap — tidak perlu migrasi.")
    except Exception as e:
        print(f"⚠️ Gagal memeriksa database: {e}")


# Jalankan di thread terpisah agar tidak menghambat startup server
threading.Thread(target=check_and_apply_migrations, daemon=True).start()
