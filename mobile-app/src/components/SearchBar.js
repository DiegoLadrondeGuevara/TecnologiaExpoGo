import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

const SearchBar = ({ value, onChangeText, placeholder = 'Search products...' }) => {
    return (
        <View style={styles.container}>
            <Search size={18} color={COLORS.textSecondary} style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textSecondary}
                returnKeyType="search"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <X
                    size={18}
                    color={COLORS.textSecondary}
                    onPress={() => onChangeText('')}
                    style={styles.clearIcon}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        height: '100%',
    },
    clearIcon: {
        marginLeft: 8,
    },
});

export default SearchBar;
