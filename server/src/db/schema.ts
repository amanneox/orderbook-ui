import { pgTable, text, serial, timestamp, integer, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    symbol: text('symbol').notNull(),
    side: text('side').notNull(), // 'buy' or 'sell'
    price: decimal('price').notNull(),
    amount: decimal('amount').notNull(),
    status: text('status').default('open'), // 'open', 'filled', 'cancelled'
    createdAt: timestamp('created_at').defaultNow(),
});
