export const AUTH_SIGN_IN_LABEL = 'Sign in'
export const AUTH_SIGN_UP_LABEL = 'Create account'
export const AUTH_SIGN_OUT_LABEL = 'Sign out'

export const AUTH_EMAIL_LABEL = 'Email'
export const AUTH_EMAIL_PLACEHOLDER = 'you@example.com'

export const AUTH_PASSWORD_LABEL = 'Password'
export const AUTH_PASSWORD_PLACEHOLDER = '••••••••'

export const AUTH_NAME_LABEL = 'Full name'
export const AUTH_NAME_PLACEHOLDER = 'Your name'

export const AUTH_SIGN_IN_SUBMIT = 'Sign in'
export const AUTH_SIGN_UP_SUBMIT = 'Create account'
export const AUTH_FORGOT_PASSWORD_LABEL = 'Forgot password?'
export const AUTH_FORGOT_PASSWORD_TITLE = 'Reset your password'
export const AUTH_FORGOT_PASSWORD_SUBMIT = 'Send reset link'
export const AUTH_FORGOT_PASSWORD_SUCCESS =
	'If that email exists, a password reset link has been sent.'
export const AUTH_FORGOT_PASSWORD_INSTRUCTION = 'Enter your email and we will send a reset link.'

export const AUTH_RESET_PASSWORD_TITLE = 'Set a new password'
export const AUTH_RESET_PASSWORD_INSTRUCTION = 'Enter your new password below.'
export const AUTH_RESET_PASSWORD_SUBMIT = 'Update password'
export const AUTH_RESET_PASSWORD_SUCCESS = 'Password updated. You can sign in now.'
export const AUTH_RESET_PASSWORD_INVALID_TOKEN = 'This reset link is invalid or expired.'
export const AUTH_RESET_PASSWORD_NEW_LABEL = 'New password'
export const AUTH_RESET_PASSWORD_CONFIRM_LABEL = 'Confirm password'
export const AUTH_RESET_PASSWORD_CONFIRM_PLACEHOLDER = '••••••••'
export const AUTH_RESET_PASSWORD_MISMATCH = 'Passwords do not match.'

export const AUTH_SIGN_IN_REDIRECT = '/'
export const AUTH_SIGN_UP_REDIRECT = '/'
export const AUTH_FORGOT_PASSWORD_REDIRECT = '/reset-password'
export const AUTH_RESET_PASSWORD_REDIRECT = '/sign-in'
export const AUTH_RESET_PASSWORD_SUCCESS_SEARCH = 'success'

export const AUTH_MIN_PASSWORD_LENGTH = 8
export const AUTH_MAX_PASSWORD_LENGTH = 128
export const AUTH_MIN_NAME_LENGTH = 2

export const SETTINGS_TITLE = 'Settings'
export const SETTINGS_PROFILE_TITLE = 'Profile'
export const SETTINGS_PROFILE_DESCRIPTION = 'Account details tied to your sign in.'
export const SETTINGS_PROFILE_NAME_LABEL = 'Display name'
export const SETTINGS_PROFILE_NAME_HINT = 'Set during sign up and cannot be changed for now.'
export const SETTINGS_PROFILE_EMAIL_LABEL = 'Email'
export const SETTINGS_PROFILE_MEMBER_SINCE_LABEL = 'Member since'

export const SETTINGS_SECURITY_TITLE = 'Security'
export const SETTINGS_SECURITY_DESCRIPTION = 'Change your password and manage active sessions.'
export const SETTINGS_SECURITY_CURRENT_PASSWORD_LABEL = 'Current password'
export const SETTINGS_SECURITY_NEW_PASSWORD_LABEL = 'New password'
export const SETTINGS_SECURITY_CONFIRM_PASSWORD_LABEL = 'Confirm new password'
export const SETTINGS_SECURITY_SUBMIT = 'Update password'
export const SETTINGS_SECURITY_SUCCESS = 'Password updated. Other sessions have been signed out.'
export const SETTINGS_SECURITY_MISMATCH = 'New passwords do not match.'
export const SETTINGS_SECURITY_SAME_AS_CURRENT =
	'New password must be different from the current one.'
export const SETTINGS_SECURITY_GENERIC_ERROR = 'Could not update your password. Please try again.'

export const SETTINGS_UNAUTHENTICATED_REDIRECT = '/sign-in'
export const SETTINGS_DEFAULT_SECTION_PATH = '/settings/profile'
