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

// ─── Customer Info Update Listener ──────────────────────────────────────────────

export const addCustomerInfoListener = (callback: (isPremium: boolean) => void) => {
    if (IS_DEV) return () => {};

    try {
        const listener = (info: CustomerInfo) => {
            const active = info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
            callback(active);
        };
        Purchases.addCustomerInfoUpdateListener(listener);
        return () => {
            try {
                Purchases.removeCustomerInfoUpdateListener(listener);
            } catch (e) {
                // Ignore cleanup error
            }
        };
    } catch (e) {
        console.error('addCustomerInfoListener error:', e);
        return () => {};
    }
};

// ─── Get Monthly Package Details ───────────────────────────────────────────────

export type PackageDetails = {
    priceString: string;
    title?: string;
    description?: string;
};

export const getMonthlyPackageDetails = async (): Promise<PackageDetails> => {
    if (IS_DEV) {
        return {
            priceString: '$7.99',
            title: 'اشتراك شهري',
            description: 'وصول غير محدود لجميع المحتويات',
        };
    }

    try {
        const offering = await getOfferings();
        const pkg = offering?.monthly ?? offering?.availablePackages[0];
        if (pkg) {
            return {
                priceString: pkg.product.priceString,
                title: pkg.product.title,
                description: pkg.product.description,
            };
        }
    } catch (e) {
        console.error('getMonthlyPackageDetails error:', e);
    }

    return {
        priceString: '$7.99',
        title: 'اشتراك شهري',
    };
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
        const pkg = offerings.current?.monthly ?? offerings.current?.availablePackages[0];

        if (!pkg) {
            console.warn('No monthly or available package found in current offering');
            return false;
        }

        const { customerInfo } = await Purchases.purchasePackage(pkg);
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