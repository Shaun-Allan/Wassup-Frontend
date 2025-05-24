import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Badge, List, Searchbar, Text } from 'react-native-paper';
import { UserContext } from '../../context/UserContext';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user } = useContext(UserContext);
  const [friends, setFriends] = React.useState<any>([]);
  const [filteredFriends, setFilteredFriends] = React.useState<any>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`http://192.168.1.7:5002/users/${user.id}/friends`);
      if (res.status === 200) {
        setFriends(res.data);
        setFilteredFriends(res.data);
        console.log("Friends fetched successfully");
      } else {
        console.log("Failed to fetch friends");
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
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

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
      >
        <Appbar.Header style={styles.header}>
          <Appbar.Content 
            title="Wassup" 
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action 
            icon="account-plus" 
            iconColor="#ffffff"
            onPress={() => {/* Add friend functionality */}}
          />
          <Appbar.Action 
            icon="dots-vertical" 
            iconColor="#ffffff"
            onPress={() => {/* Menu functionality */}}
          />
        </Appbar.Header>
      </LinearGradient>

      <View style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</Text>
          <Text style={styles.friendsCount}>
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'} online
          </Text>
        </View>

        {/* Search Bar */}
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

        {/* Friends List */}
        <ScrollView
          style={styles.friendsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4dabf7']}
              tintColor="#4dabf7"
            />
          }
        >
          {filteredFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'Try searching with a different name or email' 
                  : 'Add some friends to start messaging!'
                }
              </Text>
            </View>
          ) : (
            filteredFriends.map((item: any, index: number) => (
              <Pressable
                key={item.id}
                onPress={() => router.push({
                  pathname: '/dm',
                  params: { 
                    friend: JSON.stringify({ 
                      id: item.id, 
                      name: item.name, 
                      email: item.email 
                    })
                  },
                })}
                style={({ pressed }) => [
                  styles.friendItem,
                  pressed && styles.friendItemPressed
                ]}
              >
                <View style={styles.friendContent}>
                  <View style={styles.avatarContainer}>
                    <Avatar.Text
                      size={52}
                      label={getInitials(item.name)}
                      style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}
                      labelStyle={styles.avatarLabel}
                    />
                    <Badge 
                      style={styles.onlineBadge}
                      size={14}
                    />
                  </View>
                  
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.name}</Text>
                    <Text style={styles.friendEmail}>{item.email}</Text>
                    <Text style={styles.lastSeen}>Active now</Text>
                  </View>

                  <View style={styles.friendActions}>
                    <List.Icon 
                      icon="chevron-right" 
                      color="#b8c5d6"
                      style={styles.chevronIcon}
                    />
                  </View>
                </View>
              </Pressable>
            ))
          )}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
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
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  friendsCount: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '400',
  },
  searchbar: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 16,
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  friendItem: {
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
  friendItemPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 1,
  },
  friendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  friendActions: {
    justifyContent: 'center',
  },
  chevronIcon: {
    margin: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
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
  bottomSpacing: {
    height: 20,
  },
});