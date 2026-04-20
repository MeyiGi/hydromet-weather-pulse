import httpx
from django.conf import settings


def _token():
    return getattr(settings, "TELEGRAM_BOT_TOKEN", None)


def send_message(chat_id: int, text: str, parse_mode: str = "HTML", reply_markup: dict = None) -> bool:
    token = _token()
    if not token:
        return False
    payload = {"chat_id": chat_id, "text": text, "parse_mode": parse_mode}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        httpx.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json=payload,
            timeout=10,
        ).raise_for_status()
        return True
    except httpx.HTTPError:
        return False


def answer_callback(callback_id: str, text: str = "") -> None:
    token = _token()
    if not token:
        return
    try:
        httpx.post(
            f"https://api.telegram.org/bot{token}/answerCallbackQuery",
            json={"callback_query_id": callback_id, "text": text},
            timeout=10,
        )
    except httpx.HTTPError:
        pass


def edit_message_text(chat_id: int, message_id: int, text: str, reply_markup: dict = None) -> None:
    token = _token()
    if not token:
        return
    payload = {"chat_id": chat_id, "message_id": message_id, "text": text, "parse_mode": "HTML"}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        httpx.post(
            f"https://api.telegram.org/bot{token}/editMessageText",
            json=payload,
            timeout=10,
        )
    except httpx.HTTPError:
        pass


MAIN_KEYBOARD = {
    "keyboard": [
        ["📊 Статус", "❌ Просроченные"],
        ["🕐 Окно", "📅 Сегодня"],
        ["📈 Статистика", "📋 Подписки"],
        ["⚙️ Настройки", "❓ Помощь"],
    ],
    "resize_keyboard": True,
    "persistent": True,
}
