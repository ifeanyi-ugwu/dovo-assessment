import { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView, ScrollView, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { fetchSubscriptionStatus, type SubscriptionStatus } from '@/lib/api'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  first_name: string
  metabolic_plan_status: string
}

export default function DashboardScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: profileData }, subscriptionData] = await Promise.all([
          supabase.from('profiles').select('id, first_name, metabolic_plan_status').single(),
          fetchSubscriptionStatus(),
        ])

        setProfile(profileData)
        setSubscription(subscriptionData)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    // Root layout session listener handles the redirect
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-6 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold">
            {profile ? `Hi, ${profile.first_name}` : 'Dashboard'}
          </Text>
          <Button variant="ghost" size="sm" onPress={handleSignOut}>
            <Text>Sign out</Text>
          </Button>
        </View>

        {loading && (
          <View className="flex-1 items-center justify-center py-16">
            <ActivityIndicator />
          </View>
        )}

        {error && (
          <Text className="text-destructive text-sm">{error}</Text>
        )}

        {!loading && profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Name</Text>
                <Text className="font-medium">{profile.first_name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Plan status</Text>
                <Text className="font-medium">{profile.metabolic_plan_status}</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {!loading && subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Plan</Text>
                <Text className="font-medium">{subscription.plan.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Status</Text>
                <Text className="font-medium capitalize">{subscription.subscription.status}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Amount</Text>
                <Text className="font-medium">
                  {(subscription.plan.amount / 100).toLocaleString('en-NG', {
                    style: 'currency',
                    currency: subscription.plan.currency,
                  })}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Next payment</Text>
                <Text className="font-medium">
                  {new Date(subscription.subscription.next_payment_date).toLocaleDateString()}
                </Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
