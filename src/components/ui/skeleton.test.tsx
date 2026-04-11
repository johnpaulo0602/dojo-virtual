import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a div with correct base classes', () => {
    const { container } = render(<Skeleton />);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveClass('animate-pulse');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('bg-muted');
  });

  it('merges custom classes', () => {
    const { container } = render(<Skeleton className="custom-class h-10 w-10" />);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toHaveClass('animate-pulse');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('h-10');
    expect(element).toHaveClass('w-10');
  });

  it('passes additional props to the div element', () => {
    const { container } = render(<Skeleton data-testid="skeleton" aria-hidden="true" />);
    const element = container.firstChild as HTMLElement;
    
    expect(element).toHaveAttribute('data-testid', 'skeleton');
    expect(element).toHaveAttribute('aria-hidden', 'true');
  });
});
