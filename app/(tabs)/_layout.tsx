import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                header: () => <Header />,
                headerShown: true,
                // ✅ Remove default header height so our custom header controls its own spacing
                headerStyle: { height: 0 },

                tabBarStyle: {
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#0bd46c',
                tabBarInactiveTintColor: '#aaa',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'headset' : 'headset-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}