from sqlalchemy import select

from backend.app import Message, User, create_app, db
from werkzeug.security import generate_password_hash

DEMO_MESSAGES = [
    "愿我们永远保持追问世界的勇气。", "山高水长，学海同航。", "愿每次出发，都不忘康乐园的树影。",
    "在珠海听潮，在中大求知。", "博学而笃志，切问而近思。", "愿理想在木棉盛放时抵达。",
    "从南校园的红砖，走向更远的世界。", "愿所学皆有所用，所行皆有所获。", "百年中大，青春正当时。",
    "在深圳看见科技，也看见未来。", "愿医学有温度，科学有担当。", "让好奇心穿过每一扇海棠窗。",
    "记得北校园的清晨与灯火。", "愿青春与湾区的海风同频。", "慎思明辨，也热烈生活。",
    "让每一份努力都有回声。", "在东校园，把年轻写进风里。", "愿你眼里有光，脚下有路。",
    "百年风华，向新而行。", "愿真理越辩越明，友谊历久弥新。", "把论文写在祖国大地上。",
    "从这里认识岭南，也认识世界。", "愿每个平凡日子都有小小发现。", "书声与海浪，都是青春的回响。",
    "求学中大，追求卓越。", "愿每一场实验都靠近答案。", "从1924继续写下我们的年份。",
    "愿人文照亮技术，技术回应生活。", "五校园同心，山高水长。", "愿此去繁花似锦，归来仍是少年。",
    "在古树下读书，在时代中行动。", "愿我们成为有担当的中大人。", "把热爱做成一生的课题。",
    "愿南海之滨，常有思想的浪潮。", "以梦为马，笃行不怠。", "愿每次追问都通向新的可能。",
    "中山手创，遗泽余芳。", "愿我们以今日之我，赴明日之约。", "这里是起点，也是永远的坐标。"
]

app = create_app()
with app.app_context():
    for index, content in enumerate(DEMO_MESSAGES, start=1):
        username = f"演示同学{index:02d}"
        user = db.session.scalar(select(User).where(User.username == username))
        if not user:
            user = User(username=username, password_hash=generate_password_hash("demo-pass-1924"))
            db.session.add(user)
            db.session.flush()
        if not user.message:
            db.session.add(Message(user=user, content=content, is_demo=True))
    db.session.commit()
    print(f"已准备 {len(DEMO_MESSAGES)} 条演示寄语。")
