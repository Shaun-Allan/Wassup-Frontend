import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Appbar, Avatar, TextInput } from 'react-native-paper';
import { UserContext } from '../context/UserContext';

export default function GroupChatScreen() {
    const { group } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [senderNames, setSenderNames] = useState<{ [key: string]: string }>({});
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    let parsedGroup: { id: string; name: string; description?: string; memberCount?: number } | null = null;

    try {
        parsedGroup = typeof group === 'string' ? JSON.parse(group) : null;
    } catch (e) {
        console.error('Invalid group JSON:', e);
    }

    const fetchGroupMessages = async () => {
        try {
            const res = await axios.get(`http://192.168.1.7:5005/group/history?group_id=${parsedGroup?.id}`);
            setMessages(res.data);

            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            res.data.forEach((msg: any) => {
                if (msg.sender !== user.id) {
                    getSenderName(msg.sender);
                }
            });
        } catch (error) {
            console.error('Error fetching group messages:', error);
        }
    };

    const getSenderName = async (userId: string) => {
        if (senderNames[userId]) return senderNames[userId];

        try {
            const res = await axios.get(`http://192.168.1.7:5006/get-name?user_id=${userId}`);
            const name = res.data.name || userId;
            setSenderNames((prev) => ({ ...prev, [userId]: name }));
            return name;
        } catch (err) {
            console.error(`Failed to fetch name for ${userId}`, err);
            return userId;
        }
    };

    const sendMessage = () => {
        if (!text.trim()) return;

        const msg = {
            sender: user.id,
            group_id: parsedGroup?.id,
            content: text.trim(),
        };

        console.log(msg);
        ws.current?.send(JSON.stringify(msg));
        setText('');
        setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    useEffect(() => {
        fetchGroupMessages();

        ws.current = new WebSocket(`ws://192.168.1.7:5005/group/ws?user_id=${user?.id}&group_id=${parsedGroup?.id}`);

        ws.current.onmessage = async (e) => {
            const incoming = JSON.parse(e.data);
            if (incoming.group_id === parsedGroup?.id) {
                setMessages((prev) => [...prev, incoming]);
                if (incoming.sender !== user.id) {
                    await getSenderName(incoming.sender);
                }
                
                // Auto-scroll to bottom when receiving messages
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        };

        ws.current.onopen = () => {
            setIsOnline(true);
        };

        ws.current.onclose = () => {
            setIsOnline(false);
        };

        return () => ws.current?.close();
    }, []);

    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (messageDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getMemberCountText = () => {
        const count = parsedGroup?.memberCount || 0;
        if (count === 1) return '1 member';
        return `${count} members`;
    };

    const renderMessage = ({ item, index }: { item: any; index: number }) => {
        const isOutgoing = item.sender === user.id;
        const showTimestamp = index === 0 || 
            (messages[index - 1] && 
             new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000); // 5 minutes

        const senderName = senderNames[item.sender] || item.sender;
        const showSenderName = !isOutgoing && (index === 0 || messages[index - 1]?.sender !== item.sender);

        return (
            <View style={styles.messageContainer}>
                {showTimestamp && (
                    <Text style={styles.timestampDivider}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isOutgoing ? styles.outgoingMessage : styles.incomingMessage,
                    ]}
                >
                    {showSenderName && (
                        <Text style={styles.senderName}>
                            {senderName}
                        </Text>
                    )}
                    <Text style={isOutgoing ? styles.outgoingText : styles.incomingText}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isOutgoing ? styles.outgoingTime : styles.incomingTime
                    ]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <LinearGradient colors={['#1a1a2e', '#16213e']}>
                <Appbar.Header style={styles.header}>
                    <Appbar.BackAction 
                        onPress={() => router.back()} 
                        iconColor="#ffffff"
                    />
                    <View style={styles.headerContent}>
                        <Avatar.Text
                            size={36}
                            label={getInitials(parsedGroup?.name || 'G')}
                            style={[styles.headerAvatar, { backgroundColor: getAvatarColor(parsedGroup?.name || 'Group') }]}
                            labelStyle={styles.headerAvatarLabel}
                        />
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>
                                {parsedGroup?.name ?? 'Group Chat'}
                            </Text>
                            <Text style={styles.headerStatus}>
                                {isOnline ? getMemberCountText() : 'Offline'}
                            </Text>
                        </View>
                    </View>
                    <Appbar.Action 
                        icon="account-group" 
                        iconColor="#ffffff"
                        onPress={() => {/* Group info functionality */}}
                    />
                    <Appbar.Action 
                        icon="dots-vertical" 
                        iconColor="#ffffff"
                        onPress={() => {/* Menu functionality */}}
                    />
                </Appbar.Header>
            </LinearGradient>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={styles.chatContainer}>
                        <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
                            <FlatList
                                ref={flatListRef}
                                style={styles.messages}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(_, i) => i.toString()}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.messagesContent}
                                onContentSizeChange={() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }}
                            />
                        </Animated.View>

                        {isTyping && (
                            <View style={styles.typingIndicator}>
                                <Text style={styles.typingText}>
                                    Someone is typing...
                                </Text>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Type a message..."
                                    value={text}
                                    onChangeText={setText}
                                    multiline
                                    maxLength={1000}
                                    style={styles.textInput}
                                    contentStyle={styles.textInputContent}
                                    outlineStyle={styles.textInputOutline}
                                    theme={{
                                        colors: {
                                            primary: '#4dabf7',
                                            outline: '#e9ecef',
                                            onSurfaceVariant: '#6c757d',
                                        }
                                    }}
                                    right={
                                        <TextInput.Icon 
                                            icon="send" 
                                            onPress={sendMessage}
                                            iconColor={text.trim() ? '#4dabf7' : '#adb5bd'}
                                            style={styles.sendButton}
                                        />
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerAvatar: {
        marginRight: 12,
    },
    headerAvatarLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    headerStatus: {
        color: '#b8c5d6',
        fontSize: 12,
        fontWeight: '400',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messages: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        marginBottom: 8,
    },
    timestampDivider: {
        textAlign: 'center',
        color: '#6c757d',
        fontSize: 12,
        fontWeight: '500',
        marginVertical: 16,
        backgroundColor: '#e9ecef',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'center',
    },
    messageBubble: {
        maxWidth: '78%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginVertical: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    incomingMessage: {
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    outgoingMessage: {
        backgroundColor: '#4dabf7',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 6,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4dabf7',
        marginBottom: 4,
    },
    incomingText: {
        color: '#1a1a2e',
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '400',
    },
    outgoingText: {
        color: '#ffffff',
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '400',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'right',
        fontWeight: '400',
    },
    incomingTime: {
        color: '#6c757d',
    },
    outgoingTime: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    typingIndicator: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    typingText: {
        color: '#6c757d',
        fontSize: 14,
        fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#ffffff',
        maxHeight: 120,
    },
    textInputContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        fontSize: 16,
        lineHeight: 20,
    },
    textInputOutline: {
        borderRadius: 24,
        borderWidth: 1.5,
    },
    sendButton: {
        marginRight: 4,
    },
});