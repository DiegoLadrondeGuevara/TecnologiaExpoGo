import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MessageSquare, Send, User } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from './StarRating';
import { getProductReviews, createReview } from '../api/reviewService';

/**
 * ReviewSection — shows reviews list + write review form
 * Used inside DetailsScreen
 */
const ReviewSection = ({ productId }) => {    const { user } = useAuth();
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    // Write review state
    const [showForm, setShowForm] = useState(false);
    const [newStars, setNewStars] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            const data = await getProductReviews(productId);
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
        } catch (e) {
            console.warn('Failed to load reviews:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert(
                t('reviews.loginRequired') || 'Login Required',
                t('reviews.loginMessage') || 'Please log in to leave a review.',
            );
            return;
        }

        setSubmitting(true);
        try {
            const review = await createReview(productId, newStars, newComment.trim() || undefined);
            setReviews((prev) => [review, ...prev]);
            setTotalReviews((prev) => prev + 1);
            setAverageRating(
                (averageRating * totalReviews + newStars) / (totalReviews + 1),
            );
            setShowForm(false);
            setNewComment('');
            setNewStars(5);
        } catch (error) {
            const msg =
                error?.message || error?.response?.data?.message || 'Error';
            Alert.alert(
                t('reviews.error') || 'Error',
                msg.includes('purchased')
                    ? t('reviews.mustPurchase') || 'You can only review products you have purchased.'
                    : msg.includes('already')
                        ? t('reviews.alreadyReviewed') || 'You already reviewed this product.'
                        : msg,
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Check if current user already reviewed
    const userAlreadyReviewed = user && reviews.some((r) => r.userId === user.id || r.user?.id === user.id);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={COLORS.black} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.sectionTitle}>
                        {t('reviews.title') || 'Reviews'}
                    </Text>
                    <View style={styles.ratingRow}>
                        <StarRating rating={averageRating} size={16} />
                        <Text style={styles.ratingText}>
                            {averageRating.toFixed(1)} ({totalReviews})
                        </Text>
                    </View>
                </View>
                {user && !userAlreadyReviewed && !showForm && (
                    <TouchableOpacity
                        style={styles.writeBtn}
                        onPress={() => setShowForm(true)}
                    >
                        <MessageSquare size={14} color={COLORS.white} />
                        <Text style={styles.writeBtnText}>
                            {t('reviews.write') || 'Write'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Write Review Form */}
            {showForm && (
                <View style={styles.form}>
                    <Text style={styles.formLabel}>
                        {t('reviews.yourRating') || 'Your rating'}
                    </Text>
                    <StarRating
                        rating={newStars}
                        size={28}
                        interactive
                        onRate={setNewStars}
                    />
                    <TextInput
                        style={styles.commentInput}
                        placeholder={t('reviews.commentPlaceholder') || 'Share your experience (optional)'}
                        placeholderTextColor={COLORS.textSecondary}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                        maxLength={500}
                    />
                    <View style={styles.formActions}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => { setShowForm(false); setNewComment(''); }}
                        >
                            <Text style={styles.cancelBtnText}>
                                {t('common.cancel') || 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Send size={14} color={COLORS.white} />
                                    <Text style={styles.submitBtnText}>
                                        {t('reviews.submit') || 'Submit'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Text style={styles.emptyText}>
                    {t('reviews.noReviews') || 'No reviews yet. Be the first!'}
                </Text>
            ) : (
                reviews.slice(0, 5).map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.avatarWrap}>
                                <User size={14} color={COLORS.textSecondary} />
                            </View>
                            <View style={styles.reviewMeta}>
                                <Text style={styles.reviewAuthor}>
                                    {review.user?.name || 'User'}
                                </Text>
                                <StarRating rating={review.stars} size={12} />
                            </View>
                            <Text style={styles.reviewDate}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        {review.comment && (
                            <Text style={styles.reviewComment}>
                                {review.comment}
                            </Text>
                        )}
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    writeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.black,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    writeBtnText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    // ─── Form ───
    form: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },
    formLabel: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    commentInput: {
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 12,
        color: COLORS.textPrimary,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    cancelBtnText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.black,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    // ─── Reviews List ───
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    reviewCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewMeta: {
        flex: 1,
    },
    reviewAuthor: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    reviewDate: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '500',
    },
    reviewComment: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginTop: 10,
    },
});
export default ReviewSection;
