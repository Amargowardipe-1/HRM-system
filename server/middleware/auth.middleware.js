const { verifyJwt } = require("../utils/auth.helper");
const User = require("../modules/user/user.model");
const RolePermission = require("../modules/role/rolePermission.model");

// Middleware to verify JWT token and validate user account status
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: No Token Provided",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    
    try {
      // Synchronous token verification (callback removed - Improvement 3)
      decoded = verifyJwt(token);
    } catch (jwtError) {
      // Proper Error Handling: 401 for JWT signature/expired errors (Improvement 4)
      return res.status(401).json({
        success: false,
        message: "Access Denied: Invalid or Expired Token",
      });
    }

    // Database lookup to verify user status (Improvement 5)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: User not found",
      });
    }

    // Block deactivated user access
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Account is deactivated. Please contact your administrator",
      });
    }

    // Attach verified user db profile to request (Improvement 6 optimization)
    req.user = user; 
    next();
  } catch (error) {
    // Proper Error Handling: 500 for internal server/database exceptions (Improvement 4)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Authentication",
    });
  }
};

// Middleware to authorize specific roles (Backward compatibility)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Role '${req.user?.role || "Guest"}' is not authorized to perform this action`,
      });
    }
    next();
  };
};

// Middleware to authorize specific permission dynamically (supports OR logic with multiple permissions)
const checkPermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access Denied: Authentication required",
        });
      }

      const rolePermission = await RolePermission.findOne({ role: req.user.role });
      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: No permissions configured for role '${req.user.role}'`,
        });
      }

      const hasPermission = requiredPermissions.some((perm) => rolePermission.permissions.includes(perm));
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Insufficient permissions (requires one of: ${requiredPermissions.join(", ")})`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error in Authorization",
      });
    }
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  checkPermission,
};
