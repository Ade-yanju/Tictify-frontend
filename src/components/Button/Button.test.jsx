import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button Component", () => {
  it("renders button with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when disabled prop is true", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    );

    const button = screen.getByText("Click");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies correct variant classes", () => {
    const { container } = render(
      <Button variant="success" size="lg">
        Success
      </Button>
    );

    const button = screen.getByText("Success");
    expect(button).toHaveClass("btn--success");
    expect(button).toHaveClass("btn--lg");
  });

  it("renders full width when fullWidth prop is true", () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByText("Full Width");
    expect(button).toHaveClass("btn--full-width");
  });

  it("shows spinner when loading", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector(".btn__spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );

    const button = screen.getByText("Loading").closest("button");
    expect(button).toBeDisabled();
  });

  it("supports different sizes", () => {
    const { container } = render(
      <>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </>
    );

    expect(screen.getByText("Small")).toHaveClass("btn--sm");
    expect(screen.getByText("Medium")).toHaveClass("btn--md");
    expect(screen.getByText("Large")).toHaveClass("btn--lg");
  });

  it("supports different variants", () => {
    const variants = ["primary", "secondary", "success", "warning", "danger", "ghost"];

    const { container } = render(
      <>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </>
    );

    variants.forEach((variant) => {
      expect(screen.getByText(variant)).toHaveClass(`btn--${variant}`);
    });
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef();
    render(<Button ref={ref}>Ref Test</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent("Ref Test");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByText("Custom")).toHaveClass("custom-class");
  });

  it("passes through HTML attributes", () => {
    render(
      <Button data-testid="custom-button" title="Test Button">
        Button
      </Button>
    );

    const button = screen.getByTestId("custom-button");
    expect(button).toHaveAttribute("title", "Test Button");
  });

  it("has accessible focus state", () => {
    render(<Button>Focus Test</Button>);
    const button = screen.getByText("Focus Test");

    button.focus();
    expect(button).toHaveFocus();
  });

  it("supports icon rendering with icon position", () => {
    const Icon = () => <span data-testid="icon">📱</span>;

    const { rerender } = render(
      <Button icon={Icon} iconPosition="left">
        Text
      </Button>
    );

    let icon = screen.getByTestId("icon");
    expect(icon.parentElement).toHaveClass("btn__text");

    rerender(
      <Button icon={Icon} iconPosition="right">
        Text
      </Button>
    );

    icon = screen.getByTestId("icon");
    expect(icon.nextElementSibling).toBeFalsy();
  });
});
