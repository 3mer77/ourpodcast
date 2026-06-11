import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

/**
 * Custom Text component
 *
 * Automatically applies IBM Plex Arabic font based on fontWeight:
 * - bold / 700     → IBMPlex-Bold
 * - 500 / medium   → IBMPlex-Medium
 * - everything else → IBMPlex-Regular
 *
 * Usage — just replace all:
 *   import { Text } from 'react-native'
 * with:
 *   import Text from '@/components/Text'
 */

type Props = TextProps & {
    weight?: 'regular' | 'medium' | 'bold';
};

const Text: React.FC<Props> = ({ style, weight, ...props }) => {
    // flatten the style so we can read fontWeight from it
    const flat = StyleSheet.flatten(style) ?? {};
    const fw = flat.fontWeight;

    // pick font family based on weight prop or fontWeight in style
    let fontFamily = 'IBMPlex-Regular';

    if (
        weight === 'bold' ||
        fw === 'bold' ||
        fw === '700' ||
        fw === '800' ||
        fw === '900'
    ) {
        fontFamily = 'IBMPlex-Bold';
    } else if (
        weight === 'medium' ||
        fw === '500' ||
        fw === '600'
    ) {
        fontFamily = 'IBMPlex-Medium';
    }

    return (
        <RNText
            {...props}
            style={[style, { fontFamily }]}
        />
    );
};

export default Text;