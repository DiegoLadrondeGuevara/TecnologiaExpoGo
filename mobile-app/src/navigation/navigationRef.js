import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Global navigation ref — allows navigation from outside React components
 * (e.g. push notification response listeners).
 */
export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen safely. No-ops if the navigator isn't mounted yet.
 * @param {string} name  - Route name (e.g. 'ProfileTab')
 * @param {object} params - Navigation params (e.g. { screen: 'MyOrders' })
 */
export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        console.warn('🧭 Navigation not ready — ignoring navigate call to', name);
    }
}
