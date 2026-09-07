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
    slug: 'Understanding',
    title: 'Understanding',
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
];

const additionalBookPosts: BookPost[] = [
  {
    slug: 'The-Beginning',
    title: 'The Beginning',
    excerpt:
      'Every story has a beginning. This is mine - where it all started and the early memories that shaped who I am today.',
    content: `
---

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
    image: '/book/chapter-1.jpg', // Optional: Add your image to /public/book/
    author: 'Yash Siwach',
    published: true,
  },
];

const laterBookPosts: BookPost[] = [
  {
    slug: 'Ownership',
    title: 'Ownership',
    excerpt:
      "What I'm actually working toward, underneath the job title — and the other thing I've been doing for nine years that nobody on this site mentions.",
    content: `

# Ownership

My title right now is Associate Software Engineer at Accenture. It's a fine title. It also doesn't say much about what I actually spend my attention on, which is figuring out where I want to be pointed five years from now, and being honest that I don't fully know yet.

Here's what I do know. I'm moving toward DevOps and cloud architecture, on purpose, from inside the same company. Not because the job asked me to — because it's the same instinct that made me learn the schema and the API and the frontend and the deploy config for the same product instead of staying in my lane. If you own the whole stack, eventually you notice that "the whole stack" doesn't stop at the code. It keeps going into where the thing actually runs, what happens when it falls over at 3am, who gets paged. I'd rather be the person who understands that too than the person who ships a feature and hands it off into the dark.

That's the technical half. The other half is that I want to end up somewhere that blends depth with actually running things — leading, deciding, being on the hook for outcomes and not just tickets. I don't know yet if that's inside a big company, at a startup, or back to building my own thing the way I did with BlueLayer Studio for a couple of years — client sites, start to finish, my name on the invoice, nobody to blame if it broke and nobody else to thank if it worked. I'm seriously considering an MBA in the next two or three years, mostly because I keep running into the limits of learning management by just watching it happen to other people.

I don't have a five-year deck. I have a direction, and a habit of taking ownership of things nobody assigned to me, and I'm betting that habit is worth more than the deck would be.

---

## The other thing

There's a part of my life this site has never mentioned, because it doesn't fit in a stack table: I've been a competitive archer for over nine years, and I'm a certified coach — national, state and district level, certified through NSNIS Patiala under the Sports Authority of India.

I didn't pick engineering and archery for the same reasons, but I've noticed they train the same muscle. Nobody else can pull the string for you. You can have the best form in the room and still miss, and the only honest response to that is to go find out why and fix it yourself, not explain it away. That's ownership too, just with a bow in your hand instead of a keyboard.

At some point those two parts of my life stopped being separate. My archery academy needed a way to run tournaments and track athlete training that didn't live in someone's notebook, so I built it — a tournament management and training app, from schema to shader, the same way I build anything else. It's a small thing in the scheme of a portfolio, but it's the clearest proof I have that "owning the whole stack" isn't a line I say in interviews. It's just what I do when something I care about needs building.

I don't know exactly where either of these paths ends. I'm fine with that, for now.`,
    date: '2026-01-18',
    readTime: '4 min read',
    tags: ['Career', 'Ownership', 'Archery', 'Vision'],
    author: 'Yash Siwach',
    published: true,
  },
];

const allBookPosts = [...bookPosts, ...additionalBookPosts, ...laterBookPosts];

export function getBookPosts(): BookPost[] {
  return allBookPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBookPost(slug: string): BookPost | undefined {
  return allBookPosts.find(post => post.slug === slug && post.published);
}

export function getBookPostsByTag(tag: string): BookPost[] {
  return allBookPosts
    .filter(post => post.published && post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
