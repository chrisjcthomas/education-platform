import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from '@/components/editor/language-switcher'

// Mock the language switching service
jest.mock('@/lib/services/language-switching-service', () => ({
  languageSwitchingService: {
    convertCode: jest.fn(),
    getCodeTemplate: jest.fn()
  }
}))

describe.skip('LanguageSwitcher', () => {
  const defaultProps = {
    currentLanguage: 'javascript' as const,
    currentCode: 'console.log("Hello World");',
    onLanguageChange: jest.fn(),
    theme: 'light' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders language toggle buttons', () => {
    render(<LanguageSwitcher {...defaultProps} />)
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  test('highlights current language', () => {
    render(<LanguageSwitcher {...defaultProps} />)
    
    const jsButton = screen.getByText('JavaScript')
    const pythonButton = screen.getByText('Python')
    
    expect(jsButton).toHaveClass('bg-white', 'text-blue-700')
    expect(pythonButton).not.toHaveClass('bg-white', 'text-blue-700')
  })

  test('highlights Python when current language is Python', () => {
    render(<LanguageSwitcher {...defaultProps} currentLanguage="python" />)
    
    const jsButton = screen.getByText('JavaScript')
    const pythonButton = screen.getByText('Python')
    
    expect(pythonButton).toHaveClass('bg-white', 'text-blue-700')
    expect(jsButton).not.toHaveClass('bg-white', 'text-blue-700')
  })

  test('switches language and converts code', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.convertCode.mockReturnValue({
      convertedCode: 'print("Hello World")',
      suggestions: ['Converted to Python'],
      warnings: []
    })

    const onLanguageChange = jest.fn()
    render(<LanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />)
    
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      expect(languageSwitchingService.convertCode).toHaveBeenCalledWith(
        'console.log("Hello World");',
        'javascript',
        'python'
      )
      expect(onLanguageChange).toHaveBeenCalledWith('python', 'print("Hello World")')
    })
  })

  test('shows conversion warnings', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.convertCode.mockReturnValue({
      convertedCode: 'print("Hello World")',
      suggestions: ['Converted to Python'],
      warnings: ['Some Math operations may need adjustment']
    })

    render(<LanguageSwitcher {...defaultProps} />)
    
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      expect(screen.getByText('Conversion Notes')).toBeInTheDocument()
      expect(screen.getByText('Some Math operations may need adjustment')).toBeInTheDocument()
    })
  })

  test('dismisses conversion warnings', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.convertCode.mockReturnValue({
      convertedCode: 'print("Hello World")',
      suggestions: ['Converted to Python'],
      warnings: ['Some warning']
    })

    render(<LanguageSwitcher {...defaultProps} />)
    
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      expect(screen.getByText('Conversion Notes')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: '' }) // Close button with X icon
    await userEvent.click(closeButton)
    
    expect(screen.queryByText('Conversion Notes')).not.toBeInTheDocument()
  })

  test('shows loading state during conversion', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.convertCode.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({
          convertedCode: 'print("Hello World")',
          suggestions: [],
          warnings: []
        }), 100)
      })
    })

    render(<LanguageSwitcher {...defaultProps} />)
    
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    expect(screen.getByText('Converting...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Converting...')).not.toBeInTheDocument()
    })
  })

  test('uses code template', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.getCodeTemplate.mockReturnValue('function binarySearch() {}')

    const onLanguageChange = jest.fn()
    render(<LanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />)
    
    const templateButton = screen.getByText('Use JavaScript Template')
    await userEvent.click(templateButton)
    
    expect(languageSwitchingService.getCodeTemplate).toHaveBeenCalledWith('javascript', 'binary-search')
    expect(onLanguageChange).toHaveBeenCalledWith('javascript', 'function binarySearch() {}')
  })

  test('shows Python template button when Python is selected', () => {
    render(<LanguageSwitcher {...defaultProps} currentLanguage="python" />)
    
    expect(screen.getByText('Use Python Template')).toBeInTheDocument()
  })

  test('disables buttons when disabled prop is true', () => {
    render(<LanguageSwitcher {...defaultProps} disabled={true} />)
    
    const jsButton = screen.getByText('JavaScript')
    const pythonButton = screen.getByText('Python')
    const templateButton = screen.getByText('Use JavaScript Template')
    
    expect(jsButton).toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(pythonButton).toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(templateButton).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  test('does not switch language when clicking current language', async () => {
    const onLanguageChange = jest.fn()
    render(<LanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />)
    
    const jsButton = screen.getByText('JavaScript')
    await userEvent.click(jsButton)
    
    expect(onLanguageChange).not.toHaveBeenCalled()
  })

  test('applies dark theme styles', () => {
    render(<LanguageSwitcher {...defaultProps} theme="dark" />)
    
    const container = screen.getByText('JavaScript').closest('div')
    expect(container).toHaveClass('bg-gray-800', 'border-gray-700')
  })

  test('handles conversion errors gracefully', async () => {
    const { languageSwitchingService } = require('@/lib/services/language-switching-service')
    languageSwitchingService.convertCode.mockImplementation(() => {
      throw new Error('Conversion failed')
    })

    const onLanguageChange = jest.fn()
    render(<LanguageSwitcher {...defaultProps} onLanguageChange={onLanguageChange} />)
    
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)
    
    await waitFor(() => {
      // Should still call onLanguageChange with original code
      expect(onLanguageChange).toHaveBeenCalledWith('python', 'console.log("Hello World");')
    })
  })
})