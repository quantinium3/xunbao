import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  background?: string;
  fontSize?: string;
  color?: string;
  borderRadius?: string;
  boxShadowColor?: string;
  className?: string;
}

const XButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        bg-black
        text-2xl
        text-white
        inline-block
        transition-all
        duration-200
        relative
        top-0
        cursor-pointer
        mx-5
        border
        border-white
        active:top-[3px]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default XButton;
