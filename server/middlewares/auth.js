// import { clerkClient } from "@clerk/express";


// // Middleware to check userId and hasPremiumPlan


// export const auth = async (req, res, next)=>{
//     try {
//         const {userId, has} = await req.auth();
//         const hashPremiumPlan = await has({plan: 'premium'});

//         const hasPremiumPlan = await clerkClient.users.getUser(userId);

//         if(!hashPremiumPlan && userId.privateMetadata.free_usage){
//             req.free_usage = userId.privateMetadata.free_usage
//         } else{
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata: {
//                     free_usage: 0
//                 }
//             })
//             req.free_usage = 0;
//         }

//         req.plan = hasPremiumPlan ? 'premium' : 'free';
//         next()
//     } catch (error) {
//         res.json({
//             success: false,
//             message: error.message
//         })
//     }
    
// }




import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const { userId } = req.auth();  // small 'u' and only userId
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // Get full user object
        const user = await clerkClient.users.getUser(userId);

        // Check plan
        const hasPremiumPlan = user.privateMetadata?.plan === 'premium'; // adjust if your plan info is stored differently

        // Free usage
        let freeUsage = user.privateMetadata?.free_usage || 0;
        req.free_usage = freeUsage;

        // Reset free_usage if user is premium
        if (hasPremiumPlan) {
            req.plan = 'premium';
            req.free_usage = 0;
        } else {
            req.plan = 'free';
        }

        req.userId = userId; // important for controller
        next();

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
