import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const CategorySelector = ({ categories, activeCategory, onSelect }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => {
                const isActive = category === activeCategory;
                return (
                    <TouchableOpacity
                        key={category}
                        style={[styles.chip, isActive && styles.activeChip]}
                        onPress={() => onSelect(category)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    activeChipText: {
        color: COLORS.white,
    },
});

export default CategorySelector;
