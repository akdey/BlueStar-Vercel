from app.features.users.user_entity import UserRole

# Dictionary mapping 'HTTP_METHOD:PATH_REGEX' to allowed roles
# If a route is not in this map but is not public, we can decide policies (allow all authenticated or block).
# Here we will define specific protected routes.

ROLE_MAPPING = {
    # User Management
    r"GET:^/users/$": [UserRole.ADMIN, UserRole.MANAGER],
    r"GET:^/users/\d+$": [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    r"PATCH:^/users/activate/\d+$": [UserRole.ADMIN],
    r"PATCH:^/users/deactivate/\d+$": [UserRole.ADMIN],
    
    # Parties
    r"DELETE:^/parties/\d+$": [UserRole.ADMIN],                # Only Admin can delete parties
    
    # Default policy for other routes:
    # If not matched, we grant access to all authenticated users by default? 
    # Or strict blocking? 
    # For now, let's assume if it is not here, any valid Role is allowed.
}
