from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parents[1]
db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    message = db.relationship("Message", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True, nullable=False)
    content = db.Column(db.String(80), nullable=False)
    is_demo = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    user = db.relationship("User", back_populates="message")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "content": self.content,
            "is_demo": self.is_demo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def create_app(test_config=None):
    app = Flask(__name__, static_folder=str(ROOT / "dist"), static_url_path="")
    app.config.update(
        SECRET_KEY=os.environ.get("SYSU_SECRET_KEY", "dev-only-change-me-before-deploy"),
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{(ROOT / 'instance' / 'sysu.db').as_posix()}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
    )
    if test_config:
        app.config.update(test_config)
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    db.init_app(app)

    def current_user():
        uid = session.get("user_id")
        return db.session.get(User, uid) if uid else None

    def payload():
        return request.get_json(silent=True) or {}

    def csrf_valid():
        token = request.headers.get("X-CSRF-Token", "")
        return bool(token and secrets.compare_digest(token, session.get("csrf_token", "")))

    @app.get("/api/csrf-token")
    def csrf_token():
        session.setdefault("csrf_token", secrets.token_urlsafe(32))
        return jsonify({"csrf_token": session["csrf_token"]})

    @app.post("/api/auth/register")
    def register():
        if not csrf_valid():
            return jsonify({"error": "请求校验失败，请刷新页面重试"}), 403
        data = payload()
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", ""))
        if not 3 <= len(username) <= 20:
            return jsonify({"error": "用户名需为3–20个字符"}), 400
        if not all(ch.isalnum() or ch in "_-" for ch in username):
            return jsonify({"error": "用户名只能包含文字、字母、数字、下划线或连字符"}), 400
        if len(password) < 8:
            return jsonify({"error": "密码至少需要8位"}), 400
        if db.session.scalar(select(User).where(User.username == username)):
            return jsonify({"error": "这个用户名已经被使用"}), 409
        user = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        session["user_id"] = user.id
        return jsonify({"user": {"id": user.id, "username": user.username, "has_message": False}}), 201

    @app.post("/api/auth/login")
    def login():
        if not csrf_valid():
            return jsonify({"error": "请求校验失败，请刷新页面重试"}), 403
        data = payload()
        username = str(data.get("username", "")).strip()
        user = db.session.scalar(select(User).where(User.username == username))
        if not user or not check_password_hash(user.password_hash, str(data.get("password", ""))):
            return jsonify({"error": "用户名或密码不正确"}), 401
        session["user_id"] = user.id
        return jsonify({"user": {"id": user.id, "username": user.username, "has_message": user.message is not None}})

    @app.post("/api/auth/logout")
    def logout():
        if not csrf_valid():
            return jsonify({"error": "请求校验失败"}), 403
        session.pop("user_id", None)
        return jsonify({"ok": True})

    @app.get("/api/auth/me")
    def me():
        user = current_user()
        if not user:
            return jsonify({"user": None})
        return jsonify({"user": {"id": user.id, "username": user.username, "has_message": user.message is not None}})

    @app.get("/api/messages")
    def messages():
        rows = db.session.scalars(select(Message).order_by(Message.created_at.desc())).all()
        return jsonify({"messages": [row.to_dict() for row in rows], "count": len(rows), "goal": 40})

    @app.post("/api/messages")
    def post_message():
        if not csrf_valid():
            return jsonify({"error": "请求校验失败，请刷新页面重试"}), 403
        user = current_user()
        if not user:
            return jsonify({"error": "请先登录再留下寄语"}), 401
        if user.message:
            return jsonify({"error": "每位同学只能留下一个珍贵的光点"}), 409
        content = str(payload().get("content", "")).strip()
        if not 1 <= len(content) <= 80:
            return jsonify({"error": "寄语需为1–80个字符"}), 400
        message = Message(user=user, content=content)
        db.session.add(message)
        db.session.commit()
        count = db.session.scalar(select(db.func.count()).select_from(Message))
        return jsonify({"message": message.to_dict(), "count": count, "resonance": count >= 40}), 201

    @app.get("/")
    def index():
        if (ROOT / "dist" / "index.html").exists():
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"status": "SYSU API running", "hint": "Run npm run dev for the React interface."})

    @app.get("/<path:path>")
    def static_files(path):
        target = ROOT / "dist" / path
        if target.exists() and target.is_file():
            return send_from_directory(app.static_folder, path)
        if (ROOT / "dist" / "index.html").exists():
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"error": "前端尚未构建"}), 404

    with app.app_context():
        db.create_all()
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
