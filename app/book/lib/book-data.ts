export interface BookPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  image?: string;
  author: string;
  published: boolean;
}

// 📖 My Life Story - Book Chapters
// Each book post represents a chapter in your life story
// To add a new chapter, copy the template at the bottom and customize it

const bookPosts: BookPost[] = [
  {
    slug: 'chapter-1-the-beginning',
    title: 'Chapter 1: The Beginning',
    excerpt:
      'Every story has a beginning. This is mine - where it all started and the early memories that shaped who I am today.',
    content: `

  
 # Understanding

I am only able to write this because i feel that no one is going to read it and i can say anything about my life, that's the only motivation i have.

I am just a <span style="position: relative; display: inline-block;">Normal<span style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: currentColor; transform: translateY(-50%);"></span></span> guy who is trying to write about his life experiences and share wounderful weird awkward moments of my life and trust me on this i have a lot of stories to tell.
and its not a clickbate article, i am not trying to sell you anything here, its just about stories of my life.

I am not a good writer, nor am i a good storyteller. 

haven't written any blogs or even my practical files in my life this is a first time for me. 

Just a disclaimer,
I make terrible spelling mistakes and grammatical errors. So, somethings might have to guess what i mean. but i hoping you will get the feeling what i am trying to say.

Let me tell you a bit about myself and where I stand right now.

My name is Yash Siwach, a 21 years old guy who has absolutely no idea what he is doing with his life. 
I completed my Bachelor’s in Computer Applications from Chandigarh University in 2025. After that, 
I joined VIT Vellore for a master’s in Artificial Intelligence and Machine Learning, but I dropped out before the first semester ended.

Now I live with my mother and sister in Chandigarh, doing absolutely nothing.
It’s not that I am dumb or useless. On paper, I look like one of those smart guys who used to run his own web agency during college. 
lived in Gurugram for the last 8 months of my degree, worked in various companies for various roles gaining experience and learning a lot in that short span of time.

Even a week ago my last interviewer, the CEO of a company, told me that I reminded him of manager he had back in the day. and said "you have lot of potential and will do something great in my life."

He offered me a job. I said no.
Why? I still don’t know. Maybe the salary felt too low. Or maybe I was just tired of pretending I knew what I wanted.

And that brings me here.

How did I end up in this place? Why am I writing this? Why am I still here? Why am I even alive?`,

    date: '2024-10-11',
    readTime: '5 min read',
    tags: ['Life Story', 'Childhood', 'Personal', 'Origins'],
    image: '/book/chapter-1.jpg', // Optional: Add your image to /public/book/
    author: 'Yash Siwach',
    published: true,
  },
  {
    slug: 'chapter-2-the-early-days',
    title: 'Chapter 2: The Early Days',
    excerpt:
      'Every story has a beginning. This is mine - where it all started and the early memories that shaped who I am today.',
    content: `
    
   

*"Every story has a beginning. This is where mine starts."*

## The Early Days



I was born in 2004 at a government hospital in Gurugram. It doesn’t exist anymore they shifted it, demolished it, maybe buried my birth certificate with it. 
Now there’s just a gate and a parking lot, like someone deleted the “building” part of life’s code.

Anyways, let me say this clearly this is not going to be an autobiography or some deep serious book.  
This is more like a storybook, told part by part from my life.  

Everything here is simply what I remember from each incident or moment.  
So… here we go. 

to be continued...


---

*This is just the beginning of the story. There's so much more to come.*
  `,
    date: '2024-10-11',
    readTime: '5 min read',
    tags: ['Life Story', 'Childhood', 'Personal', 'Origins'],
    image: '/book/chapter-2.jpg', // Optional: Add your image to /public/book/
    author: 'Yash Siwach',
    published: true,
  },
];

export function getBookPosts(): BookPost[] {
  return bookPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBookPost(slug: string): BookPost | undefined {
  return bookPosts.find(post => post.slug === slug && post.published);
}

export function getBookPostsByTag(tag: string): BookPost[] {
  return bookPosts
    .filter(post => post.published && post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
