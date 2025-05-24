import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, List, Searchbar, Text } from 'react-native-paper';
import { UserContext } from '../../context/UserContext';

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`http://192.168.1.7:5004/users/${user.id}/groups`);
      if (res.status === 200 && res.data && res.data.length > 0) {
        setGroups(res.data);
        setFilteredGroups(res.data);
        console.log("Groups fetched successfully");
      } else {
        console.log("Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user.id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter((group: any) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
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

  const getMemberCountText = (memberCount: number) => {
    if (memberCount === 1) return '1 member';
    return `${memberCount} members`;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient colors={['#1a1a2e', '#16213e']}>
        <Appbar.Header style={styles.header}>
          <Appbar.Content 
            title="Groups" 
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action 
            icon="plus" 
            iconColor="#ffffff"
            onPress={() => router.push('/create-group')}
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
          <Text style={styles.welcomeText}>Your Groups</Text>
          <Text style={styles.groupsCount}>
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
          </Text>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search groups..."
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

        {/* Groups List */}
        <ScrollView
          style={styles.groupsList}
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
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'Try searching with a different group name' 
                  : 'Create your first group to start chatting!'
                }
              </Text>
            </View>
          ) : (
            filteredGroups.map((group: any, index: number) => (
              <Pressable
                key={group.id}
                onPress={() => router.push({
                  pathname: '/groupchat',
                  params: { group: JSON.stringify(group) },
                })}
                style={({ pressed }) => [
                  styles.groupItem,
                  pressed && styles.groupItemPressed
                ]}
              >
                <View style={styles.groupContent}>
                  <View style={styles.avatarContainer}>
                    <Avatar.Text
                      size={52}
                      label={getInitials(group.name)}
                      style={[styles.avatar, { backgroundColor: getAvatarColor(group.name) }]}
                      labelStyle={styles.avatarLabel}
                    />
                  </View>
                  
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupDescription} numberOfLines={1}>
                      {group.description || 'No description'}
                    </Text>
                    <Text style={styles.memberCount}>
                      {getMemberCountText(group.memberCount || 0)}
                    </Text>
                  </View>

                  <View style={styles.groupActions}>
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
  groupsCount: {
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
  groupsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  groupItem: {
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
  groupItemPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 1,
  },
  groupContent: {
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
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
    color: '#4dabf7',
    fontWeight: '500',
  },
  groupActions: {
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