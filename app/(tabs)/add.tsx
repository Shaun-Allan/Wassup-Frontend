import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useContext } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ActivityIndicator,
    Appbar,
    Avatar,
    Button,
    Chip,
    Searchbar,
    Text
} from 'react-native-paper';
import { UserContext } from '../../context/UserContext';

export default function AddScreen() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [result, setResult] = React.useState<any>([]);
    const { user } = useContext(UserContext);
    const [friendStatus, setFriendStatus] = React.useState<{ [key: string]: boolean }>({});
    const [isSearching, setIsSearching] = React.useState(false);
    const [addingFriends, setAddingFriends] = React.useState<{ [key: string]: boolean }>({});
    const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        
        if (query.length > 2) {
            setIsSearching(true);
            
            try {
                const res = await axios.post("http://192.168.1.7:5001/search", {
                    query: query,
                });

                if (res.status === 200 && res.data.length > 0) {
                    const users = res.data;
                    setResult(users);

                    // Add to search history if not already present
                    if (!searchHistory.includes(query)) {
                        setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
                    }

                    // Check friend status for each user
                    const statuses: { [key: string]: boolean } = {};
                    await Promise.all(
                        users.map(async (userItem: any) => {
                            const isFriend = await checkFriend(userItem.id);
                            statuses[userItem.id] = isFriend;
                        })
                    );
                    setFriendStatus(statuses);

                    // Animate results in
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                } else {
                    setResult([]);
                    setFriendStatus({});
                }
            } catch (error) {
                console.error('Search error:', error);
                setResult([]);
                setFriendStatus({});
            } finally {
                setIsSearching(false);
            }
        } else {
            setResult([]);
            setFriendStatus({});
            fadeAnim.setValue(0);
        }
    };

    const addFriend = async (id: string, name: string) => {
        setAddingFriends(prev => ({ ...prev, [id]: true }));
        
        try {
            const res = await axios.post("http://192.168.1.7:5002/addFriend", {
                user_id: user.id,
                friend_id: id,
            });
            
            if (res.status === 200) {
                console.log("Friend added successfully");
                setFriendStatus(prev => ({ ...prev, [id]: true }));
                // Show success feedback could be added here
            } else {
                console.log("Failed to add friend");
            }
        } catch (error) {
            console.error('Add friend error:', error);
        } finally {
            setAddingFriends(prev => ({ ...prev, [id]: false }));
        }
    };

    const checkFriend = async (id: string) => {
        try {
            const res = await axios.post("http://192.168.1.7:5002/checkFriends", {
                user_id: user.id,
                friend_id: id,
            });
            
            if (res.status === 200) {
                return res.data.are_friends;
            } else {
                return true;
            }
        } catch (error) {
            console.error('Check friend error:', error);
            return true;
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

    const clearSearch = () => {
        setSearchQuery('');
        setResult([]);
        setFriendStatus({});
        fadeAnim.setValue(0);
    };

    const useSearchHistory = (query: string) => {
        handleSearch(query);
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                // style={styles.headerGradient}
            >
                <Appbar.Header style={styles.header}>
                    <Appbar.Content 
                        title="Add Friends" 
                        titleStyle={styles.headerTitle}
                    />
                    <Appbar.Action 
                        icon="account-multiple-plus" 
                        iconColor="#ffffff"
                        onPress={() => {/* Invite friends functionality */}}
                    />
                </Appbar.Header>
            </LinearGradient>

            <View style={styles.container}>
                {/* Search Section */}
                <View style={styles.searchSection}>
                    <Searchbar
                        style={styles.searchbar}
                        inputStyle={styles.searchInput}
                        placeholder="Search by name or email..."
                        onChangeText={handleSearch}
                        value={searchQuery}
                        iconColor="#4dabf7"
                        loading={isSearching}
                        theme={{
                            colors: {
                                onSurfaceVariant: '#6c757d',
                            }
                        }}
                        right={() => searchQuery ? (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        ) : null}
                    />

                    {/* Search History */}
                    {searchHistory.length > 0 && !searchQuery && (
                        <View style={styles.searchHistorySection}>
                            <Text style={styles.sectionTitle}>Recent Searches</Text>
                            <View style={styles.historyChips}>
                                {searchHistory.map((query, index) => (
                                    <Chip
                                        key={index}
                                        onPress={() => useSearchHistory(query)}
                                        style={styles.historyChip}
                                        textStyle={styles.historyChipText}
                                    >
                                        {query}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Results Section */}
                <ScrollView 
                    style={styles.resultsContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {searchQuery.length > 0 && searchQuery.length <= 2 && (
                        <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>
                                Type at least 3 characters to search for friends
                            </Text>
                        </View>
                    )}

                    {isSearching && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4dabf7" />
                            <Text style={styles.loadingText}>Searching for friends...</Text>
                        </View>
                    )}

                    {!isSearching && searchQuery.length > 2 && result.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>No users found</Text>
                            <Text style={styles.emptyStateText}>
                                Try searching with a different name or email address
                            </Text>
                        </View>
                    )}

                    {result.length > 0 && (
                        <Animated.View style={[styles.resultsList, { opacity: fadeAnim }]}>
                            <Text style={styles.sectionTitle}>
                                {result.length} {result.length === 1 ? 'user' : 'users'} found
                            </Text>
                            
                            {result.map((item: any) => (
                                <View key={item.id} style={styles.userItem}>
                                    <View style={styles.userContent}>
                                        <Avatar.Text
                                            size={48}
                                            label={getInitials(item.name)}
                                            style={[styles.userAvatar, { backgroundColor: getAvatarColor(item.name) }]}
                                            labelStyle={styles.userAvatarLabel}
                                        />
                                        
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{item.name}</Text>
                                            <Text style={styles.userEmail}>{item.email}</Text>
                                        </View>

                                        <View style={styles.userActions}>
                                            {friendStatus[item.id] ? (
                                                <Chip
                                                    style={styles.friendChip}
                                                    textStyle={styles.friendChipText}
                                                    icon="check"
                                                >
                                                    Friends
                                                </Chip>
                                            ) : (
                                                <Button
                                                    mode="contained"
                                                    onPress={() => addFriend(item.id, item.name)}
                                                    loading={addingFriends[item.id]}
                                                    disabled={addingFriends[item.id]}
                                                    style={styles.addButton}
                                                    contentStyle={styles.addButtonContent}
                                                    labelStyle={styles.addButtonLabel}
                                                    buttonColor="#4dabf7"
                                                >
                                                    {addingFriends[item.id] ? 'Adding...' : 'Add'}
                                                </Button>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </View>
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
    headerTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    searchSection: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    searchbar: {
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    searchInput: {
        fontSize: 16,
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    clearButtonText: {
        color: '#4dabf7',
        fontSize: 14,
        fontWeight: '500',
    },
    searchHistorySection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 12,
    },
    historyChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    historyChip: {
        backgroundColor: '#e3f2fd',
    },
    historyChipText: {
        color: '#4dabf7',
        fontSize: 14,
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    hintContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    hintText: {
        color: '#6c757d',
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        color: '#6c757d',
        fontSize: 16,
        marginTop: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 22,
    },
    resultsList: {
        paddingTop: 16,
    },
    userItem: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#f1f3f4',
    },
    userContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    userAvatar: {
        marginRight: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userAvatarLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a2e',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#6c757d',
    },
    userActions: {
        justifyContent: 'center',
    },
    addButton: {
        borderRadius: 20,
        minWidth: 80,
    },
    addButtonContent: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    addButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    friendChip: {
        backgroundColor: '#d4edda',
    },
    friendChipText: {
        color: '#155724',
        fontSize: 12,
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 20,
    },
});