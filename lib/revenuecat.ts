import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PurchasesOffering,
} from 'react-native-purchases';

// ─── Config ───────────────────────────────────────────────────────────────────

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? 'test_axVYeCsmYAdPyenNuYkiIOXAhIV';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? 'test_axVYeCsmYAdPyenNuYkiIOXAhIV';

export const PREMIUM_ENTITLEMENT = 'premium';

// ✅ Enable dev mode to bypass real purchases
const IS_DEV = __DEV__;

// ─── Setup ────────────────────────────────────────────────────────────────────

export const setupRevenueCat = async (userId?: string) => {
    if (IS_DEV) {
        console.log('🔧 DEV MODE: RevenueCat setup skipped');
        return;
    }

    try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
        await Purchases.configure({ apiKey: key });

        // ✅ link to Supabase user so purchases persist across devices
        if (userId) {
            await Purchases.logIn(userId);
        }

        console.log('RevenueCat configured');
    } catch (e) {
        console.error('RevenueCat setup error:', e);
    }
};

// ─── Check premium ────────────────────────────────────────────────────────────

export const checkIsPremium = async (): Promise<boolean> => {
    if (IS_DEV) {
        console.log('🔧 DEV MODE: Returning false for isPremium (free tier)');
        return false;
    }

    try {
        const info: CustomerInfo = await Purchases.getCustomerInfo();
        return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
    } catch (e) {
        console.error('checkIsPremium error:', e);
        return false;
    }
};

// ─── Get offerings ────────────────────────────────────────────────────────────

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    if (IS_DEV) {
        console.log('🔧 DEV MODE: Returning mock offerings');
        return null;
    }

    try {
        const offerings = await Purchases.getOfferings();
        return offerings.current;
    } catch (e) {
        console.error('getOfferings error:', e);
        return null;
    }
};

// ─── Purchase ─────────────────────────────────────────────────────────────────

export const purchasePremium = async (): Promise<boolean> => {
    // ✅ Mock purchase in development
    if (IS_DEV) {
        console.log('🔧 DEV MODE: Mock purchase successful');
        return true;
    }

    try {
        const offerings = await Purchases.getOfferings();
        const monthly = offerings.current?.monthly;

        if (!monthly) {
            console.warn('No monthly package found');
            return false;
        }

        const { customerInfo } = await Purchases.purchasePackage(monthly);
        return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
    } catch (e: any) {
        if (!e.userCancelled) console.error('purchasePremium error:', e);
        return false;
    }
};

// ─── Restore ──────────────────────────────────────────────────────────────────

export const restorePurchases = async (): Promise<boolean> => {
    if (IS_DEV) {
        console.log('🔧 DEV MODE: Mock restore successful');
        return true;
    }

    try {
        const info = await Purchases.restorePurchases();
        return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
    } catch (e) {
        console.error('restorePurchases error:', e);
        return false;
    }
};