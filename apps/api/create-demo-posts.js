const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDemoPosts() {
  try {
    // Find the creator and space
    const creator = await prisma.user.findUnique({
      where: { email: 'creator@example.com' }
    });
    
    if (!creator) {
      console.log('Creator not found');
      return;
    }

    const space = await prisma.space.findFirst({
      where: { ownerId: creator.id }
    });

    if (!space) {
      console.log('Space not found');
      return;
    }

    console.log(`Creating demo posts for space: ${space.name}`);

    // Post 1: Interactive React Guide
    const post1 = await prisma.post.create({
      data: {
        title: "🚀 Interactive React Hooks Guide",
        content_html: `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; margin: 20px 0; text-align: center;">
  <h1 style="margin: 0; font-size: 2.5em;">🚀 Master React Hooks</h1>
  <p style="margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9;">From beginner to pro in 30 minutes</p>
</div>

<p style="font-size: 18px; color: #4B5563; line-height: 1.8;">Welcome to the most <strong style="color: #DC2626;">comprehensive React Hooks tutorial</strong> you'll ever need! 🎯</p>

<div style="background: #F0FDF4; border-left: 5px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
  <h3 style="color: #15803D; margin-top: 0;">🎯 What You'll Learn</h3>
  <ul style="color: #166534; line-height: 1.8;">
    <li><strong>useState</strong> - State management made simple</li>
    <li><strong>useEffect</strong> - Master side effects and lifecycle</li>
    <li><strong>Custom Hooks</strong> - Build reusable superpowers</li>
    <li><strong>Performance</strong> - Optimize like a senior developer</li>
  </ul>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #3B82F6; padding-bottom: 10px;">💡 useState: Your First Superpower</h2>

<p>The <code style="background: #FEE2E2; padding: 4px 8px; border-radius: 4px; color: #DC2626; font-weight: bold;">useState</code> hook transforms your components from static to dynamic:</p>

<pre style="background: #1F2937; color: #F9FAFB; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10B981; overflow-x: auto;"><code>import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    &lt;div style={{textAlign: 'center', padding: '20px'}}>
      &lt;h2>Counter: {count}&lt;/h2>
      &lt;button 
        onClick={() => setCount(count + 1)}
        style={{
          background: '#3B82F6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Click me! 🎉
      &lt;/button>
    &lt;/div>
  );
}</code></pre>

<div style="background: #FEF3C7; border: 2px dashed #F59E0B; padding: 20px; border-radius: 10px; margin: 25px 0;">
  <h3 style="color: #92400E; margin-top: 0;">💡 Pro Tip</h3>
  <p style="color: #78350F; margin-bottom: 0;">Always use functional updates when new state depends on previous state: <code style="background: #FDE68A; padding: 2px 6px; border-radius: 3px;">setCount(prev => prev + 1)</code></p>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #8B5CF6; padding-bottom: 10px;">⚡ useEffect: Side Effects Master</h2>

<p>Handle API calls, subscriptions, and DOM manipulation like a pro:</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
  <thead>
    <tr style="background: #374151; color: white;">
      <th style="padding: 15px; text-align: left;">Pattern</th>
      <th style="padding: 15px; text-align: left;">Code</th>
      <th style="padding: 15px; text-align: left;">Use Case</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #F9FAFB;">
      <td style="padding: 15px; font-weight: bold;">Mount Once</td>
      <td style="padding: 15px;"><code>useEffect(() => {}, [])</code></td>
      <td style="padding: 15px;">API calls, setup</td>
    </tr>
    <tr style="background: white;">
      <td style="padding: 15px; font-weight: bold;">Watch Value</td>
      <td style="padding: 15px;"><code>useEffect(() => {}, [value])</code></td>
      <td style="padding: 15px;">React to changes</td>
    </tr>
    <tr style="background: #F9FAFB;">
      <td style="padding: 15px; font-weight: bold;">Cleanup</td>
      <td style="padding: 15px;"><code>return () => cleanup()</code></td>
      <td style="padding: 15px;">Prevent memory leaks</td>
    </tr>
  </tbody>
</table>

<div style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); padding: 30px; border-radius: 15px; color: white; margin: 30px 0; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
  <h2 style="margin: 0 0 15px 0; font-size: 2em;">🏆 Master Challenge</h2>
  <p style="margin: 0 0 20px 0; font-size: 18px; opacity: 0.95;">Build a custom <strong>useLocalStorage</strong> hook that persists state across browser sessions!</p>
  <button style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">Accept Challenge 🚀</button>
</div>

<div style="background: #ECFDF5; border: 2px solid #10B981; padding: 25px; border-radius: 12px; margin: 30px 0;">
  <h3 style="color: #047857; margin-top: 0;">🎉 You're Now a React Hooks Master!</h3>
  <p style="color: #065F46; margin-bottom: 20px;">Ready to build amazing, performant React applications with confidence!</p>
  <div style="display: flex; gap: 15px; flex-wrap: wrap;">
    <button style="background: #10B981; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Download Examples 📁</button>
    <button style="background: transparent; border: 2px solid #10B981; color: #10B981; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Share Tutorial 📤</button>
  </div>
</div>
        `,
        is_premium: false,
        published_at: new Date(),
        spaceId: space.id,
        authorId: creator.id
      }
    });

    // Post 2: Premium JavaScript Tricks (Premium)
    const post2 = await prisma.post.create({
      data: {
        title: "🔥 Advanced JavaScript Secrets (Premium)",
        content_html: `
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white; margin: 20px 0; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 10px; right: 10px; background: #FFD700; color: #1F2937; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 12px;">PREMIUM 👑</div>
  <h1 style="margin: 0; font-size: 2.5em;">🔥 JavaScript Ninja Techniques</h1>
  <p style="margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9;">Advanced patterns that will blow your mind</p>
</div>

<div style="background: #FEF2F2; border-left: 5px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
  <h3 style="color: #B91C1C; margin-top: 0;">🚨 Warning: Advanced Content</h3>
  <p style="color: #7F1D1D; margin-bottom: 0;">These techniques are used by <strong>senior developers</strong> and can significantly impact your coding skills and salary! 💰</p>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #EF4444; padding-bottom: 10px;">🎯 Destructuring Magic</h2>

<p>Master destructuring patterns that make your code <strong style="color: #DC2626;">10x more elegant</strong>:</p>

<pre style="background: #1F2937; color: #F9FAFB; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;"><code>// 🔥 Advanced destructuring patterns
const user = { name: 'John', age: 30, address: { city: 'NYC', zip: '10001' } };

// Nested destructuring with renaming
const { name: userName, address: { city: userCity } } = user;

// Array destructuring with rest
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Function parameters destructuring
function updateUser({ id, ...updates }) {
  return { id, ...currentUser, ...updates };
}

// Default values in destructuring
const { theme = 'dark', lang = 'en' } = settings;</code></pre>

<h2 style="color: #1F2937; border-bottom: 3px solid #8B5CF6; padding-bottom: 10px;">⚡ Async/Await Mastery</h2>

<div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3 style="color: #374151; margin-top: 0;">🚀 Parallel vs Sequential Execution</h3>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
    <div style="background: #FEE2E2; padding: 15px; border-radius: 8px;">
      <h4 style="color: #DC2626; margin-top: 0;">❌ Sequential (Slow)</h4>
      <pre style="background: #1F2937; color: #F9FAFB; padding: 10px; border-radius: 5px; font-size: 12px;"><code>const user = await getUser();
const posts = await getPosts();
const comments = await getComments();</code></pre>
    </div>
    
    <div style="background: #D1FAE5; padding: 15px; border-radius: 8px;">
      <h4 style="color: #059669; margin-top: 0;">✅ Parallel (Fast)</h4>
      <pre style="background: #1F2937; color: #F9FAFB; padding: 10px; border-radius: 5px; font-size: 12px;"><code>const [user, posts, comments] = 
  await Promise.all([
    getUser(),
    getPosts(), 
    getComments()
  ]);</code></pre>
    </div>
  </div>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #10B981; padding-bottom: 10px;">🧠 Memory & Performance Optimization</h2>

<div style="background: #FFFBEB; border: 2px solid #F59E0B; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3 style="color: #92400E; margin-top: 0;">🎯 WeakMap & WeakSet for Memory Management</h3>
  <pre style="background: #1F2937; color: #F9FAFB; padding: 15px; border-radius: 8px;"><code>// Private properties using WeakMap
const privateData = new WeakMap();

class User {
  constructor(name, secret) {
    this.name = name;
    privateData.set(this, { secret });
  }
  
  getSecret() {
    return privateData.get(this).secret;
  }
}

// Automatic garbage collection when object is removed!</code></pre>
</div>

<div style="background: linear-gradient(45deg, #667eea, #764ba2); padding: 30px; border-radius: 15px; color: white; margin: 30px 0; text-align: center;">
  <h2 style="margin: 0 0 15px 0;">🎓 Exclusive Bonus Content</h2>
  <p style="margin: 0 0 20px 0; font-size: 18px;">Premium members get access to:</p>
  <ul style="list-style: none; padding: 0; text-align: left; max-width: 400px; margin: 0 auto;">
    <li style="margin: 10px 0;">🎥 Video explanations for each technique</li>
    <li style="margin: 10px 0;">📁 Complete code repository</li>
    <li style="margin: 10px 0;">💬 Direct Q&A with the instructor</li>
    <li style="margin: 10px 0;">🏆 Certificate of completion</li>
  </ul>
</div>

<div style="background: #F0FDF4; border: 2px solid #10B981; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
  <h3 style="color: #047857; margin-top: 0;">🚀 Level Up Your Career</h3>
  <p style="color: #065F46; margin-bottom: 20px;">These techniques are what separate junior from senior developers. Master them and <strong>increase your market value instantly!</strong></p>
  <button style="background: #10B981; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">Download Full Course 🎯</button>
</div>
        `,
        is_premium: true,
        published_at: new Date(),
        spaceId: space.id,
        authorId: creator.id
      }
    });

    // Post 3: Interactive CSS Flexbox Game
    const post3 = await prisma.post.create({
      data: {
        title: "🎮 CSS Flexbox: Interactive Learning Game",
        content_html: `
<div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); padding: 25px; border-radius: 15px; color: white; margin: 20px 0; text-align: center;">
  <h1 style="margin: 0; font-size: 2.5em;">🎮 Flexbox Master Game</h1>
  <p style="margin: 10px 0 0 0; font-size: 1.2em; opacity: 0.9;">Learn CSS Flexbox through interactive challenges!</p>
</div>

<div style="background: #EFF6FF; border-left: 5px solid #3B82F6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
  <h3 style="color: #1D4ED8; margin-top: 0;">🎯 Game Rules</h3>
  <ol style="color: #1E40AF; line-height: 1.8;">
    <li>Each level teaches a new Flexbox property</li>
    <li>Visual examples show immediate results</li>
    <li>Progressive difficulty from beginner to expert</li>
    <li>Real-world layout challenges</li>
  </ol>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #FF6B6B; padding-bottom: 10px;">🚀 Level 1: Flex Direction</h2>

<div style="background: #F8FAFC; border: 2px solid #E2E8F0; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3 style="color: #475569; margin-top: 0;">🎯 Challenge: Arrange the boxes</h3>
  
  <div style="display: flex; gap: 20px; margin: 20px 0;">
    <div style="flex: 1;">
      <h4 style="color: #374151;">flex-direction: row</h4>
      <div style="display: flex; flex-direction: row; gap: 10px; background: white; padding: 15px; border-radius: 8px; border: 2px solid #D1D5DB;">
        <div style="width: 50px; height: 50px; background: #FF6B6B; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
        <div style="width: 50px; height: 50px; background: #4ECDC4; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
        <div style="width: 50px; height: 50px; background: #45B7D1; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
      </div>
    </div>
    
    <div style="flex: 1;">
      <h4 style="color: #374151;">flex-direction: column</h4>
      <div style="display: flex; flex-direction: column; gap: 10px; background: white; padding: 15px; border-radius: 8px; border: 2px solid #D1D5DB;">
        <div style="width: 50px; height: 50px; background: #FF6B6B; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">1</div>
        <div style="width: 50px; height: 50px; background: #4ECDC4; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">2</div>
        <div style="width: 50px; height: 50px; background: #45B7D1; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">3</div>
      </div>
    </div>
  </div>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #4ECDC4; padding-bottom: 10px;">⚡ Level 2: Justify Content</h2>

<div style="background: #F0FDF4; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3 style="color: #065F46; margin-top: 0;">🎯 Master horizontal alignment</h3>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0;">
    <div>
      <h4 style="color: #374151; font-size: 14px;">justify-content: flex-start</h4>
      <div style="display: flex; justify-content: flex-start; gap: 5px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #D1D5DB; height: 60px;">
        <div style="width: 30px; height: 30px; background: #10B981; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #10B981; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #10B981; border-radius: 3px;"></div>
      </div>
    </div>
    
    <div>
      <h4 style="color: #374151; font-size: 14px;">justify-content: center</h4>
      <div style="display: flex; justify-content: center; gap: 5px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #D1D5DB; height: 60px;">
        <div style="width: 30px; height: 30px; background: #3B82F6; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #3B82F6; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #3B82F6; border-radius: 3px;"></div>
      </div>
    </div>
    
    <div>
      <h4 style="color: #374151; font-size: 14px;">justify-content: space-between</h4>
      <div style="display: flex; justify-content: space-between; background: white; padding: 10px; border-radius: 5px; border: 1px solid #D1D5DB; height: 60px;">
        <div style="width: 30px; height: 30px; background: #8B5CF6; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #8B5CF6; border-radius: 3px;"></div>
        <div style="width: 30px; height: 30px; background: #8B5CF6; border-radius: 3px;"></div>
      </div>
    </div>
  </div>
</div>

<div style="background: #FFFBEB; border: 2px dashed #F59E0B; padding: 20px; border-radius: 10px; margin: 25px 0;">
  <h3 style="color: #92400E; margin-top: 0;">🧠 Pro Memory Trick</h3>
  <p style="color: #78350F;">Think of <code style="background: #FEF3C7; padding: 2px 6px; border-radius: 3px;">justify-content</code> as controlling the <strong>main axis</strong> (horizontal in row, vertical in column).</p>
  <p style="color: #78350F; margin-bottom: 0;">And <code style="background: #FEF3C7; padding: 2px 6px; border-radius: 3px;">align-items</code> controls the <strong>cross axis</strong> (perpendicular to main).</p>
</div>

<h2 style="color: #1F2937; border-bottom: 3px solid #8B5CF6; padding-bottom: 10px;">🏗️ Real-World Layout Challenge</h2>

<div style="background: #F8FAFC; border: 2px solid #E2E8F0; padding: 20px; border-radius: 10px; margin: 20px 0;">
  <h3 style="color: #475569; margin-top: 0;">🎯 Build a Navigation Bar</h3>
  
  <div style="background: white; border: 2px solid #D1D5DB; border-radius: 8px; padding: 15px; margin: 15px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; background: #1F2937; padding: 15px 20px; border-radius: 6px; color: white;">
      <div style="font-weight: bold; font-size: 18px;">🚀 MyApp</div>
      <div style="display: flex; gap: 20px; align-items: center;">
        <span style="cursor: pointer; padding: 5px 10px; border-radius: 4px;">Home</span>
        <span style="cursor: pointer; padding: 5px 10px; border-radius: 4px;">About</span>
        <span style="cursor: pointer; padding: 5px 10px; border-radius: 4px;">Contact</span>
        <button style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Login</button>
      </div>
    </div>
  </div>
  
  <pre style="background: #1F2937; color: #F9FAFB; padding: 15px; border-radius: 8px; margin-top: 15px;"><code>.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #1F2937;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}</code></pre>
</div>

<div style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4); padding: 30px; border-radius: 15px; color: white; margin: 30px 0; text-align: center;">
  <h2 style="margin: 0 0 15px 0;">🏆 Congratulations!</h2>
  <p style="margin: 0 0 20px 0; font-size: 18px;">You've mastered the basics! Ready for <strong>advanced Flexbox challenges</strong>?</p>
  <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
    <button style="background: rgba(255,255,255,0.9); color: #333; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Next Level 🎮</button>
    <button style="background: transparent; border: 2px solid white; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Practice Mode 🎯</button>
  </div>
</div>
        `,
        is_premium: false,
        published_at: new Date(),
        spaceId: space.id,
        authorId: creator.id
      }
    });

    console.log('✅ Successfully created demo posts:');
    console.log(`1. ${post1.title}`);
    console.log(`2. ${post2.title}`);
    console.log(`3. ${post3.title}`);

  } catch (error) {
    console.error('Error creating demo posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoPosts();
