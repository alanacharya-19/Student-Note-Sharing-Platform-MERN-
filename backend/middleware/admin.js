const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

const adminOrOwner = (model) => async (req, res, next) => {
    try {
        const resource = await model.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Check if user is admin or owner of the resource
        const isAdmin = req.user.role === 'admin';
        const isOwner = resource.uploadedBy?.toString() === req.user._id.toString() ||
                       resource.userId?.toString() === req.user._id.toString();

        if (isAdmin || isOwner) {
            req.resource = resource; // Attach resource to request for later use
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own resources.'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    adminOnly,
    adminOrOwner
};
