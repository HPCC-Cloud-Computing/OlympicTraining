from realtime_server import app, db
from realtime_server.api_token_auth.models import User

db.create_all()
with app.app_context():
    admin = User(username='admin')
    admin.hash_password('bkcloud')
    db.session.add(admin)
    db.session.commit()
