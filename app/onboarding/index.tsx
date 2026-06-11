import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { onboardingData } from '../../app/onboarding/data'
import OnboardingSlide from '../../components/onboardingSlide'

const { width } = Dimensions.get('window')

export default function Onboarding() {
    const router = useRouter()
    const flatListRef = useRef<FlatList>(null)

    const [currentIndex, setCurrentIndex] = useState(0)

    // ✅ BUTTON LOGIC (THIS IS WHAT YOU ASKED FOR)
    const handleNext = async () => {
        const nextIndex = currentIndex + 1

        if (nextIndex < onboardingData.length) {
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            })

            setCurrentIndex(nextIndex)
        } else {
            await AsyncStorage.setItem('onboardingDone', 'true')
            router.replace('/(tabs)')
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-dark">

            {/* SLIDES */}
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                horizontal
                pagingEnabled
                scrollEnabled={false}  
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ width }} className="flex-1">
                        <OnboardingSlide
                            title={item.title}
                            description={item.description}
                            image={item.image}
                        />
                    </View>
                )}
            />

            {/* PAGINATION DOTS */}
            <View className="flex-row justify-center mb-6">
                {onboardingData.map((_, i) => (
                    <View
                        key={i}
                        className={`h-2 rounded-full mx-1 ${i === currentIndex
                            ? 'bg-primary w-5'
                            : 'bg-neutral w-2'
                            }`}
                    />
                ))}
            </View>

            {/* NEXT BUTTON */}
            <View className="px-6 mb-10">
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-primary py-4 rounded-full items-center"
                >
                    <Text className="text-white font-bold text-lg">
                        {currentIndex === onboardingData.length - 1
                            ? 'ابدأ الآن'
                            : 'التالي'}
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}