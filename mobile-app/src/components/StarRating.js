import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

/**
 * StarRating — reusable star display/input
 * @param {number} rating - current rating (1-5)
 * @param {number} size - star size in px
 * @param {boolean} interactive - whether stars are tappable
 * @param {function} onRate - called with new rating when tapped
 */
const StarRating = ({ rating = 0, size = 18, interactive = false, onRate, color = '#FFB800' }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <View style={styles.container}>
            {stars.map((star) => {
                const filled = star <= Math.round(rating);
                const StarWrapper = interactive ? TouchableOpacity : View;
                return (
                    <StarWrapper
                        key={star}
                        onPress={interactive ? () => onRate?.(star) : undefined}
                        style={styles.star}
                        hitSlop={interactive ? 6 : undefined}
                    >
                        <Star
                            size={size}
                            color={color}
                            fill={filled ? color : 'none'}
                        />
                    </StarWrapper>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    star: {
        padding: 2,
    },
});

export default StarRating;
