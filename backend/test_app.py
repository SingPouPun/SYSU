import tempfile
import unittest
from pathlib import Path

from backend.app import User, create_app, db
from werkzeug.security import generate_password_hash


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
        response = self.client.post(
            "/api/auth/register",
            json={"username": "测试同学", "password": "password123", "province": "广东省", "city": "广州"},
            headers={"X-CSRF-Token": token},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["user"]["province"], "广东省")
        response = self.client.post(
            "/api/messages",
            json={"content": "山高水长", "visibility": "private"},
            headers={"X-CSRF-Token": token},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["message"]["emotion"], "calm")
        self.assertEqual(response.get_json()["message"]["visibility"], "private")
        self.assertTrue(response.get_json()["message"]["emoticon"])
        self.assertEqual(self.client.get("/api/messages").get_json()["count"], 1)
        duplicate = self.client.post("/api/messages", json={"content": "第二条"}, headers={"X-CSRF-Token": token})
        self.assertEqual(duplicate.status_code, 409)

        dashboard = self.client.get("/api/dashboard")
        self.assertEqual(dashboard.status_code, 403)

        with self.app.app_context():
            user = db.session.scalar(db.select(User).where(User.username == "测试同学"))
            user.is_admin = True
            user.password_hash = generate_password_hash("password123")
            db.session.commit()

        dashboard = self.client.get("/api/dashboard")
        self.assertEqual(dashboard.status_code, 200)
        dashboard_data = dashboard.get_json()
        self.assertEqual(dashboard_data["counts"]["users"], 1)
        self.assertEqual(dashboard_data["counts"]["messages"], 1)
        self.assertEqual(dashboard_data["provinces"][0]["name"], "广东省")
        self.assertNotIn("password_hash", str(dashboard_data))

    def test_private_message_is_hidden_from_visitors_but_counts_toward_goal(self):
        token = self.csrf()
        register = self.client.post(
            "/api/auth/register",
            json={"username": "隐私同学", "password": "password123", "province": "广东省", "city": "深圳"},
            headers={"X-CSRF-Token": token},
        )
        self.assertEqual(register.status_code, 201)

        created = self.client.post(
            "/api/messages",
            json={"content": "只把这句话留给自己", "visibility": "private"},
            headers={"X-CSRF-Token": token},
        )
        self.assertEqual(created.status_code, 201)
        owner_listing = self.client.get("/api/messages").get_json()
        self.assertEqual(owner_listing["count"], 1)
        self.assertEqual(len(owner_listing["messages"]), 1)

        logout = self.client.post("/api/auth/logout", headers={"X-CSRF-Token": token})
        self.assertEqual(logout.status_code, 200)
        visitor_listing = self.client.get("/api/messages").get_json()
        self.assertEqual(visitor_listing["count"], 1)
        self.assertEqual(visitor_listing["messages"], [])


if __name__ == "__main__":
    unittest.main()
