import React, { createContext, useContext, useReducer, useMemo } from 'react';

const CartContext = createContext();

const TAX_RATE = 0.18;

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { product, quantity } = action.payload;
            const existingIndex = state.items.findIndex((item) => item.id === product.id);
            if (existingIndex >= 0) {
                const updatedItems = [...state.items];
                const newQty = updatedItems[existingIndex].quantity + quantity;
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: Math.min(newQty, product.stock),
                };
                return { ...state, items: updatedItems };
            }
            return {
                ...state,
                items: [...state.items, { ...product, quantity: Math.min(quantity, product.stock) }],
            };
        }
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
            };
        case 'UPDATE_QUANTITY': {
            const { productId, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((item) => item.id !== productId),
                };
            }
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: Math.min(quantity, item.stock) }
                        : item
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const addToCart = (product, quantity = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const cartValues = useMemo(() => {
        const subtotal = state.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            cartItems: state.items,
            subtotal,
            tax,
            total,
            itemCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        };
    }, [state.items]);

    return (
        <CartContext.Provider value={cartValues}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
