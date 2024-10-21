import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'


const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
  }
}>()

app.post('/api/v1/user/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const { email, password } = await c.req.json();

  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (!user || user.password !== password) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  if (user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: {
        user_id: user.user_id
      }
    });
    
    return c.json({
      message: 'Login successful',
      user: {
        ...user,
        student // Include student information
      }
    });
  }

  return c.json({ message: 'Login successful', user });
});


export default app
