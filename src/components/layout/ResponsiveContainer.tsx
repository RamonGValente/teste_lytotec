
import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * Container responsivo que adapta seu conteúdo para diferentes tamanhos de tela
 */
export const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ children, as: Component = "div", className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "w-full px-4 sm:px-6 md:px-8 max-w-full mx-auto",
          "sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveContainer.displayName = "ResponsiveContainer";

/**
 * Grid responsivo que adapta o número de colunas com base no tamanho da tela
 */
export const ResponsiveGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gap?: "none" | "sm" | "md" | "lg";
    cols?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
    };
  }
>(({ children, className, gap = "md", cols = {}, ...props }, ref) => {
  // Configurar classes para diferentes gaps
  const gapClasses = {
    none: "",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  // Configurar classes para diferentes números de colunas em cada breakpoint
  const colClasses = {
    xs: cols.xs ? `grid-cols-${cols.xs}` : "",
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    md: cols.md ? `md:grid-cols-${cols.md}` : "",
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : "",
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : "",
    "2xl": cols["2xl"] ? `2xl:grid-cols-${cols["2xl"]}` : "",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1", 
        gapClasses[gap],
        colClasses.xs,
        colClasses.sm,
        colClasses.md,
        colClasses.lg,
        colClasses.xl,
        colClasses["2xl"],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = "ResponsiveGrid";

/**
 * Componente de cartão responsivo para visualizações mobile
 */
export const ResponsiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
  }
>(({ children, className, title, subtitle, icon, actions, footer, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || subtitle || icon || actions) && (
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="font-medium text-base">{title}</h3>}
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      
      <div className="p-4">{children}</div>
      
      {footer && (
        <div className="p-4 border-t bg-muted/20">{footer}</div>
      )}
    </div>
  );
});

ResponsiveCard.displayName = "ResponsiveCard";
