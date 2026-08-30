import { clerkClient } from '@clerk/express';

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = await req.auth();
        const hasPremiumPlan = await has({ plan: 'premium' });
        
        if (!userId) {
            // This should be 401 Unauthorized, not continuing
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const user = await clerkClient.users.getUser(userId);
        
        // Initialize free_usage if it doesn't exist
        const currentFreeUsage = user.privateMetadata?.free_usage || 0;
        req.free_usage = currentFreeUsage;
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
}