import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../use-auth'

// Mock do Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
  })

  it('initializes with loading state', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })

  it('sets user when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      // Aguarda a resolução da promise
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
  })

  it('handles authentication error', async () => {
    const mockError = new Error('Authentication failed')

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: mockError,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBe(null)
  })

  it('handles sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('handles sign out error', async () => {
    const mockError = new Error('Sign out failed')
    mockSupabase.auth.signOut.mockResolvedValue({ error: mockError })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('listens to auth state changes', () => {
    const mockCallback = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    renderHook(() => useAuth())

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
}) 