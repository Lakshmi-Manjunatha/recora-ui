
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
    it('should display the homepage introduction', () => {
        render(<HomePage />)

        expect(
            screen.getByRole('heading', {
                name: 'Your receipts, organised in one place.',
            }),
        ).toBeInTheDocument()
    })

    it('should display the homepage description', () => {
        render(<HomePage />)

        expect(
            screen.getByText(/Keep track of purchases/i),
        ).toBeInTheDocument()
    })
})
