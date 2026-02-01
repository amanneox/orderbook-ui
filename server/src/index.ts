import { db } from './db';
import { users, orders } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// @ts-ignore
const server = Bun.serve({
    port: 3000,
    async fetch(req: Request) {
        const url = new URL(req.url);
        const path = url.pathname;
        const method = req.method;

        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        // Helper to add CORS to responses
        const json = (data: any, status = 200) =>
            new Response(JSON.stringify(data), {
                status,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });

        const error = (msg: string, status = 400) => json({ error: msg }, status);

        try {
            // Auth Routes
            if (path === '/auth/register' && method === 'POST') {
                const body: any = await req.json();
                const { username, password } = body;

                if (!username || !password) return error('Username and password required');

                const existingUser = await db.select().from(users).where(eq(users.username, username));
                if (existingUser.length > 0) return error('User already exists');

                const passwordHash = await hash(password, 10);
                const [newUser] = await db.insert(users).values({ username, passwordHash }).returning();

                const token = sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1d' });
                return json({ token, user: { id: newUser.id, username: newUser.username } });
            }

            if (path === '/auth/login' && method === 'POST') {
                const body: any = await req.json();
                const { username, password } = body;

                const [user] = await db.select().from(users).where(eq(users.username, username));
                if (!user) return error('Invalid credentials', 401);

                const valid = await compare(password, user.passwordHash);
                if (!valid) return error('Invalid credentials', 401);

                const token = sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
                return json({ token, user: { id: user.id, username: user.username } });
            }

            // Protected API Routes logic
            if (path.startsWith('/api/')) {
                const authHeader = req.headers.get('Authorization');
                if (!authHeader) return error('Unauthorized', 401);

                const token = authHeader.split(' ')[1];
                let payload: any;
                try {
                    payload = verify(token, JWT_SECRET);
                } catch (e) {
                    return error('Invalid token', 401);
                }

                if (path === '/api/orders') {
                    if (method === 'GET') {
                        const userOrders = await db.select().from(orders).where(eq(orders.userId, payload.id)).orderBy(desc(orders.createdAt));
                        return json(userOrders);
                    }

                    if (method === 'POST') {
                        const body: any = await req.json();
                        const { symbol, side, price, amount } = body;
                        const [newOrder] = await db.insert(orders).values({
                            userId: payload.id,
                            symbol,
                            side,
                            price: String(price),
                            amount: String(amount),
                            status: 'open'
                        }).returning();
                        return json(newOrder);
                    }
                }
            }

            if (path === '/') return new Response('HFT Trading Server (Bun Native) is Running!', { headers: CORS_HEADERS });

            return error('Not Found', 404);

        } catch (e) {
            console.error(e);
            return error('Internal Server Error', 500);
        }
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);
