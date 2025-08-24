
import * as React from "react"

// Definindo os breakpoints do sistema
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// Tipos para tamanhos de tela
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Hook para detectar se o dispositivo é mobile baseado em um breakpoint
 * @param breakpoint O breakpoint a ser usado (padrão: md - 768px)
 * @returns Boolean indicando se a tela é menor que o breakpoint especificado
 */
export function useIsMobile(breakpoint = BREAKPOINTS.md) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Função para checar o tamanho da tela e atualizar o estado
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    // Verificar tamanho inicial da tela
    checkScreenSize()
    
    // Adicionar event listener para mudanças de tamanho de tela
    window.addEventListener("resize", checkScreenSize)
    
    // Cleanup: remover event listener
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [breakpoint])

  // Retornar false como fallback em SSR
  return isMobile
}

/**
 * Hook para obter o breakpoint atual da tela
 * @returns O breakpoint atual ('xs', 'sm', 'md', 'lg', 'xl', '2xl')
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<ScreenSize>('md')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < BREAKPOINTS.xs) {
        setBreakpoint('xs')
      } else if (width < BREAKPOINTS.sm) {
        setBreakpoint('sm')
      } else if (width < BREAKPOINTS.md) {
        setBreakpoint('md')
      } else if (width < BREAKPOINTS.lg) {
        setBreakpoint('lg')
      } else if (width < BREAKPOINTS.xl) {
        setBreakpoint('xl')
      } else {
        setBreakpoint('2xl')
      }
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook para verificar se o dispositivo é um smartphone pequeno
 * @returns Boolean indicando se a tela é muito pequena (< 480px)
 */
export function useIsSmallScreen() {
  return useIsMobile(BREAKPOINTS.xs)
}

/**
 * Hook para obter o tamanho atual da tela em pixels
 * @returns Objeto com a largura e altura da tela
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });

  React.useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', updateScreenSize);
    updateScreenSize();
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}
