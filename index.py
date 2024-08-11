import os
import telegram
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters

# Reemplaza TOKEN_BOT con el token de tu bot de Telegram
TOKEN_BOT = '7442086482:AAFLSSk8gfpl8WPiW7guYxxV_tmdu83OiH8'

# Crea una instancia del bot
bot = telegram.Bot(token=TOKEN_BOT)

# Función para manejar el comando /start
def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="¡Hola! Soy tu bot de Telegram. ¿En qué puedo ayudarte?")

# Función para manejar mensajes de texto
def echo(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text=update.message.text)

# Configurar los manejadores de comandos y mensajes
updater = Updater(TOKEN_BOT, use_context=True)
dp = updater.dispatcher
dp.add_handler(CommandHandler("start", start))
dp.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))

# Iniciar el bot
updater.start_polling()
updater.idle()