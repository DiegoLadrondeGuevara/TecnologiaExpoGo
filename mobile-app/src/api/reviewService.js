/**
 * Review Service — API calls for product reviews
 */
import apiClient from 'shared-logic/apiClient';

/**
 * Get reviews for a product (public)
 * Returns { reviews, averageRating, totalReviews }
 */
export const getProductReviews = async (productId) => {
    return apiClient.get(`/reviews/${productId}`);
};

/**
 * Create a review (must be logged in + must have purchased the product)
 */
export const createReview = async (productId, stars, comment) => {
    return apiClient.post('/reviews', { productId, stars, comment });
};
