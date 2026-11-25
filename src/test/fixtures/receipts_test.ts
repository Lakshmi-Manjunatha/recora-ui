
import type { Receipt } from '../../types/receipt'

export const testReceipts: Receipt[] = [
    {
        id: 'receipt-001',
        merchant: 'Tesco',
        purchaseDate: '2026-11-24',
        category: 'Groceries',
        totalAmount: 3890,
        currency: 'GBP',
        items: [
            {
                id: 'item-001',
                name: 'Milk',
                quantity: 2,
                totalAmount: 320,
            },
            {
                id: 'item-002',
                name: 'Bread',
                quantity: 1,
                totalAmount: 170,
            },
            {
                id: 'item-003',
                name: 'Fruit and vegetables',
                quantity: 1,
                totalAmount: 1400,
            },
            {
                id: 'item-004',
                name: 'Other groceries',
                quantity: 1,
                totalAmount: 2000,
            },
        ],
    },
    {
        id: 'receipt-002',
        merchant: 'Sainsbury’s',
        purchaseDate: '2026-11-22',
        category: 'Groceries',
        totalAmount: 2790,
        currency: 'GBP',
        items: [
            {
                id: 'item-005',
                name: 'Groceries',
                quantity: 1,
                totalAmount: 2790,
            },
        ],
    },
    {
        id: 'receipt-003',
        merchant: 'Boots',
        purchaseDate: '2026-11-20',
        category: 'Personal care',
        totalAmount: 1960,
        currency: 'GBP',
        items: [
            {
                id: 'item-006',
                name: 'Shampoo',
                quantity: 2,
                totalAmount: 1960,
            },
        ],
    },
]
