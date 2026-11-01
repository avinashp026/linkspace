/*
Validates a linkspace username

Rules: 
- Required
- 3 to 30 characters
- Lowercase letters and numbers are allowed (no uppercase)
- No spaces, underscores or special characters
*/

export const validateUsername = (username: string): string | null => {
    const value = username.trim();

    if(!value) {
        return "Username is required.";
    }

    if(value.length < 3 || value.length > 30) {
        return "Username must be between 3 and 30 characters.";
    }

    if(!/^[a-z0-9]+$/.test(value)){
        return "username can only contain lowercase letters and numbers."
    }

    return null
}