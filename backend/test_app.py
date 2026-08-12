import tempfile
import unittest
from pathlib import Path

from backend.app import create_app, db


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database_path = (Path(self.temp_dir.name) / "test.db").as_posix()
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path}",
            "SECRET_KEY": "test",
        })
        self.client = self.app.test_client()
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.engine.dispose()
        self.temp_dir.cleanup()

    def csrf(self):
        return self.client.get("/api/csrf-token").get_json()["csrf_token"]

    def test_register_login_and_single_message(self):
        token = self.csrf()
        response = self.client.post("/api/auth/register", json={"username": "测试同学", "password": "password123"}, headers={"X-CSRF-Token": token})
        self.assertEqual(response.status_code, 201)
        response = self.client.post("/api/messages", json={"content": "山高水长"}, headers={"X-CSRF-Token": token})
        self.assertEqual(response.status_code, 201)
        duplicate = self.client.post("/api/messages", json={"content": "第二条"}, headers={"X-CSRF-Token": token})
        self.assertEqual(duplicate.status_code, 409)


if __name__ == "__main__":
    unittest.main()
