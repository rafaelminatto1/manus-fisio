import '@testing-library/jest-dom'

// Mock do Next.js Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock do Next.js Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock completo do auth.ts
jest.mock('@/lib/auth', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      onAuthStateChange: jest.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  mockUser: {
    id: 'mock-user-123',
    email: 'admin@clinica.com',
    full_name: 'Dr. Rafael Santos',
    role: 'admin',
  },
  isMockMode: jest.fn(() => true),
  hasSupabaseCredentials: jest.fn(() => false),
  isAdmin: jest.fn(() => true),
  isMentor: jest.fn(() => true),
  isIntern: jest.fn(() => false),
  canManageUsers: jest.fn(() => true),
  canManageNotebooks: jest.fn(() => true),
  canManageProjects: jest.fn(() => true),
  canSuperviseInterns: jest.fn(() => true),
}))

// Mock das Web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock do Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}))

// Mock do Sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Configuração de timeout para testes
jest.setTimeout(10000) 