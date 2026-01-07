import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
}

export const Button = ({ title, variant = 'primary', className, ...props }: ButtonProps) => {
    const baseStyle = "p-4 rounded-xl items-center justify-center active:opacity-80";

    // Define styles for different variants
    const variants = {
        primary: "bg-blue-600",
        secondary: "bg-gray-200",
    };

    const textStyles = {
        primary: "text-white font-semibold text-lg",
        secondary: "text-gray-900 font-semibold text-lg",
    };

    return (
        <TouchableOpacity
            className={`${baseStyle} ${variants[variant]} ${className || ''}`}
            {...props}
        >
            <Text className={textStyles[variant]}>{title}</Text>
        </TouchableOpacity>
    );
};