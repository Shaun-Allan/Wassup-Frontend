import axios from 'axios';
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Appbar, List, Searchbar } from 'react-native-paper';
import { UserContext } from '../UserContext';




export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user } = useContext(UserContext);
  const [friends, setFriends] = React.useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://192.168.1.7:5002/users/${user.id}/friends`);
      if (res.status === 200) {
        setFriends(res.data);
        console.log("Friends fetched successfully");
      } else {
        console.log("Failed to fetch friends");
      }
    };
    fetchData();
  }, [user.id]);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Wassup" />
      </Appbar.Header>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        {friends.map((item: any) => (
          <Pressable
            key={item.id}
            onPress={() => router.push({
              pathname: '/dm',
              params: { friend: JSON.stringify({ id: item.id, name: item.name, email: item.email }), },
            })}
          >
        <List.Item
          style={styles.listItem}
          titleStyle={styles.listItemText}
          title={item.name}
          right={props => (
            <List.Icon {...props} icon="chevron-right" />
          )
          }
        />
      </Pressable>
        ))}
    </View >
    </>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  searchbar: {
    marginBottom: 10,
  },
  listItem: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'white',  // Important for shadows to show
    marginTop: 12,

    // Android elevation
    elevation: 3,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,

    // Border
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});