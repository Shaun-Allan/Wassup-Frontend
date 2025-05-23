import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "./UserContext";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://192.168.1.7:5000/login", {
        email,
        password,
      });

      if (res.status === 200) {
        console.log("Login successful");
        setError(""); // clear error
        setUser(res.data.user);
        router.replace("/(tabs)");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.company}>Wassup</Text>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Welcome!</Text>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            mode="outlined"
            label="Enter Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            mode="outlined"
            label="Enter Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Error Text */}
        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        <Button style={styles.button} mode="contained" onPress={handleLogin}>
          Login
        </Button>

        <Text>
          Don't have an account?{" "}
          <Text style={{ color: "purple", textDecorationLine: "underline" }}>
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    marginBottom: 50,
  },
  input: {
    borderRadius: 10,
  },
  company: {
    color: "black",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    color: "black",
    fontSize: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: "black",
    borderRadius: 10,
  },
  content: {
    gap: 16,
  },
  errorText: {
    color: "red",
    marginTop: 8,
    marginBottom: -8,
  },
});
