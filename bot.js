const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Store channels and groups data
let channels = [];
let groups = [];

// Function to get group invite URL and log it
async function getAndLogGroupUrls(sock) {
    const logFile = path.join(__dirname, 'group_urls.txt');
    let logContent = '=== WhatsApp Group URLs ===\n\n';
    const timestamp = new Date().toISOString();
    
    try {
        for (const group of groups) {
            try {
                // Try to fetch group metadata instead of just invite code
                const groupMetadata = await sock.groupMetadata(group.id);
                let inviteUrl = "";
                
                // Check if group is announce (only admins can send messages)
                if (groupMetadata.announce) {
                    // For announce groups, try to get existing invite link
                    try {
                        const existingCode = await sock.groupInviteCode(group.id);
                        inviteUrl = `https://chat.whatsapp.com/${existingCode}`;
                    } catch (e) {
                        // If we can't get invite code, look for it in group description
                        if (groupMetadata.desc) {
                            const urlRegex = /(https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]{22})/g;
                            const matches = groupMetadata.desc.match(urlRegex);
                            if (matches && matches.length > 0) {
                                inviteUrl = matches[0];
                            }
                        }
                    }
                } else {
                    // For non-announce groups, try normal invite code fetch
                    const inviteCode = await sock.groupInviteCode(group.id);
                    inviteUrl = `https://chat.whatsapp.com/${inviteCode}`;
                }

                // Format log entry
                let logEntry = `Group: ${group.name}\nID: ${group.id}\n`;
                if (inviteUrl) {
                    logEntry += `URL: ${inviteUrl}\n`;
                } else {
                    logEntry += `Status: No invite link available\n`;
                }
                
                // Add participant count if available
                if (groupMetadata.participants) {
                    logEntry += `Participants: ${groupMetadata.participants.length}\n`;
                }
                
                logEntry += '\n';
                logContent += logEntry;
                
                console.log(`Processed group: ${group.name}`);
                // Add delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error processing group ${group.name}:`, error);
                logContent += `Group: ${group.name}\nID: ${group.id}\nStatus: Error processing group\n\n`;
            }
        }
        
        // Add timestamp at the end
        logContent += `\nLog generated at: ${timestamp}`;
        
        // Write to file
        fs.writeFileSync(logFile, logContent);
        console.log(`Group information has been logged to: ${logFile}`);
        
    } catch (error) {
        console.error('Error in getAndLogGroupUrls:', error);
    }
}

// Updated function to fetch both channels and groups
async function updateChannelsAndGroupsList(sock) {
    try {
        const chats = await sock.groupFetchAllParticipating();
        
        // Reset arrays
        channels = [];
        groups = [];
        
        for (const chat of Object.values(chats)) {
            // Check if the chat has the channel property (new WhatsApp channels feature)
            if (chat.isChannel || chat.subject?.startsWith('Channel: ')) {
                channels.push({
                    id: chat.id,
                    name: chat.subject
                });
            } else {
                // Regular groups
                groups.push({
                    id: chat.id,
                    name: chat.subject
                });
            }
        }
        
        console.log(`Updated lists: ${channels.length} channels and ${groups.length} groups found`);
    } catch (error) {
        console.error('Error updating channels and groups list:', error);
    }
}

// Function to broadcast to channels only
async function broadcastToChannels(sock, message) {
    let successCount = 0;
    let failCount = 0;

    for (const channel of channels) {
        try {
            await sock.sendMessage(channel.id, message);
            console.log(`Message sent to channel: ${channel.name}`);
            successCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error sending message to channel ${channel.name}:`, error);
            failCount++;
        }
    }
    
    return { successCount, failCount };
}

// Function to broadcast to groups only
async function broadcastToGroups(sock, message) {
    let successCount = 0;
    let failCount = 0;

    for (const group of groups) {
        try {
            await sock.sendMessage(group.id, message);
            console.log(`Message sent to group: ${group.name}`);
            successCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error sending message to group ${group.name}:`, error);
            failCount++;
        }
    }
    
    return { successCount, failCount };
}

// Function to broadcast to both channels and groups
async function broadcastToAll(sock, message) {
    const channelResults = await broadcastToChannels(sock, message);
    const groupResults = await broadcastToGroups(sock, message);
    
    return {
        channels: channelResults,
        groups: groupResults
    };
}

async function isAdmin(sock, userId) {
    try {
        // Define owner number - replace with your number
        const ownerNumber = "your-number@s.whatsapp.net"; // Format: "1234567890@s.whatsapp.net"
        
        if (userId === ownerNumber) return true;
        if (userId === sock.user.id) return true;
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

async function getQuotedMessage(message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) return null;

        if (quotedMessage.conversation) {
            return { text: quotedMessage.conversation };
        } else if (quotedMessage.extendedTextMessage) {
            return { text: quotedMessage.extendedTextMessage.text };
        } else if (quotedMessage.imageMessage) {
            return {
                image: {
                    url: quotedMessage.imageMessage.url
                },
                caption: quotedMessage.imageMessage.caption
            };
        } else if (quotedMessage.videoMessage) {
            return {
                video: {
                    url: quotedMessage.videoMessage.url
                },
                caption: quotedMessage.videoMessage.caption
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting quoted message:', error);
        return null;
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot is now connected!');
            // Update channels and groups list when connected
            await updateChannelsAndGroupsList(sock);
            // Get and log group URLs after updating the lists
            await getAndLogGroupUrls(sock);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        
        if (!m.message) return;
        
        const messageContent = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const isReply = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Handle broadcast commands
        if (messageContent.startsWith('/broadcast') && isReply) {
            const sender = m.key.participant || m.key.remoteJid;
            if (await isAdmin(sock, sender)) {
                const repliedMessage = await getQuotedMessage(m);
                if (repliedMessage) {
                    // Check for specific broadcast targets
                    if (messageContent.includes('channels')) {
                        await broadcastToChannels(sock, repliedMessage);
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `✅ Message broadcasted to ${channels.length} channels!`
                        });
                    } else if (messageContent.includes('groups')) {
                        await broadcastToGroups(sock, repliedMessage);
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `✅ Message broadcasted to ${groups.length} groups!`
                        });
                    } else {
                        // Broadcast to both channels and groups
                        await broadcastToAll(sock, repliedMessage);
                        await sock.sendMessage(m.key.remoteJid, {
                            text: `✅ Message broadcasted to ${channels.length} channels and ${groups.length} groups!`
                        });
                    }
                }
            } else {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '❌ Only owner and bot admin can use broadcast command.'
                });
            }
        }
        
        // Handle URL collection command
        if (messageContent === '/geturls') {
            const sender = m.key.participant || m.key.remoteJid;
            if (await isAdmin(sock, sender)) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '📝 Collecting group URLs... Please wait.'
                });
                
                await getAndLogGroupUrls(sock);
                
                await sock.sendMessage(m.key.remoteJid, {
                    text: '✅ Group URLs have been collected and saved to group_urls.txt'
                });
            } else {
                await sock.sendMessage(m.key.remoteJid, {
                    text: '❌ Only admin can use this command.'
                });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Create auth_info_baileys directory if it doesn't exist
if (!fs.existsSync('auth_info_baileys')) {
    fs.mkdirSync('auth_info_baileys');
}

// Start the bot
connectToWhatsApp();