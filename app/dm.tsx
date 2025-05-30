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

export default function DMScreen() {
    const { friend } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    let parsedUser: { id: string; name: string; email: string } | null = null;

    try {
        parsedUser = typeof friend === 'string' ? JSON.parse(friend) : null;
    } catch (e) {
        console.error('Invalid user JSON:', e);
    }

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`http://192.168.1.7:5003/history?user1=${user.id}&user2=${parsedUser?.id}`);
            setMessages(res.data);
            
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = () => {
        if (!text.trim()) return;
        
        const msg = {
            sender: user.id,
            receiver: parsedUser?.id,
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
        fetchMessages();
        ws.current = new WebSocket(`ws://192.168.1.7:5003/ws?user_id=${user?.id}`);

        ws.current.onmessage = (e) => {
            const incoming = JSON.parse(e.data);
            setMessages((prev) => [...prev, incoming]);
            
            // Auto-scroll to bottom when receiving messages
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
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

    const renderMessage = ({ item, index }: { item: any; index: number }) => {
        const isOutgoing = item.sender === user.id;
        const showTimestamp = index === 0 || 
            (messages[index - 1] && 
             new Date(item.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000); // 5 minutes

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
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                // style={styles.headerGradient}
            >
                <Appbar.Header style={styles.header}>
                    <Appbar.BackAction 
                        onPress={() => router.back()} 
                        iconColor="#ffffff"
                    />
                    <View style={styles.headerContent}>
                        <Avatar.Text
                            size={36}
                            label={getInitials(parsedUser?.name || 'U')}
                            style={styles.headerAvatar}
                            labelStyle={styles.headerAvatarLabel}
                        />
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>
                                {parsedUser?.name ?? 'Unknown User'}
                            </Text>
                            <Text style={styles.headerStatus}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>
                    <Appbar.Action 
                        icon="phone" 
                        iconColor="#ffffff"
                        onPress={() => {/* Call functionality */}}
                    />
                    <Appbar.Action 
                        icon="video" 
                        iconColor="#ffffff"
                        onPress={() => {/* Video call functionality */}}
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
                                    {parsedUser?.name} is typing...
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
    headerGradient: {
        paddingTop: StatusBar.currentHeight || 0,
    },
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
        backgroundColor: '#4dabf7',
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