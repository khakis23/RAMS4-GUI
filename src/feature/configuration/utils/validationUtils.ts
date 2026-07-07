import { FieldErrors } from 'react-hook-form';
import { ZodError } from 'zod';

export const compileZodErrors = (error: ZodError): string[] => {
    return error.issues.map((issue) => {
        const cleanPath = formatErrorPath(issue.path.map(String));
        return `${cleanPath}: ${issue.message}`;
    });
};

/**
 * Recursively walks the React Hook Form errors object and returns an array of human-readable error messages.
 * Maps field path names to cleaner user-facing paths (e.g. handlersProfile.0.filename -> Profile #1 > Name).
 */
export const compileFormErrors = (errors: FieldErrors<any>): string[] => {
    const messages: string[] = [];

    const walk = (obj: any, path: string[]) => {
        if (!obj || typeof obj !== 'object') return;

        // If it's a FieldError (has message property and is a leaf node)
        if (obj.message && typeof obj.message === 'string') {
            const cleanPath = formatErrorPath(path);
            messages.push(`${cleanPath}: ${obj.message}`);
            return;
        }

        // Recursively traverse keys/indexes
        if (Array.isArray(obj)) {
            obj.forEach((val, idx) => {
                walk(val, [...path, String(idx)]);
            });
        } else {
            Object.keys(obj).forEach((key) => {
                walk(obj[key], [...path, key]);
            });
        }
    };

    walk(errors, []);
    return messages;
};

/**
 * Formats a raw Hook Form field path array into a user-friendly path name.
 * e.g., ['handlersProfile', '0', 'filename'] -> "Profile #1 > Name"
 */
const formatErrorPath = (path: string[]): string => {
    const parts: string[] = [];

    for (let i = 0; i < path.length; i++) {
        const part = path[i];

        if ((part === 'handlersProfile' || part === 'xrayProfiles') && i + 1 < path.length) {
            const index = Number(path[i + 1]);
            if (!isNaN(index)) {
                parts.push(`Profile #${index + 1}`);
                i++; // skip index part
                continue;
            }
        }
        
        if (part === 'daqFrequency') {
            parts.push('Sampling Frequency');
            continue;
        }
        
        if (part === 'samplePoints') {
            parts.push('Sample Points');
            continue;
        }

        if (part === 'filename') {
            parts.push('Name');
            continue;
        }

        if (part === 'signalAxis') {
            parts.push('Signal Axis');
            continue;
        }

        if (part === 'signalItem') {
            parts.push('Signal Item');
            continue;
        }

        if (part === 'signalProminence') {
            parts.push('Prominence');
            continue;
        }

        if (part === 'psoAxis') {
            parts.push('PSO Axis');
            continue;
        }

        if (part === 'frequency') {
            parts.push('Frequency');
            continue;
        }

        // Capitalize default fallback
        parts.push(part.charAt(0).toUpperCase() + part.slice(1));
    }

    return parts.join(' > ');
};
