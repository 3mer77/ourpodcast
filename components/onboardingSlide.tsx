import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'

type Props = {
    title: string
    description: string
    image: any
    onNext?: () => void
}

export default function OnboardingSlide({
    title,
    description,
    image,
}: Props) {
    const router = useRouter()

    return (
        <View className="flex-1 relative">

            {/* IMAGE */}
            <Image
                source={image}
                className="w-full h-[60%]"
                resizeMode="cover"
            />

            {/* GRADIENT */}
            <LinearGradient
                colors={['transparent', '#02140f']}
                className="absolute bottom-0 w-full h-[60%]"
            />

            {/* TEXT */}
            <View className="absolute bottom-40 w-full px-6">

                {/* TITLE */}
                <Text
                    className="text-white text-3xl text-center"
                    style={{ fontFamily: 'IBMPlex-Bold' }}
                >
                    {title}
                </Text>

                {/* DESCRIPTION */}
                <Text
                    className="text-neutral text-center mt-4"
                    style={{ fontFamily: 'IBMPlex-Regular' }}
                >
                    {description}
                </Text>

            </View>

            {/* SKIP BUTTON */}
            <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                className="absolute top-12 right-5"
            >
                <Text
                    className="text-neutral text-md mr-4"
                    style={{ fontFamily: 'IBMPlex-Medium' }}
                >
                    تخطي
                </Text>
            </TouchableOpacity>

        </View>
    )
}