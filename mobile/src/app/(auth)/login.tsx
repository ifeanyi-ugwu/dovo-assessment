import { useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
    // Navigation is handled by the session listener in root _layout
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold mb-2">Welcome back</Text>
        <Text className="text-muted-foreground mb-10">
          Sign in to your Dovo Health account
        </Text>

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
          autoComplete="password"
          className="mb-6"
        />

        {error && (
          <Text className="text-destructive text-sm mb-4">{error}</Text>
        )}

        <Button onPress={handleLogin} disabled={loading}>
          <Text>{loading ? 'Signing in…' : 'Sign in'}</Text>
        </Button>

        <Button variant="ghost" className="mt-4" onPress={() => router.replace('/(auth)/signup')}>
          <Text className="text-muted-foreground">Don't have an account? Sign up</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
