# 📱 WhatsApp Broadcast Bot

![Banner](https://capsule-render.vercel.app/api?type=waving&color=0A5C36&height=200&section=header&text=WhatsApp%20Broadcast&fontSize=70&animation=fadeIn&fontColor=fff)

A simple yet powerful WhatsApp broadcast bot built with JavaScript and Baileys library. Send messages to multiple contacts with just one click!

## ⭐ Features

- **One-Click Broadcasting** - Send messages to multiple contacts simultaneously
- **Single Page Implementation** - Everything runs in one file for simplicity
- **QR Code Authentication** - Easy WhatsApp Web login
- **Message Status Tracking** - Monitor delivery and read status
- **Simple Number Management** - Add/remove broadcast numbers easily
- **Clean Interface** - Minimal and user-friendly design

## 🛠️ Technology Stack

- **Runtime:**
  - Node.js

- **Main Dependencies:**
  - `@whiskeysockets/baileys` - WhatsApp Web API
  - `qrcode-terminal` - For QR code display
  - `express` - Basic web server

## 🔧 Prerequisites

- Node.js (v14 or higher)
- Basic understanding of JavaScript
- A WhatsApp account
- Active internet connection

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/whatsapp-broadcast.git
```

2. **Navigate to project directory**
```bash
cd whatsapp-broadcast
```

3. **Install dependencies**
```bash
npm install @whiskeysockets/baileys qrcode-terminal express
```

4. **Start the application**
```bash
node index.js
```

## 📱 How to Use

1. **Initial Setup:**
   - Run the application
   - Scan the QR code with WhatsApp
   - Wait for connection confirmation

2. **Sending Broadcasts:**
   - Add numbers to the broadcast list
   - Type your message
   - Click 'Send Broadcast'
   - Monitor delivery status

## ⚙️ Configuration

Create a `.env` file in the root directory:
```
PORT=3000
DEBUG=false
MAX_RETRIES=3
MESSAGE_DELAY=1000
```

## 🚀 Quick Start Guide

1. **Connect Your WhatsApp:**
   - Launch the application
   - Scan the displayed QR code
   - Wait for "Connected" status

2. **Prepare Broadcast List:**
   - Format: One number per line
   - Include country code
   - Example: `+1234567890`

3. **Send Your First Broadcast:**
   - Enter message text
   - Click 'Send'
   - Watch status updates

## ⚠️ Important Notes

- Ensure numbers include country code
- Avoid spamming or bulk messaging
- Follow WhatsApp's terms of service
- Keep your WhatsApp connected
- Regular breaks between broadcasts recommended

## 🔒 Security Best Practices

- Don't share your auth tokens
- Regularly restart the session
- Monitor for unusual activity
- Keep dependencies updated
- Use rate limiting

## 📋 Limitations

- Maximum recipients per broadcast: 256
- Message rate limits apply
- Media size restrictions
- Connection depends on WhatsApp Web
- Some features require business API

## 🔄 Error Handling

Common errors and solutions:

- **Connection Lost**: Restart and rescan QR
- **Message Failed**: Check number format
- **Auth Error**: Clear session and reconnect
- **Rate Limit**: Reduce broadcast frequency

## 🌟 Future Enhancements

- [ ] Media file support
- [ ] Scheduled broadcasts
- [ ] Message templates
- [ ] Delivery reports
- [ ] Contact groups
- [ ] Message queueing

## 📚 Resources

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [Node.js Documentation](https://nodejs.org/docs)

## ⚖️ Legal Disclaimer

This project is for educational purposes only. Users must:
- Comply with WhatsApp's terms of service
- Obtain consent from recipients
- Follow local messaging laws
- Avoid spam or harassment
- Respect privacy policies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

Need help? Contact us:
- Create an issue
- Email: your.email@example.com
- Discord: YourDiscordServer

## 📄 License

MIT License - feel free to use and modify for your projects.

---

<div align="center">
  Built with ❤️ using Baileys
  
  ![Visitors](https://visitor-badge.laobi.icu/badge?page_id=yourusername.whatsapp-broadcast)

  ⭐ Star this repo if you find it helpful!
</div>
