import React, { useEffect, useState } from 'react';
import { Suspense } from 'react';
import jwtDecode from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyToken } from '../../api/authApi';
import logger from '../../utils/securityLogger';
import { updateUserInfo, logoutUser } from '../../store/Reducers/authReducer';

const ACTIVITY_TIMEOUT = 15 * 60 * 1000;

const ProtectRoute = ({ route, children }) => {
    const { role, userInfo, token } = useSelector(state => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const [isValidToken, setIsValidToken] = useState(null);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // 1. Server-side token validation
    useEffect(() => {
        let isMounted = true;

        const validateToken = async () => {
            try {
                logger.tokenValidation({ operation: 'start' });

                // Handle empty token
                if (!token) {
                    setIsValidToken(false);
                    return;
                }

                const { valid, user } = await verifyToken(token);

                if (isMounted) {
                    if (valid) {
                        logger.tokenValidation({ status: 'success' });
                        setIsValidToken(true);
                        if (user) {
                            dispatch(updateUserInfo(user));
                        }
                    } else {
                        logger.tokenValidation({ status: 'invalid' });
                        setIsValidToken(false);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    logger.tokenValidation({
                        status: 'error',
                        error: error.message
                    });
                    // Fallback to client-side validation if API fails
                    if (token) {
                        const decoded = jwtDecode(token);
                        if (decoded && decoded.exp * 1000 > Date.now()) {
                            setIsValidToken(true);
                        } else {
                            setIsValidToken(false);
                        }
                    } else {
                        setIsValidToken(false);
                    }
                }
            }
        };

        if (token) {
            validateToken();
            const interval = setInterval(validateToken, 300000);
            return () => clearInterval(interval);
        } else {
            setIsValidToken(false);
        }

        return () => { isMounted = false; };
    }, [token, dispatch]);

    // 2. Activity timeout tracker
    useEffect(() => {
        const activities = ['mousemove', 'keypress', 'scroll', 'click'];
        const resetTimer = () => setLastActivity(Date.now());

        activities.forEach(event =>
            window.addEventListener(event, resetTimer)
        );

        return () => activities.forEach(event =>
            window.removeEventListener(event, resetTimer)
        );
    }, []);

    // 3. Session expiration check
    useEffect(() => {
        const checkTimeout = setInterval(() => {
            if (Date.now() - lastActivity > ACTIVITY_TIMEOUT) {
                // Use sessionEvent instead of info
                logger.sessionEvent('expired', {
                    email: userInfo?.email,
                    path: location.pathname
                });
                clearInterval(checkTimeout);
                dispatch(logoutUser());
            }
        }, 60000);

        return () => clearInterval(checkTimeout);
    }, [lastActivity, userInfo, dispatch, location.pathname]);

    const safePath = location.pathname.replace(/[a-f0-9]{24}/gi, '[ID]');

    const checkAuthorization = () => {
        if (isValidToken === false) {
            // Use warn instead of logger.warn
            logger.warn('INVALID_TOKEN_ATTEMPT', { path: safePath });
            return <Navigate to="/login" replace state={{ from: location }} />;
        }

        if (route.role && userInfo?.role !== route.role) {
            logger.accessViolation(safePath, userInfo);
            return <Navigate to="/unauthorized" replace />;
        }

        if (route.status && userInfo?.status !== route.status) {
            return handleStatusRedirect(userInfo?.status);
        }

        if (route.visibility && !route.visibility.includes(userInfo?.status)) {
            return handleStatusRedirect(userInfo?.status);
        }

        if (route.ability === 'seller' && userInfo?.role !== 'seller') {
            logger.warn('ABILITY_VIOLATION', {
                path: safePath,
                ability: 'seller'
            });
            return <Navigate to="/unauthorized" replace />;
        }

        return children;
    };

    const handleStatusRedirect = (status) => {
        switch (status) {
            case 'pending':
                return <Navigate to='/seller/account-pending' replace />;
            case 'deactivated':
                return <Navigate to='/seller/account-deactive' replace />;
            default:
                // Use error instead of logger.error
                logger.error('UNKNOWN_STATUS', {
                    status,
                    path: safePath
                });
                return <Navigate to="/error" replace />;
        }
    };

    if (isValidToken === null) {
        return (
            <div className="security-loader">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Verifying security...</span>
                </div>
                <p className="mt-2">Verifying session security</p>
            </div>
        );
    }

    if (!role || !userInfo || !token) {
        // Use info method
        logger.info('UNAUTHENTICATED_ACCESS', { path: safePath });
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return (
        <Suspense fallback={
            <div className="security-loader">
                <div className="spinner-border text-secondary" role="status"></div>
            </div>
        }>
            {checkAuthorization()}
        </Suspense>
    );
};

export default ProtectRoute;