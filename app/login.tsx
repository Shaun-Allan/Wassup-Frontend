import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../context/UserContext";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.company}>Wassup</Text>
            <Text style={styles.subtitle}>Connect with your world</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.description}>
                Sign in to continue to your account
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                theme={{
                  colors: {
                    primary: '#4dabf7',
                    outline: '#e9ecef',
                    onSurfaceVariant: '#6c757d',
                  }
                }}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
              />
              
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                theme={{
                  colors: {
                    primary: '#4dabf7',
                    outline: '#e9ecef',
                    onSurfaceVariant: '#6c757d',
                  }
                }}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
              />
            </View>

            {/* Error Message */}
            {error !== "" && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Button 
              style={styles.button} 
              mode="contained" 
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              buttonColor="#4dabf7"
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* Forgot Password */}
            <Text style={styles.forgotPassword}>
              Forgot your password?
            </Text>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupLink}>
                  Create Account
                </Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  company: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#b8c5d6",
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 32,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: "#1a1a2e",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: "#6c757d",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
  },
  inputContainer: {
    gap: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#ffffff",
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  inputContent: {
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#ffe6e6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#4dabf7",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  forgotPassword: {
    color: "#4dabf7",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
    textDecorationLine: "underline",
  },
  signupContainer: {
    alignItems: "center",
  },
  signupText: {
    color: "#6c757d",
    fontSize: 15,
    fontWeight: "400",
  },
  signupLink: {
    color: "#4dabf7",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "#b8c5d6",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "300",
    lineHeight: 16,
  },
});