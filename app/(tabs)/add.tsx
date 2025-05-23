import axios from 'axios';
import * as React from 'react';
import { useContext } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, List, Searchbar } from 'react-native-paper';
import { UserContext } from '../UserContext';

export default function AddScreen() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [result, setResult] = React.useState<any>([]);
    const { user } = useContext(UserContext);
    const [friendStatus, setFriendStatus] = React.useState<{ [key: string]: boolean }>({});


    const handleSearch = async (query: any) => {
        setSearchQuery(query);
        if (query.length > 0) {
            const res = await axios.post("http://192.168.1.7:5001/search", {
                query: query,
            });

            if (res.status === 200 && res.data.length > 0) {
                const users = res.data;
                setResult(users);

                // Check friend status for each user
                const statuses: { [key: string]: boolean } = {};
                await Promise.all(
                    users.map(async (userItem: any) => {
                        const isFriend = await checkFriend(userItem.id);
                        statuses[userItem.id] = isFriend;
                    })
                );
                setFriendStatus(statuses);
            } else {
                setResult([]);
                setFriendStatus({});
            }
        } else {
            setResult([]);
            setFriendStatus({});
        }
    };

    const addFriend = async (id: any) => {
        const res = await axios.post("http://192.168.1.7:5002/addFriend", {
            user_id: user.id,
            friend_id: id,
        })
        if (res.status === 200) {
            console.log("Friend added successfully");
        }
        else {
            console.log("Failed to add friend");
        }
    }


    const checkFriend = async (id: any) => {
        const res = await axios.post("http://192.168.1.7:5002/checkFriends", {
            user_id: user.id,
            friend_id: id,
        })
        if (res.status === 200) {
            return res.data.are_friends;
        }
        else {
            return true;
        }
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.Content title="Add Friends" />
            </Appbar.Header>
            <SafeAreaView style={styles.container}>
                <Searchbar
                    style={styles.searchbar}
                    placeholder="Search"
                    onChangeText={handleSearch}
                    value={searchQuery}
                />
                {result.map((item: any) => (
                    <List.Item
                        style={styles.listItem}
                        titleStyle={styles.listItemText}
                        key={item.id}
                        title={item.name}
                        right={props =>
                            !friendStatus[item.id] && (
                                <TouchableOpacity onPress={() => addFriend(item.id)}>
                                    <List.Icon {...props} icon="plus" />
                                </TouchableOpacity>
                            )
                        }
                    />
                ))}

            </SafeAreaView>
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    searchbar: {
        marginBottom: 16,
    },
    listItem: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: 'white',  // Important for shadows to show
        marginBottom: 12,

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
})