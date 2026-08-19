from __future__ import annotations

import os
import secrets
import click
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, inspect, or_, select, text
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parents[1]
db = SQLAlchemy()


EMOTION_RULES = (
    ("nostalgia", "( ´•̥̥̥ω•̥̥̥` )", ("想念", "怀念", "记得", "故人", "归来", "母校", "回忆")),
    ("determination", "ᕦ(ò_óˇ)ᕤ", ("笃行", "奋斗", "坚持", "不息", "勇敢", "努力", "前行")),
    ("joy", "(๑˃̵ᴗ˂̵)و", ("开心", "快乐", "青春", "热烈", "庆", "相遇", "美好", "哈哈", "喜欢")),
    ("hope", "✧(◍˃̶ᗜ˂̶◍)✧", ("愿", "祝", "期待", "未来", "加油", "前程", "光", "希望")),
    ("calm", "( ´ ▽ ` )ﾉ", ("山", "海", "月", "秋", "清", "风", "江", "云")),
)


def classify_message_emotion(content: str):
    """轻量、可解释的寄语情绪分类；后续可无缝替换成 LLM 服务。"""
    scores = []
    for priority, (emotion, emoticon, keywords) in enumerate(EMOTION_RULES):
        score = sum(2 if len(keyword) > 1 else 1 for keyword in keywords if keyword in content)
        if score:
            scores.append((score, -priority, emotion, emoticon))
    if not scores:
        return "warm", "(｡•̀ᴗ-)✧"
    _, _, emotion, emoticon = max(scores)
    return emotion, emoticon


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    province = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(30), nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    message = db.relationship("Message", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True, nullable=False)
    content = db.Column(db.String(80), nullable=False)
    visibility = db.Column(db.String(16), nullable=False, default="public")
    is_demo = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    user = db.relationship("User", back_populates="message")

    def to_dict(self):
        emotion, emoticon = classify_message_emotion(self.content)
        return {
            "id": self.id,
            "username": self.user.username,
            "province": self.user.province or "",
            "city": self.user.city or "",
            "content": self.content,
            "visibility": self.visibility,
            "emotion": emotion,
            "emoticon": emoticon,
            "is_demo": self.is_demo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def create_app(test_config=None):
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    if not database_url:
        database_path = Path(os.environ.get("SYSU_DATABASE_PATH", ROOT / "instance" / "sysu.db")).resolve()
        database_path.parent.mkdir(parents=True, exist_ok=True)
        database_url = f"sqlite:///{database_path.as_posix()}"
    app = Flask(__name__, static_folder=str(ROOT / "dist"), static_url_path="")
    app.config.update(
        SECRET_KEY=os.environ.get("SYSU_SECRET_KEY", "dev-only-change-me-before-deploy"),
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("SYSU_SECURE_COOKIES", "0") == "1",
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

    def user_payload(user):
        return {
            "id": user.id,
            "username": user.username,
            "province": user.province or "",
            "city": user.city or "",
            "has_message": user.message is not None,
            "is_admin": bool(user.is_admin),
        }

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
        province = str(data.get("province", "")).strip()
        city = str(data.get("city", "")).strip()
        if not 3 <= len(username) <= 20:
            return jsonify({"error": "用户名需为3–20个字符"}), 400
        if not all(ch.isalnum() or ch in "_-" for ch in username):
            return jsonify({"error": "用户名只能包含文字、字母、数字、下划线或连字符"}), 400
        if len(password) < 8:
            return jsonify({"error": "密码至少需要8位"}), 400
        if not 2 <= len(province) <= 20:
            return jsonify({"error": "请选择所在省份"}), 400
        if not 1 <= len(city) <= 30:
            return jsonify({"error": "请填写所在城市"}), 400
        if db.session.scalar(select(User).where(User.username == username)):
            return jsonify({"error": "这个用户名已经被使用"}), 409
        user = User(
            username=username,
            password_hash=generate_password_hash(password),
            province=province,
            city=city,
        )
        db.session.add(user)
        db.session.commit()
        session["user_id"] = user.id
        return jsonify({"user": user_payload(user)}), 201

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
        return jsonify({"user": user_payload(user)})

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
        return jsonify({"user": user_payload(user)})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "SYSU Flask API"})

    @app.get("/api/messages")
    def messages():
        viewer = current_user()
        real_filter = Message.is_demo.is_(False)
        total = db.session.scalar(
            select(func.count()).select_from(Message).where(real_filter)
        ) or 0
        query = select(Message).where(real_filter)
        if viewer is None:
            query = query.where(Message.visibility == "public")
        elif not viewer.is_admin:
            query = query.where(or_(Message.visibility == "public", Message.user_id == viewer.id))
        rows = db.session.scalars(query.order_by(Message.created_at.desc())).all()
        return jsonify({"messages": [row.to_dict() for row in rows], "count": total, "goal": 40})

    @app.get("/api/dashboard")
    def database_dashboard():
        """管理员专属只读面板；不返回密码哈希或会话数据。"""
        user = current_user()
        if not user:
            return jsonify({"error": "请先登录管理员账号"}), 401
        if not user.is_admin:
            return jsonify({"error": "仅管理员可以查看数据库"}), 403
        user_count = db.session.scalar(select(func.count()).select_from(User)) or 0
        message_count = db.session.scalar(select(func.count()).select_from(Message)) or 0
        demo_count = db.session.scalar(
            select(func.count()).select_from(Message).where(Message.is_demo.is_(True))
        ) or 0
        province_rows = db.session.execute(
            select(
                User.province,
                func.count(User.id).label("users"),
                func.count(Message.id).label("messages"),
            )
            .outerjoin(Message, Message.user_id == User.id)
            .group_by(User.province)
            .order_by(func.count(Message.id).desc(), func.count(User.id).desc())
        ).all()
        recent_rows = db.session.scalars(
            select(Message).order_by(Message.created_at.desc()).limit(12)
        ).all()
        engine_inspector = inspect(db.engine)
        schema = []
        for table_name in ("user", "message"):
            columns = engine_inspector.get_columns(table_name)
            schema.append({
                "name": table_name,
                "columns": [
                    {
                        "name": column["name"],
                        "type": str(column["type"]),
                        "nullable": bool(column.get("nullable", True)),
                    }
                    for column in columns
                    if column["name"] != "password_hash"
                ],
            })

        return jsonify({
            "database": {
                "engine": "SQLite",
                "file": database_path.name,
                "size_bytes": database_path.stat().st_size if database_path.exists() else 0,
            },
            "counts": {
                "users": user_count,
                "messages": message_count,
                "real_messages": message_count - demo_count,
                "demo_messages": demo_count,
                "completion": round(min(1, (message_count - demo_count) / 40) * 100, 1),
            },
            "provinces": [
                {
                    "name": province or "未填写",
                    "users": users,
                    "messages": messages,
                }
                for province, users, messages in province_rows
            ],
            "recent_messages": [row.to_dict() for row in recent_rows],
            "schema": schema,
        })

    @app.post("/api/messages")
    def post_message():
        if not csrf_valid():
            return jsonify({"error": "请求校验失败，请刷新页面重试"}), 403
        user = current_user()
        if not user:
            return jsonify({"error": "请先登录再留下寄语"}), 401
        if user.message:
            return jsonify({"error": "每位同学只能留下一个珍贵的光点"}), 409
        data = payload()
        content = str(data.get("content", "")).strip()
        visibility = str(data.get("visibility", "public")).strip()
        if not 1 <= len(content) <= 80:
            return jsonify({"error": "寄语需为1–80个字符"}), 400
        if visibility not in {"public", "private"}:
            return jsonify({"error": "寄语可见范围无效"}), 400
        message = Message(user=user, content=content, visibility=visibility)
        db.session.add(message)
        db.session.commit()
        count = db.session.scalar(
            select(func.count()).select_from(Message).where(Message.is_demo.is_(False))
        ) or 0
        return jsonify({"message": message.to_dict(), "count": count, "resonance": count >= 40}), 201

    @app.get("/")
    def index():
        if (ROOT / "dist" / "index.html").exists():
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"status": "SYSU API running", "hint": "Run npm run dev for the React interface."})

    @app.get("/admin")
    def admin_portal():
        """独立管理员页面入口；实际权限仍由 /api/dashboard 在服务端校验。"""
        if (ROOT / "dist" / "index.html").exists():
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"error": "前端尚未构建，请先运行 npm run build"}), 404

    @app.get("/<path:path>")
    def static_files(path):
        target = ROOT / "dist" / path
        if target.exists() and target.is_file():
            return send_from_directory(app.static_folder, path)
        if (ROOT / "dist" / "index.html").exists():
            return send_from_directory(app.static_folder, "index.html")
        return jsonify({"error": "前端尚未构建"}), 404

    @app.cli.command("create-admin")
    @click.argument("username")
    @click.password_option(confirmation_prompt=True)
    def create_admin(username, password):
        """创建或升级管理员账号，不在源码中保存管理员密码。"""
        username = username.strip()
        if not 3 <= len(username) <= 20 or len(password) < 8:
            raise click.ClickException("管理员名需3–20字符，密码至少8位")
        user = db.session.scalar(select(User).where(User.username == username))
        if user is None:
            user = User(
                username=username,
                password_hash=generate_password_hash(password),
                province="管理员",
                city="本地控制台",
                is_admin=True,
            )
            db.session.add(user)
        else:
            user.password_hash = generate_password_hash(password)
            user.is_admin = True
        db.session.commit()
        click.echo(f"Administrator '{username}' is ready.")

    with app.app_context():
        db.create_all()
        # create_all 不会为已有 SQLite 表增加字段；这里做最小、可重复的本地迁移。
        user_columns = {column["name"] for column in inspect(db.engine).get_columns("user")}
        if "province" not in user_columns:
            db.session.execute(text('ALTER TABLE "user" ADD COLUMN province VARCHAR(20)'))
        if "city" not in user_columns:
            db.session.execute(text('ALTER TABLE "user" ADD COLUMN city VARCHAR(30)'))
        if "is_admin" not in user_columns:
            db.session.execute(text('ALTER TABLE "user" ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE'))
        message_columns = {column["name"] for column in inspect(db.engine).get_columns("message")}
        if "visibility" not in message_columns:
            db.session.execute(text("ALTER TABLE message ADD COLUMN visibility VARCHAR(16) NOT NULL DEFAULT 'public'"))
        db.session.commit()

        # 云端首次部署可用环境变量创建管理员；已有账号不会被反复改密。
        bootstrap_name = os.environ.get("SYSU_BOOTSTRAP_ADMIN_USER", "").strip()
        bootstrap_password = os.environ.get("SYSU_BOOTSTRAP_ADMIN_PASSWORD", "")
        if bootstrap_name and len(bootstrap_password) >= 8:
            bootstrap_user = db.session.scalar(select(User).where(User.username == bootstrap_name))
            if bootstrap_user is None:
                db.session.add(User(
                    username=bootstrap_name,
                    password_hash=generate_password_hash(bootstrap_password),
                    province="管理员",
                    city="云端控制台",
                    is_admin=True,
                ))
                db.session.commit()
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
