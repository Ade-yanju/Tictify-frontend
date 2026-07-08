import React from "react";
import "./Button.css";

/**
 * Button Component
 *
 * Usage:
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      ...props
    },
    ref
  ) => {
    const buttonClass = [
      "btn",
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth && "btn--full-width",
      disabled && "btn--disabled",
      loading && "btn--loading",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="btn__spinner" />}
        {Icon && iconPosition === "left" && <Icon className="btn__icon" />}
        <span className="btn__text">{children}</span>
        {Icon && iconPosition === "right" && <Icon className="btn__icon" />}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
