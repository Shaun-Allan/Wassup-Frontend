import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom Tab Bar Background Component
function CustomTabBarBackground() {
  const insets = useSafeAreaInsets();
  
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={95}
        tint="extraLight"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
          }
        ]}
      />
    );
  }
  
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }
      ]}
    />
  );
}

// Custom Tab Bar Icon Component
function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const iconMap: { [key: string]: string } = {
    'chat': focused ? '💬' : '💭',
    'group': focused ? '👥' : '👤',
    'add': focused ? '➕' : '＋',
  };

  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerActive
    ]}>
      <View style={[
        styles.iconWrapper,
        focused && { backgroundColor: color + '15' }
      ]}>
        <View style={styles.iconContent}>
          {/* Using emoji as fallback - in real app, you'd use proper icon library */}
          <View style={[
            styles.iconBackground,
            focused && { backgroundColor: color }
          ]}>
            <View style={styles.icon}>
              {name === 'chat' && (
                <View style={[styles.chatIcon, { borderColor: focused ? '#ffffff' : color }]} />
              )}
              {name === 'group' && (
                <View style={styles.groupIconContainer}>
                  <View style={[styles.groupIcon, { backgroundColor: focused ? '#ffffff' : color }]} />
                  <View style={[styles.groupIcon, styles.groupIconSecond, { backgroundColor: focused ? '#ffffff' : color }]} />
                </View>
              )}
              {name === 'add' && (
                <View style={styles.addIconContainer}>
                  <View style={[styles.addIconLine, styles.addIconHorizontal, { backgroundColor: focused ? '#ffffff' : color }]} />
                  <View style={[styles.addIconLine, styles.addIconVertical, { backgroundColor: focused ? '#ffffff' : color }]} />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4dabf7',
        tabBarInactiveTintColor: '#6c757d',
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginTop: 4,
        },
        tabBarBackground: CustomTabBarBackground,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 + insets.bottom : 65,
          // paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 4 : 8,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: 'transparent',
          position: 'absolute',
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="chat" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="group" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Friends',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="add" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  iconWrapper: {
    borderRadius: 16,
    padding: 2,
  },
  iconContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Chat Icon Styles
  chatIcon: {
    width: 16,
    height: 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  
  // Group Icon Styles
  groupIconContainer: {
    width: 18,
    height: 14,
    position: 'relative',
  },
  groupIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  groupIconSecond: {
    right: 0,
    top: 4,
  },
  
  // Add Icon Styles
  addIconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconLine: {
    position: 'absolute',
    borderRadius: 1,
  },
  addIconHorizontal: {
    width: 12,
    height: 2,
  },
  addIconVertical: {
    width: 2,
    height: 12,
  },
});