import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Appbar, TextInput } from 'react-native-paper';
import { UserContext } from './UserContext';

export default function DMScreen() {
    const { friend } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const ws = useRef<WebSocket | null>(null);

    let parsedUser: { id: string; name: string; email: string } | null = null;

    try {
        parsedUser = typeof friend === 'string' ? JSON.parse(friend) : null;
    } catch (e) {
        console.error('Invalid user JSON:', e);
    }

    const fetchMessages = async () => {
        const res = await axios.get(`http://192.168.1.7:5003/history?user1=${user.id}&user2=${parsedUser?.id}`);
        setMessages(res.data);
    };

    const sendMessage = () => {
        const msg = {
            sender: user.id,
            receiver: parsedUser?.id,
            content: text,
        };

        console.log(msg);
        ws.current?.send(JSON.stringify(msg));
        setText('');
        setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
    };

    useEffect(() => {
        fetchMessages();
        ws.current = new WebSocket(`ws://192.168.1.7:5003/ws?user_id=${user?.id}`);

        ws.current.onmessage = (e) => {
            const incoming = JSON.parse(e.data);
            setMessages((prev) => [...prev, incoming]);
        };

        return () => ws.current?.close();
    }, []);
    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={parsedUser?.name ?? 'Unknown User'} />
            </Appbar.Header>

            {/* Dismiss keyboard when tapping outside */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust if you have a header
                >
                    <SafeAreaView style={styles.container}>
                        <FlatList
                            style={styles.messages}
                            data={messages}
                            renderItem={({ item }) => {
                                const isOutgoing = item.sender === user.id;
                                return (
                                    <View
                                        style={[
                                            styles.messageBubble,
                                            isOutgoing ? styles.outgoingMessage : styles.incomingMessage,
                                        ]}
                                    >
                                        <Text style={isOutgoing ? styles.outgoingText : styles.incomingText}>
                                            {item.content}
                                        </Text>
                                        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                                    </View>
                                );
                            }}
                            keyExtractor={(_, i) => i.toString()}
                            keyboardShouldPersistTaps="handled"
                        />


                        {/* Input container at the bottom */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                mode="outlined"
                                placeholder="Type a message"
                                value={text}
                                onChangeText={setText}
                                right={<TextInput.Icon icon="send" onPress={sendMessage} />}
                            />
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    messages: {
        flex: 1,
    },
    inputContainer: {
        // Make sure input stays at the bottom
        justifyContent: 'center',
    },
    messageBubble: {
        marginVertical: 6,
        marginHorizontal: 8,
        padding: 10,
        borderRadius: 10,
        maxWidth: '75%',
        alignSelf: 'flex-start',
        // minWidth: '40%',
    },
    incomingMessage: {
        backgroundColor: '#e0f0ff', // light blue
        alignSelf: 'flex-start',
    },
    outgoingMessage: {
        backgroundColor: '#000', // black
        alignSelf: 'flex-end',
    },
    incomingText: {
        color: '#000',
        fontSize: 16,
    },
    outgoingText: {
        color: '#fff',
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
        color: '#aaa',
    },

});
