import { useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // If Supabase email confirmation is enabled, session is null until confirmed
    if (!data.session) {
      setAwaitingConfirmation(true)
    }
    // If confirmation is disabled, onAuthStateChange in root layout handles navigation
  }

  if (awaitingConfirmation) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold mb-2">Check your email</Text>
          <Text className="text-muted-foreground mb-10">
            We sent a confirmation link to {email}. Click it to activate your account.
          </Text>
          <Button variant="outline" onPress={() => router.replace('/(auth)/login')}>
            <Text>Back to sign in</Text>
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold mb-2">Create account</Text>
        <Text className="text-muted-foreground mb-10">
          Get started with Dovo Health
        </Text>

        <Input
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
          className="mb-4"
        />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="mb-4"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          className="mb-6"
        />

        {error && (
          <Text className="text-destructive text-sm mb-4">{error}</Text>
        )}

        <Button onPress={handleSignup} disabled={loading}>
          <Text>{loading ? 'Creating account…' : 'Create account'}</Text>
        </Button>

        <Button variant="ghost" className="mt-4" onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-muted-foreground">Already have an account? Sign in</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
