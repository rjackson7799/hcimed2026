import { useState, useEffect, useRef } from 'react';
import { Accessibility, Plus, Minus, Eye, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility, FontSize } from '@/context/AccessibilityContext';
import { cn } from '@/lib/utils';

const fontSizeLabels: Record<FontSize, string> = {
  normal: 'Normal',
  large: 'Large',
  xl: 'Extra Large',
};

export function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    fontSize,
    highContrast,
    reduceMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReduceMotion,
  } = useAccessibility();

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus trap within panel
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'absolute bottom-16 right-0 w-72 bg-card border border-border rounded-xl shadow-xl',
          'transform transition-all duration-200 ease-out origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        )}
        role="dialog"
        aria-label="Accessibility settings"
        aria-hidden={!isOpen}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Accessibility
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Text Size: {fontSizeLabels[fontSize]}
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize === 'normal'}
                aria-label="Decrease text size"
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-1" aria-hidden="true" />
                Smaller
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                aria-label="Increase text size"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                Larger
              </Button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="mb-4">
            <Button
              variant={highContrast ? 'default' : 'outline'}
              onClick={toggleHighContrast}
              className="w-full justify-start"
              aria-pressed={highContrast}
            >
              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              High Contrast
              <span className="ml-auto text-xs opacity-70">
                {highContrast ? 'On' : 'Off'}
              </span>
            </Button>
          </div>

          {/* Reduce Motion */}
          <div>
            <Button
              variant={reduceMotion ? 'default' : 'outline'}
              onClick={toggleReduceMotion}
              className="w-full justify-start"
              aria-pressed={reduceMotion}
            >
              <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
              Reduce Motion
              <span className="ml-auto text-xs opacity-70">
                {reduceMotion ? 'On' : 'Off'}
              </span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Your preferences are saved automatically.
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'transition-transform duration-200',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label={isOpen ? 'Close accessibility settings' : 'Open accessibility settings'}
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </Button>
    </div>
  );
}
