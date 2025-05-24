import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {
    Appbar,
    Avatar,
    Button,
    Checkbox,
    Searchbar,
    Text,
    TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../context/UserContext';

export default function CreateGroupScreen() {
    const router = useRouter();
    const { user } = useContext(UserContext);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>([user.id]);
    const [groupDescription, setGroupDescription] = useState('');
    const [friends, setFriends] = useState<any[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ groupName: '', general: '' });
    
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://192.168.1.7:5002/users/${user.id}/friends`);
                if (res.status === 200) {
                    setFriends(res.data);
                    setFilteredFriends(res.data);
                    
                    // Animate content in
                    Animated.parallel([
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slideAnim, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
            } catch (error) {
                console.log("Error fetching friends", error);
                setErrors(prev => ({ ...prev, general: 'Failed to load friends' }));
            }
        };
        fetchData();
    }, [user.id]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFriends(friends);
        } else {
            const filtered = friends.filter((friend: any) =>
                friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                friend.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchQuery, friends]);

    const toggleMember = (friendId: string) => {
        if (groupMembers.includes(friendId)) {
            setGroupMembers(groupMembers.filter(id => id !== friendId));
        } else {
            setGroupMembers([...groupMembers, friendId]);
        }
        setErrors(prev => ({ ...prev, general: '' }));
    };

    const validateForm = () => {
        const newErrors = { groupName: '', general: '' };
        
        if (!groupName.trim()) {
            newErrors.groupName = 'Group name is required';
        } else if (groupName.trim().length < 2) {
            newErrors.groupName = 'Group name must be at least 2 characters';
        }
        
        if (groupMembers.length <= 1) {
            newErrors.general = 'Please select at least one friend to add to the group';
        }
        
        setErrors(newErrors);
        return !newErrors.groupName && !newErrors.general;
    };

    const handleCreateGroup = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const res = await axios.post('http://192.168.1.7:5004/createGroup', {
                name: groupName.trim(),
                description: groupDescription.trim(),
            });
            
            if (res.status === 201) {
                const groupId = res.data.id;
                await axios.post(`http://192.168.1.7:5004/groups/${groupId}/addMember`, {
                    members: groupMembers,
                });
                console.log("Group created successfully");
                router.back();
            }
        } catch (error) {
            console.log("Error creating group", error);
            setErrors(prev => ({ ...prev, general: 'Failed to create group. Please try again.' }));
        } finally {
            setLoading(false);
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

    const selectedFriendsCount = groupMembers.length - 1; // Excluding current user

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <LinearGradient colors={['#1a1a2e', '#16213e']}>
                <Appbar.Header style={styles.header}>
                    <Appbar.BackAction 
                        onPress={() => router.back()} 
                        iconColor="#ffffff"
                    />
                    <Appbar.Content 
                        title="Create Group" 
                        titleStyle={styles.headerTitle}
                    />
                </Appbar.Header>
            </LinearGradient>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <Animated.View 
                            style={[
                                styles.content,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            {/* Group Info Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Group Information</Text>
                                
                                <TextInput
                                    mode='outlined'
                                    label="Group Name"
                                    placeholder="Enter a name for your group"
                                    value={groupName}
                                    onChangeText={(text) => {
                                        setGroupName(text);
                                        if (errors.groupName) {
                                            setErrors(prev => ({ ...prev, groupName: '' }));
                                        }
                                    }}
                                    style={styles.input}
                                    contentStyle={styles.inputContent}
                                    outlineStyle={[
                                        styles.inputOutline,
                                        errors.groupName ? styles.inputError : {}
                                    ]}
                                    theme={{
                                        colors: {
                                            primary: errors.groupName ? '#dc3545' : '#4dabf7',
                                            outline: errors.groupName ? '#dc3545' : '#e9ecef',
                                            onSurfaceVariant: '#6c757d',
                                        }
                                    }}
                                    maxLength={50}
                                    error={!!errors.groupName}
                                />
                                {errors.groupName ? (
                                    <Text style={styles.errorText}>⚠️ {errors.groupName}</Text>
                                ) : null}
                                
                                <TextInput
                                    mode='outlined'
                                    label="Description (Optional)"
                                    placeholder="What's this group about?"
                                    multiline
                                    numberOfLines={3}
                                    value={groupDescription}
                                    onChangeText={setGroupDescription}
                                    style={styles.input}
                                    contentStyle={styles.inputContent}
                                    outlineStyle={styles.inputOutline}
                                    theme={{
                                        colors: {
                                            primary: '#4dabf7',
                                            outline: '#e9ecef',
                                            onSurfaceVariant: '#6c757d',
                                        }
                                    }}
                                    maxLength={200}
                                />
                            </View>

                            {/* Members Section */}
                            <View style={styles.section}>
                                <View style={styles.membersHeader}>
                                    <Text style={styles.sectionTitle}>Add Members</Text>
                                    <View style={styles.memberCounter}>
                                        <Text style={styles.memberCountText}>
                                            {selectedFriendsCount} selected
                                        </Text>
                                    </View>
                                </View>

                                {friends.length > 0 && (
                                    <Searchbar
                                        placeholder="Search friends..."
                                        onChangeText={setSearchQuery}
                                        value={searchQuery}
                                        style={styles.searchbar}
                                        inputStyle={styles.searchInput}
                                        iconColor="#4dabf7"
                                        theme={{
                                            colors: {
                                                onSurfaceVariant: '#6c757d',
                                            }
                                        }}
                                    />
                                )}

                                {errors.general ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>⚠️ {errors.general}</Text>
                                    </View>
                                ) : null}

                                <ScrollView 
                                    style={styles.friendsList}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {filteredFriends.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyStateTitle}>
                                                {searchQuery ? 'No friends found' : 'No friends available'}
                                            </Text>
                                            <Text style={styles.emptyStateText}>
                                                {searchQuery 
                                                    ? 'Try searching with a different name' 
                                                    : 'Add some friends first to create a group'
                                                }
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredFriends.map((friend, index) => (
                                            <Pressable
                                                key={friend.id}
                                                onPress={() => toggleMember(friend.id)}
                                                style={({ pressed }) => [
                                                    styles.friendItem,
                                                    pressed && styles.friendItemPressed,
                                                    groupMembers.includes(friend.id) && styles.friendItemSelected
                                                ]}
                                            >
                                                <View style={styles.friendContent}>
                                                    <Avatar.Text
                                                        size={44}
                                                        label={getInitials(friend.name)}
                                                        style={[
                                                            styles.avatar, 
                                                            { backgroundColor: getAvatarColor(friend.name) }
                                                        ]}
                                                        labelStyle={styles.avatarLabel}
                                                    />
                                                    
                                                    <View style={styles.friendInfo}>
                                                        <Text style={styles.friendName}>{friend.name}</Text>
                                                        <Text style={styles.friendEmail}>{friend.email}</Text>
                                                    </View>

                                                    <Checkbox
                                                        status={groupMembers.includes(friend.id) ? 'checked' : 'unchecked'}
                                                        onPress={() => toggleMember(friend.id)}
                                                        theme={{
                                                            colors: {
                                                                primary: '#4dabf7',
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            </Pressable>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        </Animated.View>

                        {/* Create Button */}
                        <View style={styles.buttonContainer}>
                            <Button 
                                mode="contained" 
                                onPress={handleCreateGroup}
                                loading={loading}
                                disabled={loading || !groupName.trim()}
                                buttonColor="#4dabf7"
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                style={styles.createButton}
                            >
                                {loading ? "Creating Group..." : "Create Group"}
                            </Button>
                        </View>
                    </SafeAreaView>
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
    headerTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: '#ffffff',
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    inputContent: {
        paddingHorizontal: 16,
        fontSize: 16,
    },
    inputOutline: {
        borderRadius: 12,
        borderWidth: 1.5,
    },
    inputError: {
        borderColor: '#dc3545',
        borderWidth: 2,
    },
    errorContainer: {
        backgroundColor: '#ffe6e6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#dc3545',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
        marginLeft: 4,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    memberCounter: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    memberCountText: {
        color: '#4dabf7',
        fontSize: 13,
        fontWeight: '600',
    },
    searchbar: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    searchInput: {
        fontSize: 16,
    },
    friendsList: {
        maxHeight: 300,
    },
    friendItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#f1f3f4',
    },
    friendItemPressed: {
        transform: [{ scale: 0.98 }],
        elevation: 1,
    },
    friendItemSelected: {
        borderColor: '#4dabf7',
        borderWidth: 2,
        backgroundColor: '#f8fdff',
    },
    friendContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        marginRight: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    avatarLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    friendEmail: {
        fontSize: 14,
        color: '#6c757d',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    createButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#4dabf7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});